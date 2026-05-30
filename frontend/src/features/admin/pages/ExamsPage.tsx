import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Card, Grid, Checkbox, Autocomplete } from '@mui/material';
import { DataTable } from '@/components/DataTable';
import type { Column } from '@/components/DataTable';
import { api } from '@/lib/axios';
import { useClasses } from '@/lib/shared-queries';
import { queryKeys } from '@/lib/query-keys';
import { AsyncSearchSelect } from '@/components/AsyncSearchSelect';

interface Exam {
  _id: string;
  name: string;
  subjectId: { _id: string; name: string };
  classId: { _id: string; name: string };
  academicYearId: string;
  date: string;
  maxMarks: number;
  passingMarks: number;
}

interface Student {
  _id: string;
  name: string;
  rollNumber?: string;
}

interface Enrollment {
  _id: string;
  studentId: Student;
}

interface ExamResult {
  studentId: string;
  marksObtained?: number;
  isAbsent: boolean;
}

export function ExamsPage() {
  const queryClient = useQueryClient();
  const [classId, setClassId] = useState('');
  const [academicYearId, setAcademicYearId] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

  // Results form state
  const [resultsForm, setResultsForm] = useState<Record<string, { marksObtained: string; isAbsent: boolean }>>({});

  // Fetch filters data
  const { data: classes } = useClasses();

  const { data: academicYears } = useQuery({
    queryKey: queryKeys.academicYears.list(),
    queryFn: async () => {
      const res = await api.get<any[]>('/academic-years');
      return res.data;
    },
  });

  const { data: subjects } = useQuery({
    queryKey: ['subjects-list-all'],
    queryFn: async () => {
      const res = await api.get<any>('/subjects');
      return res || [];
    },
  });

  // Fetch Exams list
  const { data: exams, isLoading } = useQuery({
    queryKey: queryKeys.exams.list({ classId, academicYearId }),
    queryFn: async () => {
      const res = await api.get<Exam[]>('/exams', {
        params: { classId, academicYearId },
      });
      return res.data;
    },
  });

  // Fetch Enrollments for current exam's class
  const { data: enrollments } = useQuery({
    queryKey: queryKeys.enrollments.list({ classId: selectedExam?.classId?._id, academicYearId: selectedExam?.academicYearId }),
    queryFn: async () => {
      if (!selectedExam) return [];
      const res = await api.get<Enrollment[]>('/enrollments', {
        params: { classId: selectedExam.classId._id, academicYearId: selectedExam.academicYearId },
      });
      return res.data;
    },
    enabled: !!selectedExam,
  });

  // Fetch Existing Results for current exam
  useQuery({
    queryKey: queryKeys.exams.results(selectedExam?._id || ''),
    queryFn: async () => {
      if (!selectedExam) return [];
      const res = await api.get<any[]>(`/exams/${selectedExam._id}/results`);
      return res.data;
    },
    enabled: !!selectedExam,
    meta: {
      onSuccess: (data: any[]) => {
        // Pre-fill resultsForm
        const initialForm: Record<string, { marksObtained: string; isAbsent: boolean }> = {};
        data.forEach(r => {
          initialForm[r.studentId._id] = {
            marksObtained: r.marksObtained !== undefined ? String(r.marksObtained) : '',
            isAbsent: r.isAbsent,
          };
        });
        setResultsForm(initialForm);
      }
    }
  });

  // Mutations
  const createExamMutation = useMutation({
    mutationFn: (data: any) => api.post('/exams', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.exams.all });
      setIsCreateOpen(false);
    },
  });

  const saveResultsMutation = useMutation({
    mutationFn: (data: { examId: string; results: ExamResult[] }) =>
      api.post(`/exams/${data.examId}/results`, { results: data.results }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.exams.all });
      setSelectedExam(null);
    },
  });

  const createForm = useForm({
    defaultValues: { name: '', subjectId: '', classId: '', academicYearId: '', date: '', maxMarks: 100, passingMarks: 33 },
  });

  const onSubmitCreate = (data: any) => {
    createExamMutation.mutate(data);
  };

  const handleOpenResults = (exam: Exam) => {
    setSelectedExam(exam);
    setResultsForm({});
  };

  const handleResultChange = (studentId: string, field: 'marksObtained' | 'isAbsent', value: any) => {
    setResultsForm(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const handleSaveResults = () => {
    if (!selectedExam || !enrollments) return;
    const payload: ExamResult[] = enrollments.map(e => {
      const studentId = e.studentId._id;
      const state = resultsForm[studentId] || { marksObtained: '', isAbsent: false };
      return {
        studentId,
        isAbsent: state.isAbsent,
        marksObtained: state.isAbsent || state.marksObtained === '' ? undefined : Number(state.marksObtained),
      };
    });
    saveResultsMutation.mutate({ examId: selectedExam._id, results: payload });
  };

  const columns: Column<Exam>[] = [
    { id: 'name', label: 'Exam Name' },
    { id: 'subjectId', label: 'Subject', render: (row) => row.subjectId?.name || 'N/A' },
    { id: 'classId', label: 'Class', render: (row) => row.classId?.name || 'N/A' },
    { id: 'date', label: 'Date', render: (row) => new Date(row.date).toLocaleDateString() },
    { id: 'maxMarks', label: 'Max Marks' },
    { id: 'passingMarks', label: 'Passing Marks' },
    {
      id: '_id',
      label: 'Actions',
      render: (row) => (
        <Button variant="outlined" size="small" onClick={() => handleOpenResults(row)}>
          Enter/View Results
        </Button>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={styles.header}>
        <Typography variant="h4">Exams</Typography>
        <Button variant="contained" onClick={() => { createForm.reset(); setIsCreateOpen(true); }}>
          Add Exam
        </Button>
      </Box>

      <Card sx={styles.filtersCard}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Autocomplete
              options={academicYears || []}
              getOptionLabel={(y) => `${y.name} ${y.isActive ? '(Active)' : ''}`}
              value={academicYears?.find((y) => y._id === academicYearId) || null}
              onChange={(_, newValue) => setAcademicYearId(newValue?._id || '')}
              renderInput={(params) => <TextField {...params} label="Filter by Academic Year" />}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Autocomplete
              options={classes?.data || []}
              getOptionLabel={(c) => c.name}
              value={classes?.data?.find((c) => c._id === classId) || null}
              onChange={(_, newValue) => setClassId(newValue?._id || '')}
              renderInput={(params) => <TextField {...params} label="Filter by Class" />}
            />
          </Grid>
        </Grid>
      </Card>

      <DataTable columns={columns} data={exams || []} isLoading={isLoading} />

      {/* Create Exam Dialog */}
      <Dialog open={isCreateOpen} onClose={() => setIsCreateOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create Exam</DialogTitle>
        <Box component="form" onSubmit={createForm.handleSubmit(onSubmitCreate)}>
          <DialogContent sx={styles.modalContent}>
            <Controller
              name="name"
              control={createForm.control}
              rules={{ required: 'Name is required' }}
              render={({ field, fieldState }) => (
                <TextField {...field} label="Exam Name" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} />
              )}
            />
            <AsyncSearchSelect
              name="academicYearId"
              control={createForm.control}
              label="Academic Year"
              placeholder="Type to search academic year..."
              minChars={0}
              fetchFn={async (query) => {
                const list = academicYears || [];
                return list.filter((y: any) =>
                  y.name.toLowerCase().includes(query.toLowerCase())
                );
              }}
              getOptionLabel={(option: any) => option.name}
            />
            <AsyncSearchSelect
              name="classId"
              control={createForm.control}
              label="Class"
              placeholder="Type to search class..."
              minChars={0}
              fetchFn={async (query) => {
                const list = classes?.data || [];
                return list.filter((c: any) =>
                  c.name.toLowerCase().includes(query.toLowerCase())
                );
              }}
              getOptionLabel={(option: any) => option.name}
            />
            <AsyncSearchSelect
              name="subjectId"
              control={createForm.control}
              label="Subject"
              placeholder="Type to search subject..."
              minChars={0}
              fetchFn={async (query) => {
                const list = subjects?.data || [];
                return list.filter((s: any) =>
                  s.name.toLowerCase().includes(query.toLowerCase())
                );
              }}
              getOptionLabel={(option: any) => `${option.name} (${option.code})`}
            />
            <Controller
              name="date"
              control={createForm.control}
              rules={{ required: 'Date is required' }}
              render={({ field, fieldState }) => (
                <TextField {...field} type="date" label="Date" InputLabelProps={{ shrink: true }} fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} />
              )}
            />
            <Controller
              name="maxMarks"
              control={createForm.control}
              rules={{ required: 'Max Marks is required' }}
              render={({ field, fieldState }) => (
                <TextField {...field} type="number" label="Max Marks" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} />
              )}
            />
            <Controller
              name="passingMarks"
              control={createForm.control}
              rules={{ required: 'Passing Marks is required' }}
              render={({ field, fieldState }) => (
                <TextField {...field} type="number" label="Passing Marks" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} />
              )}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={createExamMutation.isPending}>Save</Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Enter Results Dialog */}
      <Dialog open={!!selectedExam} onClose={() => setSelectedExam(null)} fullWidth maxWidth="md">
        <DialogTitle>Enter/View Results: {selectedExam?.name}</DialogTitle>
        <DialogContent>
          {!enrollments?.length ? (
            <Typography sx={styles.emptyText}>No students enrolled in this class.</Typography>
          ) : (
            <Box sx={styles.resultsGrid}>
              <Grid container spacing={2} sx={styles.resultsHeader}>
                <Grid item xs={4}><Typography variant="subtitle2" sx={styles.headerLabel}>Student Name</Typography></Grid>
                <Grid item xs={3}><Typography variant="subtitle2" sx={styles.headerLabel}>Roll Number</Typography></Grid>
                <Grid item xs={3}><Typography variant="subtitle2" sx={styles.headerLabel}>Marks Obtained</Typography></Grid>
                <Grid item xs={2}><Typography variant="subtitle2" sx={styles.headerLabel}>Absent</Typography></Grid>
              </Grid>
              {enrollments.map((e) => {
                const student = e.studentId;
                const state = resultsForm[student._id] || { marksObtained: '', isAbsent: false };


                return (
                  <Grid container spacing={2} alignItems="center" key={student._id} sx={styles.resultRow}>
                    <Grid item xs={4}><Typography>{student.name}</Typography></Grid>
                    <Grid item xs={3}><Typography>{student.rollNumber || '-'}</Typography></Grid>
                    <Grid item xs={3}>
                      <TextField
                        size="small"
                        type="number"
                        placeholder={`Max: ${selectedExam?.maxMarks}`}
                        disabled={state.isAbsent}
                        value={state.marksObtained}
                        onChange={(ev) => handleResultChange(student._id, 'marksObtained', ev.target.value)}
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <Checkbox
                        checked={state.isAbsent}
                        onChange={(ev) => handleResultChange(student._id, 'isAbsent', ev.target.checked)}
                      />
                    </Grid>
                  </Grid>
                );
              })}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedExam(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveResults} disabled={saveResultsMutation.isPending || !enrollments?.length}>
            {saveResultsMutation.isPending ? 'Saving...' : 'Save Results'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', mb: 4 },
  filtersCard: { p: 3, mb: 4 },
  modalContent: { display: 'flex', flexDirection: 'column', gap: 2, pt: 1 },
  emptyText: { py: 4, textAlign: 'center', color: 'text.secondary' },
  resultsGrid: { mt: 2 },
  resultsHeader: { borderBottom: '2px solid rgba(0,0,0,0.08)', pb: 1, mb: 2 },
  headerLabel: { fontWeight: 'bold' },
  resultRow: { py: 1, borderBottom: '1px solid rgba(0,0,0,0.04)' },
} as const;
