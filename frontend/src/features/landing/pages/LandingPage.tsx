import { Box, Button, Container, Typography, AppBar, Toolbar } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { School, People, Campaign, Dashboard, ArrowDownward, ArrowBack } from '@mui/icons-material';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { ThemeToggle } from '@/components/ThemeToggle';
import useScrollTrigger from '@mui/material/useScrollTrigger';

export function LandingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, user } = useAuthStore();
  const isAuthenticated = !!(token && user);

  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 10,
  });

  const isAuthPage = location.pathname.startsWith('/auth');

  const getDashboardPath = () => {
    if (!user) return '/';
    if (user.role === 'Admin') return '/admin';
    if (user.role === 'Teacher') return '/teacher';
    if (user.role === 'Student') return '/student';
    return '/';
  };

  const handleSignIn = () => {
    if (isAuthenticated) {
      navigate(getDashboardPath());
    } else {
      navigate('/auth/login');
    }
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate(getDashboardPath());
    } else {
      navigate('/auth/register');
    }
  };

  const features = [
    {
      icon: <School sx={styles.featureIcon} />,
      title: 'Multi-School Management',
      desc: 'Seamlessly administer multiple institutions under a single master administrator account.',
      image: 'https://images.unsplash.com/photo-1613896527026-f195d5c818ed?w=600&q=80',
    },
    {
      icon: <People sx={styles.featureIcon} />,
      title: 'Role-Based Access',
      desc: 'Tailored interfaces and granular permission control for Administrators, Teachers, and Students.',
      image: 'https://images.unsplash.com/photo-1629904888780-8de0c7aeed28?w=600&q=80',
    },
    {
      icon: <Campaign sx={styles.featureIcon} />,
      title: 'Notices & Complaints',
      desc: 'Publish real-time announcements and process complaints through structured feedback channels.',
      image: 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=600&q=80',
    },
    {
      icon: <Dashboard sx={styles.featureIcon} />,
      title: 'Real-Time Dashboard',
      desc: 'Get immediate insights into key metrics, statistics, recent notices, and academic performance.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
    },
  ];

  return (
    <Box sx={styles.root}>
      {/* Navbar */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={trigger ? [styles.navbar, styles.navbarScrolled] : [styles.navbar, styles.navbarTop]}
      >
        <Container maxWidth="lg" sx={styles.navContainer}>
          <Toolbar disableGutters sx={styles.toolbar}>
            <Box sx={styles.logoWrapper}>
              {isAuthPage && (
                <Button
                  component={RouterLink}
                  to="/"
                  startIcon={<ArrowBack />}
                  sx={styles.backToHome}
                >
                  Back to Home
                </Button>
              )}
              <Typography
                variant="h6"
                component={RouterLink}
                to="/"
                sx={styles.logo}
              >
                School Management System
              </Typography>
            </Box>

            <Box sx={styles.navActions}>
              <ThemeToggle />
              {isAuthenticated ? (
                <Button
                  variant="contained"
                  onClick={handleSignIn}
                  sx={styles.navButtonPrimary}
                >
                  Dashboard
                </Button>
              ) : (
                <>
                  <Button
                    variant="outlined"
                    onClick={handleSignIn}
                    sx={styles.navButtonSecondaryDesktop}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleGetStarted}
                    sx={styles.navButtonPrimary}
                  >
                    Get Started
                  </Button>
                </>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Hero Section */}
      <Box component="section" sx={styles.heroSection}>
        <Container maxWidth="lg" sx={styles.heroContainer}>
          <Grid container spacing={6} alignItems="center">
            {/* Left Column */}
            <Grid size={{ xs: 12, sm: 6 }} sx={styles.heroLeftCol}>
              <Typography variant="h1" sx={styles.heroHeadline}>
                Everything your school needs.
                <br />
                Nothing it doesn't.
              </Typography>
              <Typography variant="h5" sx={styles.heroSubtext}>
                Modernize your institution with streamlined administration, real-time metrics,
                and role-specific dashboards built for administrative efficiency.
              </Typography>

              <Box sx={styles.heroCTAs}>
                {isAuthenticated ? (
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleSignIn}
                    sx={styles.heroBtnPrimary}
                  >
                    Go to Dashboard
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={handleGetStarted}
                      sx={styles.heroBtnPrimary}
                    >
                      Get Started Free
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={handleSignIn}
                      sx={styles.heroBtnSecondary}
                    >
                      Sign In
                    </Button>
                  </>
                )}
              </Box>
            </Grid>

            {/* Right Column */}
            <Grid size={{ xs: 12, sm: 6 }} sx={styles.heroRightCol}>
              <Box sx={styles.heroImageCard}>
                <Box
                  component="img"
                  src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80"
                  alt="School classroom"
                  sx={styles.heroImage}
                />
              </Box>
            </Grid>
          </Grid>

          <Box sx={styles.scrollIndicator}>
            <Typography variant="caption" sx={styles.scrollText}>
              Scroll to explore
            </Typography>
            <ArrowDownward sx={styles.scrollIcon} />
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box component="section" sx={styles.featuresSection}>
        <Container maxWidth="lg" sx={styles.sectionContainer}>
          <Typography variant="h2" sx={styles.sectionTitle}>
            Designed for modern institutions
          </Typography>
          <Grid container spacing={4} sx={styles.featuresGrid}>
            {features.map((feat, index) => (
              <Grid size={{ xs: 12, sm: 6 }} key={index}>
                <Box sx={styles.featureCard}>
                  <Box
                    component="img"
                    src={feat.image}
                    alt={feat.title}
                    sx={styles.featureCardImage}
                  />
                  <Box sx={styles.featureCardContent}>
                    <Box sx={styles.featureIconContainer}>
                      {feat.icon}
                    </Box>
                    <Typography variant="h6" sx={styles.featureTitle}>
                      {feat.title}
                    </Typography>
                    <Typography variant="body2" sx={styles.featureDesc}>
                      {feat.desc}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Banner */}
      <Box component="section" sx={styles.ctaBannerSection}>
        <Container maxWidth="lg" sx={styles.ctaBannerContainer}>
          <Typography variant="h3" sx={styles.ctaBannerHeadline}>
            Ready to modernize your school?
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={handleGetStarted}
            sx={styles.ctaBannerButton}
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box component="footer" sx={styles.footer}>
        <Container maxWidth="lg" sx={styles.footerContainer}>
          <Typography sx={styles.footerBrand}>
            School Management System
          </Typography>
          <Typography sx={styles.footerStack}>
            Built with React & NestJS
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}

const styles = {
  root: {
    minHeight: '100vh',
    bgcolor: 'background.default',
    color: 'text.primary',
    display: 'flex',
    flexDirection: 'column',
  },
  navbar: {
    position: 'sticky',
    top: 0,
    zIndex: 1100,
    backdropFilter: 'blur(20px)',
    bgcolor: (theme: any) =>
      theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.72)' : 'rgba(18, 18, 18, 0.72)',
    borderBottom: '1px solid',
    borderColor: 'divider',
    transition: 'box-shadow 0.2s ease-in-out',
  },
  navbarTop: {
    boxShadow: 'none',
  },
  navbarScrolled: {
    boxShadow: (theme: any) =>
      theme.palette.mode === 'light'
        ? '0px 4px 12px rgba(0, 0, 0, 0.05)'
        : '0px 4px 12px rgba(0, 0, 0, 0.4)',
  },
  navContainer: {
    px: { xs: 2, sm: 4, md: 8 },
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    height: 64,
  },
  logoWrapper: {
    display: 'flex',
    alignItems: 'center',
  },
  logo: {
    fontWeight: 700,
    letterSpacing: '-0.5px',
    color: 'text.primary',
    textDecoration: 'none',
  },
  backToHome: {
    color: 'text.secondary',
    textTransform: 'none',
    fontWeight: 600,
    mr: 2,
    fontSize: '0.9rem',
    '&:hover': {
      color: 'text.primary',
      bgcolor: 'transparent',
    },
  },
  navActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
  },
  navButtonPrimary: {
    borderRadius: '20px',
    py: 0.75,
    px: 2.5,
    bgcolor: 'secondary.main',
    color: '#FFFFFF',
    textTransform: 'none',
    fontWeight: 600,
    '&:hover': {
      bgcolor: 'secondary.main',
      opacity: 0.9,
    },
  },
  navButtonSecondaryDesktop: {
    borderRadius: '20px',
    py: 0.75,
    px: 2.5,
    borderColor: 'divider',
    color: 'text.primary',
    textTransform: 'none',
    fontWeight: 600,
    display: { xs: 'none', sm: 'inline-flex' },
    '&:hover': {
      borderColor: 'text.primary',
      bgcolor: 'action.hover',
    },
  },
  heroSection: {
    minHeight: 'calc(100vh - 64px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    py: { xs: 6, md: 10 },
  },
  heroContainer: {
    px: { xs: 2, sm: 4, md: 8 },
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  heroLeftCol: {
    textAlign: { xs: 'center', sm: 'left' },
    display: 'flex',
    flexDirection: 'column',
    alignItems: { xs: 'center', sm: 'flex-start' },
  },
  heroRightCol: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroHeadline: {
    fontSize: 'clamp(2.5rem, 5.5vw, 4.5rem)',
    fontWeight: 800,
    letterSpacing: '-2px',
    lineHeight: 1.1,
    color: 'text.primary',
    mb: 3,
  },
  heroSubtext: {
    maxWidth: 720,
    color: 'text.secondary',
    mb: 5,
    lineHeight: 1.6,
    fontWeight: 400,
    fontSize: 'clamp(1rem, 2vw, 1.25rem)',
  },
  heroCTAs: {
    display: 'flex',
    gap: 2.5,
    flexWrap: 'wrap',
    justifyContent: { xs: 'center', sm: 'flex-start' },
    mb: { xs: 4, sm: 0 },
  },
  heroBtnPrimary: {
    borderRadius: '24px',
    py: 1.5,
    px: 4,
    bgcolor: 'secondary.main',
    color: '#FFFFFF',
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '1rem',
    '&:hover': {
      bgcolor: 'secondary.main',
      opacity: 0.9,
    },
  },
  heroBtnSecondary: {
    borderRadius: '24px',
    py: 1.5,
    px: 4,
    borderColor: 'divider',
    color: 'text.primary',
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '1rem',
    '&:hover': {
      borderColor: 'text.primary',
      bgcolor: 'action.hover',
    },
  },
  heroImageCard: {
    borderRadius: '24px',
    boxShadow: (theme: any) =>
      theme.palette.mode === 'light'
        ? '0px 12px 32px rgba(0, 0, 0, 0.08)'
        : '0px 12px 32px rgba(0, 0, 0, 0.5)',
    overflow: 'hidden',
    width: '100%',
  },
  heroImage: {
    width: '100%',
    height: '420px',
    objectFit: 'cover',
    display: 'block',
  },
  scrollIndicator: {
    position: 'absolute',
    bottom: 16,
    display: { xs: 'none', sm: 'flex' },
    flexDirection: 'column',
    alignItems: 'center',
    gap: 0.5,
    animation: 'fadeIn 1s ease-out 1.5s both, bounce 2.5s infinite 2.5s',
    '@keyframes fadeIn': {
      '0%': { opacity: 0, transform: 'translateY(15px)' },
      '100%': { opacity: 1, transform: 'translateY(0)' },
    },
    '@keyframes bounce': {
      '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
      '40%': { transform: 'translateY(-8px)' },
      '60%': { transform: 'translateY(-4px)' },
    },
  },
  scrollText: {
    color: 'text.secondary',
    fontSize: '0.75rem',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  scrollIcon: {
    color: 'text.secondary',
    fontSize: '1.25rem',
  },
  featuresSection: {
    bgcolor: (theme: any) =>
      theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.01)' : 'rgba(255, 255, 255, 0.01)',
    py: { xs: 8, md: 12 },
    borderTop: '1px solid',
    borderBottom: '1px solid',
    borderColor: 'divider',
  },
  sectionContainer: {
    px: { xs: 2, sm: 4, md: 8 },
  },
  sectionTitle: {
    fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
    fontWeight: 800,
    letterSpacing: '-1px',
    textAlign: 'center',
    mb: 8,
  },
  featuresGrid: {
    maxWidth: 960,
    mx: 'auto',
  },
  featureCard: {
    bgcolor: 'background.paper',
    borderRadius: '16px',
    border: '1px solid',
    borderColor: 'divider',
    height: '100%',
    overflow: 'hidden',
    transition: 'all 220ms cubic-bezier(0.25, 1, 0.5, 1)',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: (theme: any) =>
        theme.palette.mode === 'light'
          ? '0 4px 12px rgba(0,0,0,0.04), 0 20px 40px rgba(0,0,0,0.04)'
          : '0 4px 12px rgba(0,0,0,0.3), 0 20px 40px rgba(0,0,0,0.3)',
    },
  },
  featureCardImage: {
    width: '100%',
    height: '160px',
    objectFit: 'cover',
    borderRadius: '12px 12px 0 0',
    display: 'block',
  },
  featureCardContent: {
    p: 4,
  },
  featureIconContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    borderRadius: '12px',
    bgcolor: 'rgba(0, 102, 204, 0.08)',
    mb: 3,
  },
  featureIcon: {
    color: '#0066CC',
    fontSize: 24,
  },
  featureTitle: {
    fontWeight: 700,
    letterSpacing: '-0.3px',
    mb: 1.5,
  },
  featureDesc: {
    color: 'text.secondary',
    lineHeight: 1.5,
  },
  ctaBannerSection: {
    bgcolor: '#0066CC',
    py: { xs: 10, md: 14 },
    textAlign: 'center',
  },
  ctaBannerContainer: {
    px: { xs: 2, sm: 4, md: 8 },
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  ctaBannerHeadline: {
    color: '#FFFFFF',
    fontWeight: 800,
    letterSpacing: '-1px',
    fontSize: 'clamp(2rem, 5vw, 3.25rem)',
    lineHeight: 1.2,
  },
  ctaBannerButton: {
    bgcolor: '#FFFFFF',
    color: '#0066CC',
    borderRadius: '24px',
    py: 1.5,
    px: 4.5,
    fontSize: '1rem',
    fontWeight: 600,
    textTransform: 'none',
    '&:hover': {
      bgcolor: 'rgba(255, 255, 255, 0.95)',
    },
  },
  footer: {
    py: 4,
    borderTop: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.paper',
  },
  footerContainer: {
    px: { xs: 2, sm: 4, md: 8 },
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerBrand: {
    fontWeight: 600,
    fontSize: '0.8rem',
    color: 'text.secondary',
  },
  footerStack: {
    fontSize: '0.8rem',
    color: 'text.secondary',
  },
} as const;
