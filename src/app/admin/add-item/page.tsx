"use client";

import AddItemForm from '@/components/admin/add-item-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { Metadata } from 'next';

// export const metadata: Metadata = {
//   title: 'Add New Item',
//   description: 'Add a new clothing item to the Vastra Vibes store.',
// };

const AddItemPage = () => {
  return (
    <div className="container mx-auto py-8 px-4">
       <Button variant="outline" asChild className="mb-6">
        <Link href="/admin/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Add New Clothing Item</CardTitle>
          <CardDescription>Fill in the details below to add a new item to your store.</CardDescription>
        </CardHeader>
        <CardContent>
          <AddItemForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default AddItemPage;
