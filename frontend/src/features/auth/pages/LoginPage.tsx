import { useState } from 'react';
import { Tabs, Tab, Box, Typography, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { AdminLoginForm } from '../components/AdminLoginForm';
import { StaffLoginForm } from '../components/StaffLoginForm';

export function LoginPage() {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={styles.container}>
      <Box sx={styles.header}>
        <Typography variant="h5" sx={styles.title}>
          Welcome back
        </Typography>
        <Typography variant="body2" sx={styles.subtitle}>
          Sign in to your account
        </Typography>
      </Box>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="fullWidth"
        indicatorColor="secondary"
        textColor="inherit"
        sx={styles.tabs}
      >
        <Tab label="Admin" sx={styles.tab} />
        <Tab label="Teacher & Student" sx={styles.tab} />
      </Tabs>

      {tab === 0 && (
        <>
          <AdminLoginForm />
          <Box sx={styles.linkBox}>
            <Typography variant="body2" sx={styles.linkText}>
              Need an account?{' '}
              <Link component={RouterLink} to="/auth/register" sx={styles.registerLink}>
                Create an account
              </Link>
            </Typography>
          </Box>
        </>
      )}
      {tab === 1 && <StaffLoginForm />}
    </Box>
  );
}

const styles = {
  container: {
    width: '100%',
  },
  header: {
    mb: 4,
    textAlign: 'center',
  },
  title: {
    fontWeight: 700,
    letterSpacing: '-0.5px',
    color: 'text.primary',
    mb: 1,
    mt: 5,
  },
  subtitle: {
    color: 'text.secondary',
  },
  tabs: {
    mb: 3,
    borderBottom: 1,
    borderColor: 'divider',
  },
  tab: {
    textTransform: 'none',
    fontWeight: 500,
    color: 'text.secondary',
    '&.Mui-selected': {
      fontWeight: 700,
    },
  },
  linkBox: {
    textAlign: 'center',
    mt: 3,
  },
  linkText: {
    color: 'text.secondary',
  },
  registerLink: {
    color: 'secondary.main',
    fontWeight: 600,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
} as const;
