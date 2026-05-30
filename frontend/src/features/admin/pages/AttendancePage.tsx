import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Typography, TextField, Paper, Card, Grid, Autocomplete } from '@mui/material';
import { DataTable } from '@/components/DataTable';
import type { Column } from '@/components/DataTable';
import { api } from '@/lib/axios';
import { useClasses } from '@/lib/shared-queries';
import { queryKeys } from '@/lib/query-keys';

interface AttendanceRecord {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    rollNumber?: string;
  };
  status: 'Present' | 'Absent' | 'Late' | 'HalfDay';
}

export function AttendancePage() {
  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [academicYearId, setAcademicYearId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Queries
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

  const { data: records, isLoading } = useQuery({
    queryKey: queryKeys.attendance.list({ classId, subjectId, academicYearId, date }),
    queryFn: async () => {
      if (!classId || !subjectId || !academicYearId || !date) return [];
      const res = await api.get<AttendanceRecord[]>('/attendance', {
        params: { classId, subjectId, academicYearId, date },
      });
      return res.data;
    },
    enabled: !!classId && !!subjectId && !!academicYearId && !!date,
  });

  const columns: Column<AttendanceRecord>[] = [
    { id: 'studentId', label: 'Student Name', render: (row) => row.studentId?.name || 'N/A' },
    { id: 'studentId', label: 'Roll Number', render: (row) => row.studentId?.rollNumber || '-' },
    { id: 'status', label: 'Status', render: (row) => row.status },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={styles.title}>Attendance View</Typography>

      <Card sx={styles.filtersCard}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <Autocomplete
              options={academicYears || []}
              getOptionLabel={(y) => `${y.name} ${y.isActive ? '(Active)' : ''}`}
              value={academicYears?.find((y) => y._id === academicYearId) || null}
              onChange={(_, newValue) => setAcademicYearId(newValue?._id || '')}
              renderInput={(params) => <TextField {...params} label="Academic Year" />}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Autocomplete
              options={classes?.data || []}
              getOptionLabel={(c) => c.name}
              value={classes?.data?.find((c) => c._id === classId) || null}
              onChange={(_, newValue) => setClassId(newValue?._id || '')}
              renderInput={(params) => <TextField {...params} label="Class" />}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Autocomplete
              options={subjects?.data || []}
              getOptionLabel={(s: any) => `${s.name} (${s.code})`}
              value={subjects?.data?.find((s: any) => s._id === subjectId) || null}
              onChange={(_, newValue: any) => setSubjectId(newValue?._id || '')}
              renderInput={(params) => <TextField {...params} label="Subject" />}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
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

      {(!classId || !subjectId || !academicYearId || !date) ? (
        <Paper sx={styles.prompt}>
          <Typography color="textSecondary">Please select Academic Year, Class, Subject, and Date to view attendance.</Typography>
        </Paper>
      ) : (
        <DataTable columns={columns} data={records || []} isLoading={isLoading} />
      )}
    </Box>
  );
}

const styles = {
  title: { mb: 4 },
  filtersCard: { p: 3, mb: 4 },
  prompt: { p: 4, textAlign: 'center' },
} as const;
