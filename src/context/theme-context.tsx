"use client";

import React, { createContext, useContext, useEffect } from 'react';
import type { Category } from '@/types';

export type Theme = 'theme-default' | 'theme-men' | 'theme-women' | 'theme-kids' | 'theme-ethnic' | 'theme-western';
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
  setTheme: (theme: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  // Persist theme changes to localStorage whenever setTheme is called.
  useEffect(() => {
    try {
        localStorage.setItem(THEME_STORAGE_KEY, context.theme);
    } catch (error) {
        console.warn("Could not save theme to localStorage:", error);
    }
  }, [context.theme]);

  return context;
};
