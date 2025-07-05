import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AdminUserTable from "@/components/superadmin/admin-user-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ClipboardList } from "lucide-react";

export default function SuperAdminPage() {
    return (
        <div className="container mx-auto py-8 px-4 animate-fade-in-up space-y-8">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-primary">Super Admin Panel</CardTitle>
                    <CardDescription>Manage administrator accounts for the Vastra Vibes store.</CardDescription>
                </CardHeader>
                <CardContent>
                    <AdminUserTable />
                </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <ClipboardList className="text-green-600 h-6 w-6" />
                        View All Orders
                    </CardTitle>
                    <CardDescription>Review all customer orders placed across the store.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild className="w-full">
                        <Link href="/admin/orders">
                            View All Orders
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
