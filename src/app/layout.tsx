"use client";

import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';
import { Providers } from '@/components/providers';
import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import type { Category } from '@/types';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

// --- Theme Management Logic & Context ---
// We centralize theme logic here now that the layout is a client component.
export type Theme = 'theme-default' | 'theme-men' | 'theme-women' | 'theme-kids' | 'theme-ethnic' | 'theme-western';
const ALL_THEMES: Theme[] = ['theme-default', 'theme-men', 'theme-women', 'theme-kids', 'theme-ethnic', 'theme-western'];
const THEME_STORAGE_KEY = 'vastraVibesTheme';

export const categoryToTheme = (category: Category | 'All'): Theme => {
  const map: Record<Category | 'All', Theme> = {
    'All': 'theme-default', 'Men': 'theme-men', 'Women': 'theme-women',
    'Kids': 'theme-kids', 'Ethnic': 'theme-ethnic', 'Western': 'theme-western',
  };
  return map[category];
};

export const themeToCategory = (theme: Theme): Category | 'All' => {
  const map: Record<Theme, Category | 'All'> = {
    'theme-default': 'All', 'theme-men': 'Men', 'theme-women': 'Women',
    'theme-kids': 'Kids', 'theme-ethnic': 'Ethnic', 'theme-western': 'Western',
  };
  return map[theme] || 'All';
}

interface ThemeContextType {
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within the RootLayout');
  }
  return context;
};

// --- Root Layout Component ---
// Note: The static `metadata` export is removed as it's not supported in Client Components.
// This is a necessary trade-off for dynamic, root-level theme switching.
export default function RootLayout({ children }: Readonly<{ children: ReactNode; }>) {
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

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
      console.warn("Could not save theme to localStorage:", error);
    }
  }, [theme]);

  return (
    <html lang="en" className={`${inter.variable} ${theme}`}>
      <body className="flex flex-col min-h-screen font-inter antialiased">
        <ThemeContext.Provider value={{ theme, setTheme }}>
          <Providers>
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
            <Footer />
            <Toaster />
          </Providers>
        </ThemeContext.Provider>
      </body>
    </html>
  );
}
