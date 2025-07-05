
"use client";

import { useItemContext } from '@/context/item-context';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EditItemForm from '@/components/admin/edit-item-form';
import Link from 'next/link';

const EditItemPage = () => {
  const { items, isLoading } = useItemContext();
  const params = useParams();
  const id = params.id as string;

  const item = items.find(p => p.id === id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading Item...</p>
      </div>
    );
  }

  if (!item) {
    return (
        <div className="container mx-auto py-8 text-center">
            <h1 className="text-2xl font-bold">Item Not Found</h1>
            <p className="text-muted-foreground">The item you are trying to edit does not exist.</p>
            <Button asChild className="mt-4">
                <Link href="/admin/manage-products">Go Back</Link>
            </Button>
        </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 animate-fade-in-up">
       <Button variant="outline" asChild className="mb-6">
        <Link href="/admin/manage-products">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Product List
        </Link>
      </Button>
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Edit Item</CardTitle>
          <CardDescription>Update the details for "{item.title}".</CardDescription>
        </CardHeader>
        <CardContent>
          <EditItemForm item={item} />
        </CardContent>
      </Card>
    </div>
  );
};

export default EditItemPage;
