"use client";

import { useEffect, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { Loader2 } from 'lucide-react';

// No direct metadata export from client component for layout.
// This can be handled in a parent server component or a `template.tsx` if specific admin layout SEO is needed.

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isAdmin, isLoading } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAdmin && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [isAdmin, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading Admin Area...</p>
      </div>
    );
  }

  if (!isAdmin && pathname !== '/admin/login') {
    // This case should be covered by useEffect redirect, but as a fallback:
    return (
       <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-destructive">Access Denied. Redirecting to login...</p>
      </div>
    );
  }
  
  // Allow access to /admin/login even if not admin, otherwise render children for authenticated admin
  if (pathname === '/admin/login' || isAdmin) {
    return <>{children}</>;
  }

  // Fallback if still loading or in a weird state before redirect
  return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}
