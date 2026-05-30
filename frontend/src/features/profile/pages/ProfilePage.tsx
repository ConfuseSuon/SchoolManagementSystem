import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, Typography, Avatar, Grid, Divider, Box, CircularProgress } from '@mui/material';
import { useAuthStore } from '@/stores/auth-store';
import { api } from '@/lib/axios';

interface ProfileData {
  name: string;
  email?: string;
  phone?: string;
  gender?: string;
  rollNumber?: string;
  classId?: any;
  subjectIds?: any[];
  classIds?: any[];
}

export function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const roleName = user?.role || 'User';

  const { data: profile, isLoading } = useQuery<ProfileData>({
    queryKey: ['user-profile', user?.sub, roleName],
    queryFn: async () => {
      if (!user) return null;
      if (roleName === 'Admin') {
        const res = await api.get<any>('/admins/profile');
        return res.data;
      } else if (roleName === 'Teacher') {
        const res = await api.get<any>('/teachers/me');
        return res.data;
      } else if (roleName === 'Student') {
        const res = await api.get<any>('/students/me');
        return res.data;
      }
      return null;
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <Box sx={styles.loadingContainer}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  const displayName = profile?.name || `${roleName} User`;
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <Box sx={styles.container}>
      <Typography variant="h4" sx={styles.pageTitle}>
        My Profile
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card sx={styles.avatarCard}>
            <CardContent sx={styles.avatarContent}>
              <Avatar sx={styles.avatar}>{initials}</Avatar>
              <Typography variant="h5" sx={styles.name}>
                {displayName}
              </Typography>
              <Typography sx={styles.roleLabel}>{roleName}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={styles.detailsCard}>
            <CardContent sx={styles.detailsContent}>
              <Typography variant="h6" sx={styles.sectionTitle}>
                Account Details
              </Typography>
              <Divider sx={styles.divider} />

              <Grid container spacing={2} sx={styles.infoGrid}>
                <Grid item xs={6}>
                  <Typography sx={styles.label}>Email Address</Typography>
                  <Typography sx={styles.value}>{profile?.email || 'N/A'}</Typography>
                </Grid>

                {roleName !== 'Admin' && (
                  <>
                    <Grid item xs={6}>
                      <Typography sx={styles.label}>Phone Number</Typography>
                      <Typography sx={styles.value}>{profile?.phone || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography sx={styles.label}>Gender</Typography>
                      <Typography sx={styles.value}>{profile?.gender || 'N/A'}</Typography>
                    </Grid>
                  </>
                )}

                {roleName === 'Student' && (
                  <>
                    <Grid item xs={6}>
                      <Typography sx={styles.label}>Roll Number</Typography>
                      <Typography sx={styles.value}>{profile?.rollNumber || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography sx={styles.label}>Class</Typography>
                      <Typography sx={styles.value}>
                        {profile?.classId?.name || 'Not Assigned'}
                      </Typography>
                    </Grid>
                  </>
                )}
              </Grid>

              {roleName === 'Teacher' && (
                <>
                  <Typography variant="h6" sx={styles.sectionTitle2}>
                    Assigned Classes & Subjects
                  </Typography>
                  <Divider sx={styles.divider} />
                  <Grid container spacing={2} sx={styles.infoGrid}>
                    <Grid item xs={6}>
                      <Typography sx={styles.label}>Classes</Typography>
                      <Typography sx={styles.value}>
                        {profile?.classIds && profile.classIds.length > 0
                          ? profile.classIds.map((c: any) => c.name).join(', ')
                          : 'None'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography sx={styles.label}>Subjects</Typography>
                      <Typography sx={styles.value}>
                        {profile?.subjectIds && profile.subjectIds.length > 0
                          ? profile.subjectIds.map((s: any) => s.name).join(', ')
                          : 'None'}
                      </Typography>
                    </Grid>
                  </Grid>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

const styles = {
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  pageTitle: {
    fontWeight: 700,
    mb: 4,
    color: 'text.primary',
    letterSpacing: '-0.025em',
  },
  avatarCard: {
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.paper',
  },
  avatarContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    py: 4,
  },
  avatar: {
    width: 100,
    height: 100,
    bgcolor: '#0066CC',
    fontSize: '36px',
    fontWeight: 700,
    mb: 2.5,
  },
  name: {
    fontWeight: 600,
    textAlign: 'center',
    mb: 0.5,
  },
  roleLabel: {
    color: 'text.secondary',
    fontSize: '0.875rem',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  detailsCard: {
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.paper',
  },
  detailsContent: {
    p: 4,
  },
  sectionTitle: {
    fontWeight: 600,
    mb: 1.5,
  },
  sectionTitle2: {
    fontWeight: 600,
    mt: 4,
    mb: 1.5,
  },
  divider: {
    mb: 2.5,
  },
  infoGrid: {
    mt: 0.5,
  },
  label: {
    color: 'text.secondary',
    fontSize: '0.85rem',
    fontWeight: 500,
    mb: 0.5,
  },
  value: {
    color: 'text.primary',
    fontWeight: 600,
    fontSize: '1rem',
  },
} as const;
