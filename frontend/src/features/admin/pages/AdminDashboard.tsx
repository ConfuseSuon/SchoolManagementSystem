import { Box, Typography, Paper, CircularProgress, Divider, Chip } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { School, Class, Person, People } from '@mui/icons-material';
import { useNotices } from '@/features/notices/api/list';
import { useAdminStats } from '../api/get-stats';
import { useAuthStore } from '@/stores/auth-store';

export function AdminDashboard() {
  const { data: statsData, isLoading: statsLoading } = useAdminStats({ staleTime: 0, gcTime: 0, refetchOnMount: 'always' });
  const { data: noticesData, isLoading: noticesLoading } = useNotices(1, { staleTime: 0, gcTime: 0, refetchOnMount: 'always' });
  const user = useAuthStore((state) => state.user);

  const isLoading = statsLoading || noticesLoading;

  if (isLoading) {
    return (
      <Box sx={styles.loader}>
        <CircularProgress />
      </Box>
    );
  }

  const adminName = (user as any)?.name || 'Admin';

  const stats = [
    {
      label: 'Schools',
      count: statsData?.totalSchools ?? 0,
      icon: <School sx={{ fontSize: 72 }} />,
      size: { xs: 12, sm: 6, md: 3 },
    },
    {
      label: 'Classes',
      count: statsData?.totalClasses ?? 0,
      icon: <Class sx={{ fontSize: 72 }} />,
      size: { xs: 12, sm: 6, md: 3 },
    },
    {
      label: 'Teachers',
      count: statsData?.totalTeachers ?? 0,
      icon: <Person sx={{ fontSize: 72 }} />,
      size: { xs: 12, sm: 6, md: 3 },
    },
    {
      label: 'Students',
      count: statsData?.totalStudents ?? 0,
      icon: <People sx={{ fontSize: 72 }} />,
      size: { xs: 12, sm: 6, md: 3 },
    },
  ];

  const notices = noticesData?.data || [];
  const recentNotices = [...notices]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <Box sx={styles.container}>
      <Box sx={styles.header}>
        <Typography variant="h4" sx={styles.headerTitle}>
          Welcome back, {adminName}.
        </Typography>
        <Typography variant="body1" sx={styles.headerSubtitle}>
          Overview of your school's data.
        </Typography>
      </Box>

      <Grid container spacing={3} sx={styles.statsGrid}>
        {stats.map((stat, idx) => (
          <Grid size={stat.size} key={idx}>
            <Paper
              elevation={0}
              sx={styles.statCard}
            >
              <Box sx={styles.statCardContent}>
                <Box>
                  <Typography variant="h3" sx={styles.statNumber}>
                    {stat.count}
                  </Typography>

                  <Typography sx={styles.statLabel}>
                    {stat.label}
                  </Typography>
                </Box>

                <Box sx={styles.watermarkIcon}>
                  {stat.icon}
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper sx={styles.noticesContainer} elevation={0}>
        <Box sx={styles.noticesHeader}>
          <Box sx={styles.titleAccent} />
          <Typography variant="h6" sx={styles.noticesTitle}>
            Recent Notices
          </Typography>
        </Box>

        {recentNotices.length > 0 ? (
          <Box sx={styles.noticesList}>
            {recentNotices.map((notice, idx) => (
              <Box key={notice._id}>
                <Box sx={styles.noticeItem}>
                  <Typography sx={styles.noticeTitle}>
                    {notice.title}
                  </Typography>
                  <Chip
                    label={new Date(notice.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    size="small"
                    variant="outlined"
                    sx={styles.noticeDateChip}
                  />
                </Box>
                {idx < recentNotices.length - 1 && <Divider sx={styles.divider} />}
              </Box>
            ))}
          </Box>
        ) : (
          <Typography sx={styles.emptyNotices}>No recent notices available.</Typography>
        )}
      </Paper>
    </Box>
  );
}

const styles = {
  loader: { display: 'flex', justifyContent: 'center', mt: 10 },

  container: { maxWidth: 1400, mx: 'auto' },
  header: { mb: 4 },
  headerTitle: { fontWeight: 800, letterSpacing: '-1px', color: 'text.primary', mb: 0.5, fontSize: '2rem' },
  headerSubtitle: { color: 'text.secondary' },

  statsGrid: { mb: 6 },

  statCard: {
    position: 'relative',
    p: 3.5,
    borderRadius: '22px',
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.paper',
    overflow: 'hidden',
    minHeight: 160,

    boxShadow: (theme: any) =>
      theme.palette.mode === 'light'
        ? '0 1px 2px rgba(0,0,0,0.03), 0 12px 32px rgba(0,0,0,0.02)'
        : 'none',

    transition: 'all 220ms cubic-bezier(0.25, 1, 0.5, 1)',

    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 24,
      right: 24,
      height: 3,
      borderRadius: 999,
    },

    '&:hover': {
      transform: 'translateY(-1px)',
      boxShadow: (theme: any) =>
        theme.palette.mode === 'light'
          ? '0 4px 12px rgba(0,0,0,0.04), 0 20px 40px rgba(0,0,0,0.04)'
          : 'none',
    },
  },

  statCardContent: {
    height: '100%',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    position: 'relative',
    zIndex: 1,
  },
  statNumber: {
    fontWeight: 800,
    color: 'text.primary',
    letterSpacing: '-2px',
    lineHeight: 1,
    fontSize: 'clamp(2.8rem, 5vw, 4rem)',
    mb: 1,
  },
  statLabel: {
    color: 'text.secondary',
    fontWeight: 500,
    fontSize: '0.95rem',
    letterSpacing: '-0.01em',
  },
  watermarkIcon: {
    position: 'absolute',
    bottom: -8,
    right: -6,
    opacity: 0.05,
    color: 'text.primary',
    pointerEvents: 'none',

    '& svg': {
      fontSize: '72px !important',
    },
  },

  noticesContainer: {
    bgcolor: 'background.paper',
    borderRadius: '16px',
    border: '1px solid',
    borderColor: 'divider',
    p: 3,
  },
  noticesHeader: { display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 },
  titleAccent: { width: 4, height: 18, borderRadius: 1, bgcolor: '#0066CC' },
  noticesTitle: { fontWeight: 700, color: 'text.primary', letterSpacing: '-0.3px' },

  noticesList: { display: 'flex', flexDirection: 'column' },
  noticeItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    py: 2,
    px: 1.5,
    borderRadius: '8px',
    transition: 'background-color 150ms ease',
    '&:hover': {
      bgcolor: 'action.hover',
    },
  },
  noticeTitle: { fontWeight: 600, color: 'text.primary', fontSize: '0.95rem' },
  noticeDateChip: { borderColor: 'divider', color: 'text.secondary', fontWeight: 500 },
  divider: { my: 1, borderColor: 'divider' },
  emptyNotices: { color: 'text.secondary', py: 2, px: 1.5 },
} as const;