"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, ShoppingBag, Users, ClipboardList } from 'lucide-react';

const AdminDashboardPage = () => {
  return (
    <div className="container mx-auto py-8 px-4 animate-fade-in-up">
      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">Admin Dashboard</CardTitle>
          <CardDescription>Welcome to the Vastra Vibes control panel. Manage your store's content here.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <PlusCircle className="text-accent h-6 w-6" />
              Add New Item
            </CardTitle>
            <CardDescription>Expand your collection by adding new clothing items to the store.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/admin/add-item">
                Go to Add Item Page
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <ShoppingBag className="text-primary h-6 w-6" />
              Manage Products
            </CardTitle>
            <CardDescription>View, edit, or remove existing products from your inventory.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/admin/manage-products">
                View Products
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <ClipboardList className="text-green-600 h-6 w-6" />
              View Orders
            </CardTitle>
            <CardDescription>Review customer orders and their details.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/admin/orders">
                View Orders
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="text-secondary-foreground h-6 w-6" />
              User Management
            </CardTitle>
            <CardDescription>Oversee customer accounts and roles.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/admin/user-management">
                Manage Users
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
