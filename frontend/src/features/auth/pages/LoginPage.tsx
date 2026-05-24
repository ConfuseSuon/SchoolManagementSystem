import { useState } from 'react';
import { Tabs, Tab, Box, Typography, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { AdminLoginForm } from '../components/AdminLoginForm';
import { StaffLoginForm } from '../components/StaffLoginForm';

export function LoginPage() {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={styles.container}>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth" sx={styles.tabs}>
        <Tab label="Admin" />
        <Tab label="Staff & Student" />
      </Tabs>
      <Box sx={styles.tabPanel}>
        {tab === 0 && (
          <Box>
            <AdminLoginForm />
            <Box sx={styles.linkBox}>
              <Typography variant="body2">
                Need an account? <Link component={RouterLink} to="/auth/register" color="secondary">Create an account</Link>
              </Typography>
            </Box>
          </Box>
        )}
        {tab === 1 && <StaffLoginForm />}
      </Box>
    </Box>
  );
}

const styles = {
  container: { width: '100%' },
  tabs: {
    mb: 3,
    borderBottom: 1,
    borderColor: 'divider',
  },
  linkBox: { textAlign: 'center', mt: 3 },
  tabPanel: {
    mt: 2,
  },
} as const;
