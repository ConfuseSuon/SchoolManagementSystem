import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Typography, MenuItem, TextField, Paper, Card, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { api } from '@/lib/axios';
import { queryKeys } from '@/lib/query-keys';

interface StudentExamResult {
  resultId: string;
  examId: string;
  examName: string;
  subjectName: string;
  maxMarks: number;
  passingMarks: number;
  marksObtained?: number;
  isAbsent: boolean;
  isPassed: boolean;
}

export function MyResultsPage() {
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

  // Fetch results
  const { data: results, isLoading } = useQuery({
    queryKey: queryKeys.exams.studentResults({ academicYearId }),
    queryFn: async () => {
      if (!academicYearId) return [];
      const res = await api.get<StudentExamResult[]>('/exams/my-results', {
        params: { academicYearId },
      });
      return res.data;
    },
    enabled: !!academicYearId,
  });

  return (
    <Box>
      <Typography variant="h5" sx={styles.title}>My Exam Results</Typography>

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
          <Typography color="textSecondary">Please select an academic year to view your exam results.</Typography>
        </Paper>
      ) : isLoading ? (
        <Typography>Loading exam results...</Typography>
      ) : !results?.length ? (
        <Paper sx={styles.prompt}>
          <Typography color="textSecondary">No exam results found for this academic year.</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={styles.headerCell}>Subject</TableCell>
                <TableCell sx={styles.headerCell}>Exam Name</TableCell>
                <TableCell sx={styles.headerCell}>Marks Obtained</TableCell>
                <TableCell sx={styles.headerCell}>Max Marks</TableCell>
                <TableCell sx={styles.headerCell}>Passing Marks</TableCell>
                <TableCell sx={styles.headerCell}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.map((result) => {
                let statusText = 'Fail';
                let statusColor = '#DC3545';
                if (result.isAbsent) {
                  statusText = 'Absent';
                  statusColor = '#FFC107';
                } else if (result.isPassed) {
                  statusText = 'Pass';
                  statusColor = '#28A745';
                }

                return (
                  <TableRow key={result.resultId} hover>
                    <TableCell sx={styles.bodyCell}>{result.subjectName}</TableCell>
                    <TableCell sx={styles.bodyCell}>{result.examName}</TableCell>
                    <TableCell sx={styles.bodyCell}>
                      {result.isAbsent ? '-' : result.marksObtained !== undefined ? result.marksObtained : '-'}
                    </TableCell>
                    <TableCell sx={styles.bodyCell}>{result.maxMarks}</TableCell>
                    <TableCell sx={styles.bodyCell}>{result.passingMarks}</TableCell>
                    <TableCell sx={{ ...styles.bodyCell, color: statusColor, fontWeight: 'bold' }}>
                      {statusText}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

const styles = {
  title: { mb: 4, fontWeight: 700 },
  filtersCard: { p: 3, mb: 4 },
  prompt: { p: 4, textAlign: 'center' },
  headerCell: { fontWeight: 'bold', borderBottom: '2px solid rgba(0,0,0,0.08)' },
  bodyCell: { py: 2 },
} as const;
