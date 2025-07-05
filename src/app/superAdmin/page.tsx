import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AdminUserTable from "@/components/superadmin/admin-user-table";

export default function SuperAdminPage() {
    return (
        <div className="container mx-auto py-8 px-4 animate-fade-in-up">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-primary">Super Admin Panel</CardTitle>
                    <CardDescription>Manage administrator accounts for the Vastra Vibes store.</CardDescription>
                </CardHeader>
                <CardContent>
                    <AdminUserTable />
                </CardContent>
            </Card>
        </div>
    );
}
