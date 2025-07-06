import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';
import { Providers } from '@/components/providers';
import { ThemeProvider } from '@/components/theme-provider';
import type { Metadata } from 'next';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: 'Vastra Vibes - Discover Your Unique Style',
    template: '%s | Vastra Vibes',
  },
  description: 'An e-commerce platform for the finest Indian and modern apparel. Shop for men, women, kids, ethnic, and western wear.',
  openGraph: {
    title: 'Vastra Vibes - Discover Your Unique Style',
    description: 'Discover Your Unique Style in Indian and modern apparel.',
    url: appUrl,
    siteName: 'Vastra Vibes',
    type: 'website',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vastra Vibes - Discover Your Unique Style',
    description: 'An e-commerce platform for the finest Indian and modern apparel.',
  }
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} flex flex-col min-h-screen font-inter antialiased bg-background text-foreground transition-colors duration-500`}>
        <ThemeProvider>
          <Providers>
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
            <Footer />
            <Toaster />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
