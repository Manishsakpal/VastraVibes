import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Using Inter for a modern look
import './globals.css';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';
import { ItemProvider } from '@/context/item-context';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'Vastra Vibes - Authentic Indian & Modern Apparel',
    template: '%s | Vastra Vibes',
  },
  description: 'Discover a vibrant collection of ethnic and western wear at Vastra Vibes. Shop for men, women, and kids with unique styles and quality fabric.',
  keywords: ['indian wear', 'western wear', 'ethnic clothing', 'fashion', 'apparel', 'vastra vibes', 'online shopping'],
  openGraph: {
    title: 'Vastra Vibes - Authentic Indian & Modern Apparel',
    description: 'Explore beautiful clothing collections for all occasions.',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://vastra-vibes.example.com', // Replace with actual URL
    siteName: 'Vastra Vibes',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://vastra-vibes.example.com'}/og-image.png`, // Will resolve to public/og-image.png
        width: 1200,
        height: 630,
        alt: 'Vastra Vibes Storefront',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vastra Vibes - Authentic Indian & Modern Apparel',
    description: 'Shop the latest trends in ethnic and western fashion.',
    images: [`${process.env.NEXT_PUBLIC_APP_URL || 'https://vastra-vibes.example.com'}/twitter-image.png`], // Will resolve to public/twitter-image.png
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="flex flex-col min-h-screen font-inter antialiased">
        <ItemProvider>
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          <Footer />
          <Toaster />
        </ItemProvider>
      </body>
    </html>
  );
}
