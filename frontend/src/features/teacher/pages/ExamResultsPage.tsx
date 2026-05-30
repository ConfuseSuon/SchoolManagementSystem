import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, Typography, TextField, Paper, Card, Grid, Button, Checkbox, Dialog, DialogTitle, DialogContent, DialogActions, Autocomplete } from '@mui/material';
import { DataTable } from '@/components/DataTable';
import type { Column } from '@/components/DataTable';
import { api } from '@/lib/axios';
import { useMySubjects } from '../api/get-my-subjects';
import { queryKeys } from '@/lib/query-keys';
import { useUiStore } from '@/stores/ui-store';

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

interface Enrollment {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    rollNumber?: string;
  };
}

interface ExamResult {
  studentId: string;
  marksObtained?: number;
  isAbsent: boolean;
}

export function ExamResultsPage() {
  const showToast = useUiStore((state) => state.showToast);
  const queryClient = useQueryClient();
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [academicYearId, setAcademicYearId] = useState('');
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

  // Results form state
  const [resultsForm, setResultsForm] = useState<Record<string, { marksObtained: string; isAbsent: boolean }>>({});

  // Queries
  const { data: mySubjects } = useMySubjects();

  const { data: academicYears } = useQuery({
    queryKey: queryKeys.academicYears.list(),
    queryFn: async () => {
      const res = await api.get<any[]>('/academic-years');
      return res.data;
    },
  });

  // Pre-select active academic year
  useEffect(() => {
    if (academicYears?.length) {
      const active = academicYears.find(y => y.isActive);
      if (active) setAcademicYearId(active._id);
    }
  }, [academicYears]);

  const selectedSubject = mySubjects?.find((s: any) => s._id === selectedSubjectId);
  const classId = (selectedSubject?.classId as any)?._id;

  // Fetch exams for current subject's class
  const { data: exams, isLoading: isExamsLoading } = useQuery({
    queryKey: queryKeys.exams.list({ classId, academicYearId }),
    queryFn: async () => {
      if (!classId || !academicYearId) return [];
      const res = await api.get<Exam[]>('/exams', {
        params: { classId, academicYearId },
      });
      // Filter exams to match current subject only
      return res.data.filter(e => e.subjectId?._id === selectedSubjectId);
    },
    enabled: !!classId && !!academicYearId && !!selectedSubjectId,
  });

  // Fetch Enrollments for student list
  const { data: enrollments } = useQuery({
    queryKey: queryKeys.enrollments.list({ classId, academicYearId }),
    queryFn: async () => {
      if (!classId || !academicYearId) return [];
      const res = await api.get<Enrollment[]>('/enrollments', {
        params: { classId, academicYearId },
      });
      return res.data;
    },
    enabled: !!selectedExam && !!classId && !!academicYearId,
  });

  // Fetch Existing Results
  const { data: existingResults } = useQuery({
    queryKey: queryKeys.exams.results(selectedExam?._id || ''),
    queryFn: async () => {
      if (!selectedExam) return [];
      const res = await api.get<any[]>(`/exams/${selectedExam._id}/results`);
      return res.data;
    },
    enabled: !!selectedExam,
  });

  // Load existing results into form when available
  useEffect(() => {
    if (existingResults && enrollments) {
      const initial: Record<string, { marksObtained: string; isAbsent: boolean }> = {};
      existingResults.forEach(r => {
        initial[r.studentId._id] = {
          marksObtained: r.marksObtained !== undefined ? String(r.marksObtained) : '',
          isAbsent: r.isAbsent,
        };
      });
      enrollments.forEach(e => {
        if (!initial[e.studentId._id]) {
          initial[e.studentId._id] = { marksObtained: '', isAbsent: false };
        }
      });
      setResultsForm(initial);
    }
  }, [existingResults, enrollments]);

  // Mutations
  const saveResultsMutation = useMutation({
    mutationFn: (data: { examId: string; results: ExamResult[] }) =>
      api.post(`/exams/${data.examId}/results`, { results: data.results }),
    onSuccess: () => {
      showToast('Exam results saved successfully', 'success');
      queryClient.invalidateQueries({ queryKey: queryKeys.exams.all });
      setSelectedExam(null);
    },
  });

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
    { id: 'date', label: 'Date', render: (row) => new Date(row.date).toLocaleDateString() },
    { id: 'maxMarks', label: 'Max Marks' },
    { id: 'passingMarks', label: 'Passing Marks' },
    {
      id: '_id',
      label: 'Actions',
      render: (row) => (
        <Button variant="outlined" size="small" onClick={() => handleOpenResults(row)}>
          Enter/View Marks
        </Button>
      ),
    },
  ];

  return (
    <Box>
      <Typography variant="h5" sx={styles.title}>Enter Exam Results</Typography>

      <Card sx={styles.filtersCard}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Autocomplete
              options={academicYears || []}
              getOptionLabel={(y) => `${y.name} ${y.isActive ? '(Active)' : ''}`}
              value={academicYears?.find((y) => y._id === academicYearId) || null}
              onChange={(_, newValue) => setAcademicYearId(newValue?._id || '')}
              renderInput={(params) => <TextField {...params} label="Academic Year" />}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Autocomplete
              options={mySubjects || []}
              getOptionLabel={(s: any) => `${s.name} (${(s.classId as any)?.name || 'No Class'})`}
              value={mySubjects?.find((s: any) => s._id === selectedSubjectId) || null}
              onChange={(_, newValue: any) => setSelectedSubjectId(newValue?._id || '')}
              renderInput={(params) => <TextField {...params} label="Subject / Class" />}
            />
          </Grid>
        </Grid>
      </Card>

      {!selectedSubjectId ? (
        <Paper sx={styles.prompt}>
          <Typography color="textSecondary">Please select a subject to load exams.</Typography>
        </Paper>
      ) : (
        <DataTable columns={columns} data={exams || []} isLoading={isExamsLoading} />
      )}

      {/* Enter Results Dialog */}
      <Dialog open={!!selectedExam} onClose={() => setSelectedExam(null)} fullWidth maxWidth="md">
        <DialogTitle>Enter Results: {selectedExam?.name}</DialogTitle>
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
          <Button variant="contained" color="secondary" onClick={handleSaveResults} disabled={saveResultsMutation.isPending || !enrollments?.length}>
            {saveResultsMutation.isPending ? 'Saving...' : 'Save Results'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

const styles = {
  title: { mb: 4, fontWeight: 700 },
  filtersCard: { p: 3, mb: 4 },
  prompt: { p: 4, textAlign: 'center' },
  emptyText: { py: 4, textAlign: 'center', color: 'text.secondary' },
  resultsGrid: { mt: 2 },
  resultsHeader: { borderBottom: '2px solid rgba(0,0,0,0.08)', pb: 1, mb: 2 },
  headerLabel: { fontWeight: 'bold' },
  resultRow: { py: 1, borderBottom: '1px solid rgba(0,0,0,0.04)' },
} as const;
