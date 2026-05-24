import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { getTheme } from './theme';
import { queryClient } from '../lib/query-client';
import { GlobalToast } from '../components/GlobalToast';
import { useUiStore } from '../stores/ui-store';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const { darkMode } = useUiStore();

  const theme = useMemo(() => getTheme(darkMode ? 'dark' : 'light'), [darkMode]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          {children}
          <GlobalToast />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
