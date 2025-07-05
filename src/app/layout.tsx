import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';
import { Providers } from '@/components/providers';
import type { Metadata } from 'next';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

// SEO Metadata
export const metadata: Metadata = {
  title: {
    default: 'Vastra Vibes - Discover Your Unique Style',
    template: '%s | Vastra Vibes',
  },
  description: 'Explore a vibrant collection of Indian and modern apparel at Vastra Vibes. We offer high-quality clothing for men, women, and kids in ethnic and western styles.',
  keywords: ['Indian apparel', 'modern clothing', 'ethnic wear', 'western wear', 'sarees', 'kurtas', 'lehengas'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} theme-default`} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen font-inter antialiased">
        <Providers>
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          <Footer />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
