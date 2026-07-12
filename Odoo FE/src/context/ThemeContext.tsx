import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'app-theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Graceful initialization with localStorage fallback
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const persisted = localStorage.getItem(LOCAL_STORAGE_KEY) as ThemeMode | null;
      if (persisted === 'light' || persisted === 'dark' || persisted === 'system') {
        return persisted;
      }
    } catch (e) {
      console.warn('Failed to retrieve theme from localStorage:', e);
    }
    return 'system'; // Default to system
  });

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');

  // Unified theme setter with state persistence
  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, newTheme);
    } catch (e) {
      console.warn('Failed to save theme to localStorage:', e);
    }
  };

  useEffect(() => {
    const root = window.document.documentElement;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // Function to calculate resolved theme based on current state and system preference
    const updateTheme = () => {
      let resolved: ResolvedTheme = 'light';
      if (theme === 'system') {
        resolved = mediaQuery.matches ? 'dark' : 'light';
      } else {
        resolved = theme;
      }

      setResolvedTheme(resolved);

      // Apply data-theme attribute for CSS variable selector mapping
      root.setAttribute('data-theme', resolved);
    };

    updateTheme();

    // Listen to system changes dynamically
    const handleSystemThemeChange = () => {
      if (theme === 'system') {
        updateTheme();
      }
    };

    // Modern and backward compatible event binding
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
    } else {
      mediaQuery.addListener(handleSystemThemeChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleSystemThemeChange);
      } else {
        mediaQuery.removeListener(handleSystemThemeChange);
      }
    };
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
