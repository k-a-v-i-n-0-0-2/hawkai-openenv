import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'fitpro' | 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem('app-theme');
      return (saved as Theme) || 'fitpro';
    } catch (e) {
      return 'fitpro';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('app-theme', theme);
    } catch (e) {
      // Ignore
    }
    document.documentElement.classList.remove('theme-light', 'theme-dark', 'theme-fitpro', 'dark');
    document.documentElement.classList.add(`theme-${theme}`);
    
    // Add standard tailwind dark class for both dark and fitpro themes
    if (theme === 'dark' || theme === 'fitpro') {
      document.documentElement.classList.add('dark');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
