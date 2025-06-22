"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Category } from '@/types';

export type Theme = 'theme-default' | 'theme-men' | 'theme-women' | 'theme-kids' | 'theme-ethnic' | 'theme-western';

const THEME_STORAGE_KEY = 'vastraVibesTheme';
const ALL_THEMES: Theme[] = ['theme-default', 'theme-men', 'theme-women', 'theme-kids', 'theme-ethnic', 'theme-western'];

export const categoryToTheme = (category: Category | 'All'): Theme => {
  const map: Record<Category | 'All', Theme> = {
    'All': 'theme-default',
    'Men': 'theme-men',
    'Women': 'theme-women',
    'Kids': 'theme-kids',
    'Ethnic': 'theme-ethnic',
    'Western': 'theme-western',
  };
  return map[category];
};

interface ThemeContextType {
  theme: Theme;
  setThemeByCategory: (category: Category | 'All') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('theme-default');

  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
      if (storedTheme && ALL_THEMES.includes(storedTheme)) {
        setTheme(storedTheme);
      }
    } catch (error) {
      console.warn("Could not access localStorage for theme:", error);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    // Remove any old theme classes
    ALL_THEMES.forEach(t => root.classList.remove(t));
    
    // Add the new theme class
    root.classList.add(theme);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
      console.warn("Could not save theme to localStorage:", error);
    }
  }, [theme]);
  
  const setThemeByCategory = useCallback((category: Category | 'All') => {
    const newTheme = categoryToTheme(category);
    setTheme(newTheme);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setThemeByCategory }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
