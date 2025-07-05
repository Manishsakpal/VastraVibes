import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Construction } from "lucide-react";
import Link from "next/link";

export default function UserManagementPage() {
  return (
    <div className="container mx-auto py-8 px-4 animate-fade-in-up">
      <Button variant="outline" asChild className="mb-6">
        <Link href="/admin/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader className="items-center text-center">
            <Construction className="h-16 w-16 text-primary mb-4" />
            <CardTitle className="text-2xl font-bold">Under Construction</CardTitle>
            <CardDescription>The user management feature is currently in development.</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">This functionality will be available in a future update. Thank you for your patience!</p>
        </CardContent>
      </Card>
    </div>
  );
}
