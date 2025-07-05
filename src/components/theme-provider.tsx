"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ThemeContext, 
  type Theme,
  themeToCategory,
  THEME_STORAGE_KEY
} from '@/context/theme-context';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // State to hold the current theme. Default to 'theme-default'.
  const [theme, setThemeState] = useState<Theme>('theme-default');

  // On initial load, try to get the theme from localStorage.
  // This runs only once on the client-side.
  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
      if (storedTheme) {
        setThemeState(storedTheme);
      }
    } catch (error) {
      console.warn("Could not access localStorage for theme:", error);
    }
  }, []);

  // Whenever the theme changes, update the class on the <html> element
  // and save the new theme to localStorage.
  useEffect(() => {
    const root = window.document.documentElement;

    // Remove old theme classes
    root.classList.remove('theme-default', 'theme-men', 'theme-women', 'theme-kids', 'theme-ethnic', 'theme-western');
    
    // Add the new theme class
    root.classList.add(theme);

    // Save to localStorage
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
      console.warn("Could not save theme to localStorage:", error);
    }
  }, [theme]);

  // Memoize the context value to prevent unnecessary re-renders.
  const contextValue = useMemo(() => ({
    theme,
    setTheme: setThemeState,
    selectedCategory: themeToCategory(theme)
  }), [theme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}
