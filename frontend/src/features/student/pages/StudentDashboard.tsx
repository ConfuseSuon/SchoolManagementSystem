import { Box, Typography, CircularProgress, Chip } from '@mui/material';
import { useStudentProfile } from '../api/get-profile';
import { useMyNotices } from '../api/get-my-notices';
import { useMyComplains } from '../api/get-my-complains';
import type { AcademicClass } from '@/features/academic-classes/types';

export function StudentDashboard() {
  const { data: profile, isLoading: profileLoading } = useStudentProfile({ staleTime: 0, gcTime: 0, refetchOnMount: 'always' });
  const { data: noticesData, isLoading: noticesLoading } = useMyNotices(1, { staleTime: 0, gcTime: 0, refetchOnMount: 'always' });
  const { data: complainsData, isLoading: complainsLoading } = useMyComplains(1, { staleTime: 0, gcTime: 0, refetchOnMount: 'always' });

  if (profileLoading || noticesLoading || complainsLoading) {
    return (
      <Box sx={styles.loader}>
        <CircularProgress />
      </Box>
    );
  }

  const hours = new Date().getHours();
  const greeting = hours < 12 ? 'Good morning' : hours < 18 ? 'Good afternoon' : 'Good evening';

  const className = (profile?.classId as AcademicClass)?.name || 'Not assigned';

  return (
    <Box sx={styles.root}>
      <Box sx={styles.headerBox}>
        <Typography variant="h4" sx={styles.greeting}>
          {greeting}, {profile?.name || 'Student'}
        </Typography>
        <Typography variant="body1" sx={styles.className}>
          Class: {className}
        </Typography>
      </Box>

      <Box sx={styles.chipsBox}>
        <Chip
          label={`${noticesData?.meta?.total || noticesData?.data?.length || 0} Notices`}
          sx={styles.chip}
        />
        <Chip
          label={`${complainsData?.meta?.total ?? 0} Complaints`}
          sx={styles.chip}
        />
      </Box>
    </Box>
  );
}

const styles = {
  loader: { display: 'flex', justifyContent: 'center', mt: 10 },
  root: { maxWidth: 1000, mx: 'auto' },
  headerBox: { mb: 4 },
  greeting: { fontWeight: 800, color: 'text.primary', letterSpacing: '-0.5px', mb: 0.5 },
  className: { color: 'text.secondary', fontWeight: 500 },
  chipsBox: { display: 'flex', flexWrap: 'wrap', gap: 2, mb: 6 },
  chip: { borderRadius: 1.5, px: 1, py: 2, bgcolor: 'rgba(0,0,0,0.04)', fontWeight: 600, color: 'text.primary', border: '1px solid rgba(0,0,0,0.06)' },
} as const;
