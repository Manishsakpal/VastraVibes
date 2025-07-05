"use client";

import { useEffect, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAdminAuth } from '@/context/admin-auth-context';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isAdmin, isSuperAdmin, isLoading } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If not loading, not an admin, not a super admin, and not on the login page, then redirect.
    if (!isLoading && !isAdmin && !isSuperAdmin && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [isAdmin, isSuperAdmin, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading Admin Area...</p>
      </div>
    );
  }
  
  // This logic is key:
  // 1. If trying to access a protected route without being an admin or super admin, show "Access Denied" while redirecting.
  // 2. If isAdmin or isSuperAdmin is true, this condition is false, and children will render.
  // 3. If on '/admin/login', this condition is false, and children (the login page) will render.
  if (!isAdmin && !isSuperAdmin && pathname !== '/admin/login') {
    return (
       <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-destructive">Access Denied. Redirecting to login...</p>
      </div>
    );
  }

  // Render children if authenticated or on the login page
  return <>{children}</>;
}
