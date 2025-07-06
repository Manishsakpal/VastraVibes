"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Lock } from "lucide-react";
import Link from "next/link";
import AdminUserTable from "@/components/superadmin/admin-user-table";
import { useAdminAuth } from "@/context/admin-auth-context";

export default function UserManagementPage() {
  const { isSuperAdmin, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
       <div className="container mx-auto py-8 text-center">
        <Lock className="mx-auto h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">You do not have permission to view this page.</p>
        <Button asChild className="mt-4">
          <Link href="/admin/dashboard">Go Back</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 animate-fade-in-up">
      <Button variant="outline" asChild className="mb-6">
        <Link href="/superAdmin">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Super Admin Dashboard
        </Link>
      </Button>
      
      <AdminUserTable />
    </div>
  );
}
