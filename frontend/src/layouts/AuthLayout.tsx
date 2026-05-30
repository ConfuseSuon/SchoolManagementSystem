import { Outlet, Link as RouterLink } from 'react-router-dom';
import { Box, Typography, IconButton } from '@mui/material';
import { ArrowBackIosNew } from '@mui/icons-material';
import loginLight from '@/assets/designlogin-lightmode.jpg';
import loginDark from '@/assets/designlogin-darkmode.jpg';
import { useTheme } from '@mui/material/styles';

export function AuthLayout() {
  const theme = useTheme();

  const authImage =
    theme.palette.mode === 'dark'
      ? loginDark
      : loginLight;

  return (
    <Box sx={styles.root}>
      {/* Left Column: Form Content */}
      <Box sx={styles.leftCol}>
        <Box sx={styles.header}>
          <IconButton component={RouterLink} to="/" size="small" sx={styles.backButton}>
            <ArrowBackIosNew sx={styles.backIcon} />
            <Typography variant="body2" sx={styles.backText}>
              School Management System
            </Typography>
          </IconButton>
        </Box>

        <Box sx={styles.formContainer}>
          <Outlet />
        </Box>
      </Box>

      {/* Right Column: Hero Image Panel */}
      <Box sx={styles.rightCol}>
        <Box
          component="img"
          src={authImage}
          alt="Authentication"
          sx={styles.bgImage}
        />
      </Box>
    </Box>
  );
}

const styles = {
  root: {
    display: 'flex',
    minHeight: '100vh',
    bgcolor: 'background.default',
    color: 'text.primary',
    overflowX: 'hidden',
  },
  leftCol: {
    width: { xs: '100%', md: '45%' },
    display: 'flex',
    flexDirection: 'column',
    bgcolor: 'background.paper',
    minHeight: '100vh',
    borderRight: { xs: 'none', md: '1px solid' },
    borderColor: 'divider',
    p: { xs: 3, md: 5 },
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 1.5,
    width: '100%',
  },
  backButton: {
    color: 'text.secondary',
    borderRadius: '8px',
    px: 1.5,
    py: 1,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 1,
    '&:hover': {
      bgcolor: 'action.hover',
      color: 'text.primary',
    },
  },
  backIcon: {
    fontSize: '0.875rem',
  },
  backText: {
    fontSize: '0.875rem',
    fontWeight: 600,
    letterSpacing: '-0.2px',
  },
  toggleWrapper: {
    alignSelf: 'flex-end',
    mt: 0.5,
  },
  formContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 400,
    mx: 'auto',
    pb: { xs: 4, md: 8 },
  },
  rightCol: {
    width: '55%',
    display: { xs: 'none', md: 'block' },
    position: 'relative',
    alignSelf: 'stretch',
  },
  bgImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
    position: 'absolute',
    inset: 0,
  },
} as const;
