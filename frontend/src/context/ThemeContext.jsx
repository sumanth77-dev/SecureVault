import React, { createContext, useContext, useEffect, useState } from 'react';
import { getStorageItem, setStorageItem } from '../utils/storage';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // 'light' | 'dark' | 'system'
  const [theme, setTheme] = useState(() => getStorageItem('sv_theme', 'dark'));

  useEffect(() => {
    const root = document.documentElement;
    
    const applyTheme = (resolvedTheme) => {
      if (resolvedTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mediaQuery.matches ? 'dark' : 'light');

      const handler = (e) => {
        applyTheme(e.matches ? 'dark' : 'light');
      };

      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      applyTheme(theme);
    }

    setStorageItem('sv_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
