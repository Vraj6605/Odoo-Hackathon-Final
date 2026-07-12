import React, { useMemo } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { queryClient } from '@/lib/queryClient';
import AppRoutes from '@/routes/AppRoutes';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';

const AppContent: React.FC = () => {
  const { resolvedTheme } = useTheme();

  // Dynamically update MUI theme based on the resolved active theme (light or dark)
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: resolvedTheme,
          primary: {
            main: '#2563eb', // Blue-600 matching Tailwind
          },
          background: {
            default: resolvedTheme === 'light' ? '#f4f4f5' : '#09090b',
            paper: resolvedTheme === 'light' ? '#ffffff' : '#18181b',
          },
        },
        typography: {
          fontFamily: [
            'Inter',
            'Roboto',
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'sans-serif',
          ].join(','),
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                borderRadius: '8px',
              },
            },
          },
        },
      }),
    [resolvedTheme]
  );

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </MuiThemeProvider>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
