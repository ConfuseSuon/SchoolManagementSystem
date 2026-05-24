import { Outlet } from 'react-router-dom';
import { Box, Paper, Typography } from '@mui/material';
import { ThemeToggle } from '@/components/ThemeToggle';

export function AuthLayout() {
  return (
    <Box sx={styles.container}>
      <Box sx={styles.toggleWrapper}>
        <ThemeToggle />
      </Box>
      <Paper sx={styles.paper} elevation={0}>
        <Box sx={styles.headerBox}>
          <Typography variant="h5" component="h1" sx={styles.title}>
            School Management System
          </Typography>
        </Box>
        <Outlet />
      </Paper>
    </Box>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    bgcolor: 'background.default',
    position: 'relative',
    p: 2,
  },
  toggleWrapper: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  paper: {
    p: { xs: 4, md: 6 },
    width: '100%',
    maxWidth: 520,
    borderRadius: 4,
    bgcolor: 'background.paper',
    border: '1px solid',
    borderColor: 'divider',
  },
  headerBox: {
    mb: 4,
    textAlign: 'center',
  },
  title: {
    fontWeight: 800,
    color: 'text.primary',
    letterSpacing: '-0.5px',
  },
} as const;
