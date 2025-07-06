"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminAuth } from "@/context/admin-auth-context";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import ProductManagementTable from "@/components/admin/product-management-table";

export default function ManageProductsPage() {
    const { isSuperAdmin } = useAdminAuth();
    const dashboardPath = isSuperAdmin ? "/superAdmin" : "/admin/dashboard";

    return (
        <div className="container mx-auto py-8 px-4 animate-fade-in-up">
            <Button variant="outline" asChild className="mb-6">
                <Link href={dashboardPath}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
                </Link>
            </Button>
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-primary">Manage Products</CardTitle>
                    <CardDescription>
                        {isSuperAdmin ? "Viewing all products across the store." : "View, edit, or delete items you have added."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ProductManagementTable />
                </CardContent>
            </Card>
        </div>
    );
}
