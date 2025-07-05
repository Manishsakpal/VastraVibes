
"use client";

import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';
import { Providers } from '@/components/providers';
import { ThemeContext, type Theme } from '@/context/theme-context';
import { useState, useEffect, useMemo } from 'react';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

// NOTE: Metadata can no longer be exported from this file because it is now a Client Component
// to support dynamic theme switching. SEO metadata should be handled on a per-page basis
// in page.tsx files where possible.

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [theme, setTheme] = useState<Theme>('theme-default');

  // On initial client-side load, check localStorage for a saved theme.
  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem('vastraVibesTheme') as Theme | null;
      if (storedTheme) {
        setTheme(storedTheme);
      }
    } catch (error) {
      console.warn("Could not access localStorage for theme:", error);
    }
  }, []);

  const themeContextValue = useMemo(() => ({ theme, setTheme }), [theme]);

  return (
    <html lang="en" className={`${inter.variable} ${theme}`} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen font-inter antialiased bg-background text-foreground transition-colors duration-500">
        <ThemeContext.Provider value={themeContextValue}>
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
