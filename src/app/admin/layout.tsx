"use client";

import { useEffect, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAdminAuth } from '@/context/admin-auth-context';
import { Loader2 } from 'lucide-react';

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
  
  // This logic is key:
  // 1. If trying to access a protected route without being an admin, show "Access Denied" while redirecting.
  // 2. If isAdmin is true, this condition is false, and children will render.
  // 3. If on '/admin/login', this condition is false, and children (the login page) will render.
  if (!isAdmin && pathname !== '/admin/login') {
    return (
       <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-destructive">Access Denied. Redirecting to login...</p>
      </div>
    );
  }

  // Render children if authenticated or on the login page
  return <>{children}</>;
}
