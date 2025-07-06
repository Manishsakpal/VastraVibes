import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ClipboardList, Users } from "lucide-react";
import StatsCards from "@/components/superadmin/stats-cards";

export default function SuperAdminPage() {
    return (
        <div className="container mx-auto py-8 px-4 animate-fade-in-up space-y-8">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold text-primary">Super Admin Dashboard</CardTitle>
                    <CardDescription>An overview of your store's performance and management tools.</CardDescription>
                </CardHeader>
                <CardContent>
                    <StatsCards />
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Users className="text-accent h-6 w-6" />
                            Manage Admins
                        </CardTitle>
                        <CardDescription>Add or remove standard admin user accounts for your store.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                            <Link href="/admin/user-management">
                                Go to User Management
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
                
                <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <ClipboardList className="text-primary h-6 w-6" />
                            View All Orders
                        </CardTitle>
                        <CardDescription>Review all customer orders placed across the entire store.</CardDescription>
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
        </div>
    );
}
