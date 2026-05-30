import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, Typography, Button, TextField, Paper, Card, Grid, Radio, RadioGroup, FormControlLabel, Autocomplete } from '@mui/material';
import { api } from '@/lib/axios';
import { useMySubjects } from '../api/get-my-subjects';
import { queryKeys } from '@/lib/query-keys';
import { useUiStore } from '@/stores/ui-store';

interface Enrollment {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    rollNumber?: string;
  };
}

export function MarkAttendancePage() {
  const showToast = useUiStore((state) => state.showToast);
  const queryClient = useQueryClient();
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [academicYearId, setAcademicYearId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Track attendance selections: studentId -> status
  const [attendance, setAttendance] = useState<Record<string, 'Present' | 'Absent' | 'Late' | 'HalfDay'>>({});

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

  // Fetch students enrolled in selected class
  const { data: enrollments, isLoading } = useQuery({
    queryKey: queryKeys.enrollments.list({ classId, academicYearId }),
    queryFn: async () => {
      if (!classId || !academicYearId) return [];
      const res = await api.get<Enrollment[]>('/enrollments', {
        params: { classId, academicYearId },
      });
      return res.data;
    },
    enabled: !!classId && !!academicYearId,
  });

  // Fetch existing attendance to pre-fill
  const { data: existingAttendance } = useQuery({
    queryKey: queryKeys.attendance.list({ classId, subjectId: selectedSubjectId, academicYearId, date }),
    queryFn: async () => {
      if (!classId || !selectedSubjectId || !academicYearId || !date) return [];
      const res = await api.get<any[]>('/attendance', {
        params: { classId, subjectId: selectedSubjectId, academicYearId, date },
      });
      return res.data;
    },
    enabled: !!classId && !!selectedSubjectId && !!academicYearId && !!date,
  });

  // Update attendance state when existingAttendance loads
  useEffect(() => {
    if (existingAttendance && enrollments) {
      const initial: Record<string, 'Present' | 'Absent' | 'Late' | 'HalfDay'> = {};
      // Fill from existing
      existingAttendance.forEach((rec: any) => {
        initial[rec.studentId._id] = rec.status;
      });
      // Fallback remaining to Present
      enrollments.forEach((e: Enrollment) => {
        if (!initial[e.studentId._id]) {
          initial[e.studentId._id] = 'Present';
        }
      });
      setAttendance(initial);
    }
  }, [existingAttendance, enrollments]);

  const submitMutation = useMutation({
    mutationFn: (data: any) => api.post('/attendance', data),
    onSuccess: () => {
      showToast('Attendance saved successfully', 'success');
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.all });
    },
  });

  const handleStatusChange = (studentId: string, status: any) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAll = (status: 'Present' | 'Absent' | 'Late' | 'HalfDay') => {
    if (!enrollments) return;
    const updated = { ...attendance };
    enrollments.forEach(e => {
      updated[e.studentId._id] = status;
    });
    setAttendance(updated);
  };

  const handleSubmit = () => {
    if (!selectedSubjectId || !classId || !academicYearId || !date || !enrollments) return;
    const records = enrollments.map(e => ({
      studentId: e.studentId._id,
      status: attendance[e.studentId._id] || 'Present',
    }));
    submitMutation.mutate({
      subjectId: selectedSubjectId,
      classId,
      academicYearId,
      date,
      records,
    });
  };

  return (
    <Box>
      <Typography variant="h5" sx={styles.title}>Mark Attendance</Typography>

      <Card sx={styles.filtersCard}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Autocomplete
              options={academicYears || []}
              getOptionLabel={(y: any) => `${y.name} ${y.isActive ? '(Active)' : ''}`}
              value={academicYears?.find((y: any) => y._id === academicYearId) || null}
              onChange={(_, newValue: any) => setAcademicYearId(newValue?._id || '')}
              renderInput={(params) => <TextField {...params} label="Academic Year" />}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Autocomplete
              options={mySubjects || []}
              getOptionLabel={(s: any) => `${s.name} (${(s.classId as any)?.name || 'No Class'})`}
              value={mySubjects?.find((s: any) => s._id === selectedSubjectId) || null}
              onChange={(_, newValue: any) => setSelectedSubjectId(newValue?._id || '')}
              renderInput={(params) => <TextField {...params} label="Subject / Class" />}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              type="date"
              label="Date"
              InputLabelProps={{ shrink: true }}
              fullWidth
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Grid>
        </Grid>
      </Card>

      {!selectedSubjectId ? (
        <Paper sx={styles.prompt}>
          <Typography color="textSecondary">Please select a subject to load enrolled students.</Typography>
        </Paper>
      ) : isLoading ? (
        <Typography>Loading students...</Typography>
      ) : !enrollments?.length ? (
        <Paper sx={styles.prompt}>
          <Typography color="textSecondary">No students enrolled in this class.</Typography>
        </Paper>
      ) : (
        <Box>
          <Box sx={styles.bulkActions}>
            <Button variant="outlined" size="small" onClick={() => handleMarkAll('Present')}>Mark All Present</Button>
            <Button variant="outlined" size="small" onClick={() => handleMarkAll('Absent')} color="error">Mark All Absent</Button>
            <Button variant="outlined" size="small" onClick={() => handleMarkAll('Late')} color="warning">Mark All Late</Button>
          </Box>
          <Paper sx={styles.tableContainer}>
            <Grid container spacing={2} sx={styles.tableHeader}>
              <Grid item xs={4}><Typography variant="subtitle2" sx={styles.headerLabel}>Student Name</Typography></Grid>
              <Grid item xs={3}><Typography variant="subtitle2" sx={styles.headerLabel}>Roll Number</Typography></Grid>
              <Grid item xs={5}><Typography variant="subtitle2" sx={styles.headerLabel}>Status</Typography></Grid>
            </Grid>
            {enrollments.map((e) => {
              const student = e.studentId;
              const currentStatus = attendance[student._id] || 'Present';
              return (
                <Grid container spacing={2} alignItems="center" key={student._id} sx={styles.row}>
                  <Grid item xs={4}><Typography>{student.name}</Typography></Grid>
                  <Grid item xs={3}><Typography>{student.rollNumber || '-'}</Typography></Grid>
                  <Grid item xs={5}>
                    <RadioGroup
                      row
                      value={currentStatus}
                      onChange={(ev) => handleStatusChange(student._id, ev.target.value)}
                    >
                      <FormControlLabel value="Present" control={<Radio size="small" />} label="Present" />
                      <FormControlLabel value="Absent" control={<Radio size="small" color="error" />} label="Absent" />
                      <FormControlLabel value="Late" control={<Radio size="small" color="warning" />} label="Late" />
                      <FormControlLabel value="HalfDay" control={<Radio size="small" />} label="Half-day" />
                    </RadioGroup>
                  </Grid>
                </Grid>
              );
            })}
          </Paper>
          <Box sx={styles.actions}>
            <Button variant="contained" color="secondary" size="large" onClick={handleSubmit} disabled={submitMutation.isPending}>
              {submitMutation.isPending ? 'Saving...' : 'Submit Attendance'}
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}

const styles = {
  title: { mb: 4, fontWeight: 700 },
  filtersCard: { p: 3, mb: 4 },
  prompt: { p: 4, textAlign: 'center' },
  bulkActions: { display: 'flex', gap: 2, mb: 2 },
  tableContainer: { p: 3 },
  tableHeader: { borderBottom: '2px solid rgba(0,0,0,0.08)', pb: 1, mb: 2 },
  headerLabel: { fontWeight: 'bold' },
  row: { py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.04)' },
  actions: { mt: 4, display: 'flex', justifyContent: 'flex-end' },
} as const;
