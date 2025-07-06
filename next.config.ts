
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      }
    ],
  },
  env: {
    // IMPORTANT: Replace this with your actual production URL
    NEXT_PUBLIC_APP_URL: process.env.NODE_ENV === 'production' 
      ? 'https://vastra-vibes.example.com' 
      : 'http://localhost:9002',
    // --- Customer Support Contact Information ---
    // You can replace these placeholder values with your actual contact details.
    // They will be displayed in the footer of the application.
    NEXT_PUBLIC_CONTACT_EMAIL: 'support@vastravibes.com',
    NEXT_PUBLIC_CONTACT_PHONE: '+91 12345 67890',
  },
  webpack: (config, { isServer }) => {
    // This prevents server-only modules from being bundled for the client.
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "child_process": false,
        "fs": false,
        "net": false,
        "tls": false,
        "dns": false,
      };
    }
    return config;
  }
};

export default nextConfig;
