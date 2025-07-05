"use client";

import { useEffect, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAdminAuth } from '@/context/admin-auth-context';
import { Loader2 } from 'lucide-react';

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
  const { isSuperAdmin, isLoading } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isSuperAdmin) {
      // Redirect to home or a general login if not super admin
      router.push('/admin/login');
    }
  }, [isSuperAdmin, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading Super Admin Area...</p>
      </div>
    );
  }
  
  if (!isSuperAdmin) {
    return (
       <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-destructive">Access Denied. Only Super Admins are allowed.</p>
      </div>
    );
  }

  return <>{children}</>;
}
