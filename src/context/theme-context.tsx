"use client";

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import type { Category } from '@/types';

export type Theme = 'theme-default' | 'theme-men' | 'theme-women' | 'theme-kids' | 'theme-ethnic' | 'theme-western';
const ALL_THEMES: Theme[] = ['theme-default', 'theme-men', 'theme-women', 'theme-kids', 'theme-ethnic', 'theme-western'];
const THEME_STORAGE_KEY = 'vastraVibesTheme';

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

export const themeToCategory = (theme: Theme): Category | 'All' => {
  const map: Record<Theme, Category | 'All'> = {
    'theme-default': 'All',
    'theme-men': 'Men',
    'theme-women': 'Women',
    'theme-kids': 'Kids',
    'theme-ethnic': 'Ethnic',
    'theme-western': 'Western',
  };
  return map[theme] || 'All';
};

interface ThemeContextType {
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('theme-default');

  // Load theme from localStorage on initial client-side mount
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

  // Apply theme class to <html> element whenever it changes
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all possible theme classes
    ALL_THEMES.forEach(t => root.classList.remove(t));
    
    // Add the current theme class
    root.classList.add(theme);

    // Save theme to localStorage
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
      console.warn("Could not save theme to localStorage:", error);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
