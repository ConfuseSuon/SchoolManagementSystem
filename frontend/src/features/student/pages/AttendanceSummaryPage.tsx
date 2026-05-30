import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Typography, MenuItem, TextField, Paper, Card, Grid, LinearProgress } from '@mui/material';
import { api } from '@/lib/axios';
import { queryKeys } from '@/lib/query-keys';

interface AttendanceSummaryItem {
  subjectId: string;
  subjectName: string;
  totalClasses: number;
  attendedClasses: number;
  percentage: number;
}

export function AttendanceSummaryPage() {
  const [academicYearId, setAcademicYearId] = useState('');

  // Fetch academic years
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

  // Fetch student attendance summary
  const { data: summary, isLoading } = useQuery({
    queryKey: queryKeys.attendance.summary({ academicYearId }),
    queryFn: async () => {
      if (!academicYearId) return [];
      const res = await api.get<AttendanceSummaryItem[]>('/attendance/my-summary', {
        params: { academicYearId },
      });
      return res.data;
    },
    enabled: !!academicYearId,
  });

  return (
    <Box>
      <Typography variant="h5" sx={styles.title}>My Attendance Summary</Typography>

      <Card sx={styles.filtersCard}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Select Academic Year"
              fullWidth
              value={academicYearId}
              onChange={(e) => setAcademicYearId(e.target.value)}
            >
              {academicYears?.map((y) => (
                <MenuItem key={y._id} value={y._id}>
                  {y.name} {y.isActive ? '(Active)' : ''}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Card>

      {!academicYearId ? (
        <Paper sx={styles.prompt}>
          <Typography color="textSecondary">Please select an academic year to load your attendance.</Typography>
        </Paper>
      ) : isLoading ? (
        <Typography>Loading attendance summary...</Typography>
      ) : !summary?.length ? (
        <Paper sx={styles.prompt}>
          <Typography color="textSecondary">No attendance records found for this academic year.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {summary.map((item) => {
            const isLow = item.percentage < 75;
            const color = isLow ? 'error' : 'success';
            const colorCode = isLow ? '#DC3545' : '#28A745';

            return (
              <Grid item xs={12} md={6} key={item.subjectId}>
                <Card sx={styles.subjectCard}>
                  <Box sx={styles.cardHeader}>
                    <Typography variant="h6" sx={styles.subjectName}>{item.subjectName}</Typography>
                    <Typography variant="h4" sx={{ ...styles.percentageText, color: colorCode }}>
                      {item.percentage}%
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary" sx={styles.classesCount}>
                    Attended: {item.attendedClasses} / {item.totalClasses} classes
                  </Typography>
                  <Box sx={styles.progressBarWrapper}>
                    <LinearProgress
                      variant="determinate"
                      value={item.percentage}
                      color={color}
                      sx={styles.progressBar}
                    />
                  </Box>
                  <Typography variant="caption" sx={{ color: colorCode, fontWeight: 600 }}>
                    {isLow ? 'Below 75% attendance criteria' : 'Meets attendance criteria'}
                  </Typography>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}

const styles = {
  title: { mb: 4, fontWeight: 700 },
  filtersCard: { p: 3, mb: 4 },
  prompt: { p: 4, textAlign: 'center' },
  subjectCard: { p: 3, borderRadius: '12px' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 },
  subjectName: { fontWeight: 600 },
  percentageText: { fontWeight: 700 },
  classesCount: { mb: 2 },
  progressBarWrapper: { mb: 1 },
  progressBar: { height: 8, borderRadius: 4 },
} as const;
