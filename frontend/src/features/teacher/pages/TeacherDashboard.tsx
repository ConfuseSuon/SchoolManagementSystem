import { Box, Typography, CircularProgress, Chip, List, ListItem, Divider } from '@mui/material';
import { useTeacherProfile } from '../api/get-profile';
import { useMySubjects } from '../api/get-my-subjects';
import type { AcademicClass } from '../../academic-classes/types';

export function TeacherDashboard() {
  const { data: profile, isLoading: profileLoading } = useTeacherProfile({ staleTime: 0, gcTime: 0, refetchOnMount: 'always' });
  const { data: subjects, isLoading: subjectsLoading } = useMySubjects({ staleTime: 0, gcTime: 0, refetchOnMount: 'always' });

  if (profileLoading || subjectsLoading) {
    return (
      <Box sx={styles.loader}>
        <CircularProgress />
      </Box>
    );
  }

  const hours = new Date().getHours();
  const greeting = hours < 12 ? 'Good morning' : hours < 18 ? 'Good afternoon' : 'Good evening';

  const uniqueClasses = Array.from(new Set(subjects?.map(s => {
    if (typeof s.classId === 'object' && s.classId !== null) {
      return (s.classId as AcademicClass).name;
    }
    return String(s.classId);
  }))) || [];

  return (
    <Box sx={styles.root}>
      <Box sx={styles.headerBox}>
        <Typography variant="h4" sx={styles.greeting}>
          {greeting}, {profile?.name || 'Teacher'}
        </Typography>
      </Box>

      <Box sx={styles.chipsBox}>
        <Chip label={`${subjects?.length || 0} Subjects assigned`} sx={styles.chip} />
        <Chip label={`${uniqueClasses.length || 0} Classes`} sx={styles.chip} />
      </Box>

      <Box sx={styles.subjectSection}>
        <Typography variant="h6" sx={styles.sectionTitle}>
          Assigned Subjects
        </Typography>
        <Box sx={styles.subjectCard}>
          {subjects?.length ? (
            <List disablePadding>
              {subjects.map((s, idx) => (
                <Box key={s._id}>
                  <ListItem sx={styles.listItem}>
                    <Typography sx={styles.subjectName}>{s.name}</Typography>
                    {s.code && (
                      <Chip label={s.code} size="small" sx={styles.codeChip} />
                    )}
                  </ListItem>
                  {idx < subjects.length - 1 && <Divider sx={styles.divider} />}
                </Box>
              ))}
            </List>
          ) : (
            <Typography sx={styles.emptyText}>No subjects assigned.</Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}

const styles = {
  loader: { display: 'flex', justifyContent: 'center', mt: 10 },
  root: { maxWidth: 1000, mx: 'auto' },
  headerBox: { mb: 4 },
  greeting: { fontWeight: 800, color: 'text.primary', letterSpacing: '-0.5px', mb: 0.5 },
  chipsBox: { display: 'flex', flexWrap: 'wrap', gap: 2, mb: 6 },
  chip: {
    borderRadius: 1.5,
    px: 1,
    py: 2,
    bgcolor: (theme: any) => theme.palette.mode === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)',
    fontWeight: 600,
    color: 'text.primary',
    border: '1px solid',
    borderColor: 'divider',
  },
  subjectSection: { mb: 3 },
  sectionTitle: { fontWeight: 700, color: 'text.primary', letterSpacing: '-0.3px', mb: 2 },
  subjectCard: { border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper', overflow: 'hidden' },
  listItem: { py: 2.5, px: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  subjectName: { fontWeight: 600, color: 'text.primary', fontSize: '0.95rem' },
  codeChip: {
    fontFamily: 'monospace',
    fontWeight: 600,
    bgcolor: (theme: any) => theme.palette.mode === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)',
    color: 'text.secondary',
    borderRadius: 1,
    px: 0.5,
  },
  divider: { borderColor: 'divider' },
  emptyText: { p: 3, color: 'text.secondary' },
} as const;
