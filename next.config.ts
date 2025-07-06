
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
