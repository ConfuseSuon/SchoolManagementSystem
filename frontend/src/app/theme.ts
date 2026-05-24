import { createTheme } from '@mui/material/styles';

export function getTheme(mode: 'light' | 'dark') {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'light' ? '#1D1D1F' : '#F5F5F7',
      },
      secondary: {
        main: '#0066CC',
      },
      background: {
        default: mode === 'light' ? '#F5F5F7' : '#000000',
        paper: mode === 'light' ? '#FFFFFF' : '#1C1C1E',
      },
      text: {
        primary: mode === 'light' ? '#1D1D1F' : '#F5F5F7',
        secondary: mode === 'light' ? '#6E6E73' : '#98989D',
      },
      divider: mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)',
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontWeight: 700, letterSpacing: '-0.02em' },
      h2: { fontWeight: 700, letterSpacing: '-0.02em' },
      h3: { fontWeight: 600, letterSpacing: '-0.02em' },
      h4: { fontWeight: 600, letterSpacing: '-0.02em' },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
            padding: '10px 24px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
              opacity: 0.9,
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            border: `1px solid ${mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)'}`,
            boxShadow: mode === 'light' ? '0 2px 20px rgba(0, 0, 0, 0.08)' : '0 2px 20px rgba(0, 0, 0, 0.5)',
          },
          elevation24: {
            boxShadow: mode === 'light' ? '0 2px 20px rgba(0, 0, 0, 0.08)' : '0 2px 20px rgba(0, 0, 0, 0.5)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: mode === 'light' ? '0 2px 20px rgba(0, 0, 0, 0.08)' : '0 2px 20px rgba(0, 0, 0, 0.5)',
            borderRadius: '16px',
            border: `1px solid ${mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)'}`,
          },
        },
      },
    },
  });
}
