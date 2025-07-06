
"use client";

import { useItemContext } from '@/context/item-context';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Loader2, PlusCircle, Trash2, User } from 'lucide-react';
import Image from 'next/image';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useAdminAuth } from '@/context/admin-auth-context';
import { useMemo } from 'react';

export default function ProductManagementTable() {
    const { items, deleteItem, isLoading: isItemsLoading } = useItemContext();
    const { currentAdminId, isSuperAdmin, isLoading: isAdminLoading } = useAdminAuth();
    const { toast } = useToast();

    const isLoading = isItemsLoading || isAdminLoading;

    const handleDelete = (itemId: string, itemTitle: string) => {
        deleteItem(itemId);
        toast({
            title: 'Item Deleted',
            description: `"${itemTitle}" has been removed from the store.`,
            variant: 'destructive',
        });
    };
    
    const productsToShow = useMemo(() => {
        if (isSuperAdmin) {
            return items; // Super Admin sees all items
        }
        if (!currentAdminId) {
            return []; // Should not happen if logged in, but a safe guard
        }
        // Standard admin sees only their own items
        return items.filter(item => item.adminId === currentAdminId);
    }, [items, currentAdminId, isSuperAdmin]);


    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-4">Loading products...</p>
            </div>
        );
    }

    return (
        <div className="border rounded-lg overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[80px]">Image</TableHead>
                        <TableHead>Title</TableHead>
                        {isSuperAdmin && <TableHead>Sold By</TableHead>}
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {productsToShow.length > 0 ? productsToShow.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell>
                                <Image
                                    src={item.imageUrls[0] || 'https://placehold.co/100x100.png'}
                                    alt={item.title}
                                    width={50}
                                    height={66}
                                    className="rounded-md object-contain bg-white"
                                />
                            </TableCell>
                            <TableCell className="font-medium min-w-[200px]">{item.title}</TableCell>
                            {isSuperAdmin && (
                              <TableCell>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <User className="h-3 w-3" />
                                    {item.adminId || 'Unknown'}
                                </div>
                              </TableCell>
                            )}
                            <TableCell>{item.category}</TableCell>
                            <TableCell className="text-right">₹{item.finalPrice.toFixed(2)}</TableCell>
                            <TableCell className="text-center">
                                <Button variant="ghost" size="icon" asChild>
                                    <Link href={`/admin/edit-item/${item.id}`}>
                                        <Edit className="h-4 w-4" />
                                        <span className="sr-only">Edit</span>
                                    </Link>
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                            <Trash2 className="h-4 w-4" />
                                            <span className="sr-only">Delete</span>
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete the item
                                                 "{item.title}" from your store.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction 
                                                onClick={() => handleDelete(item.id, item.title)} 
                                                className="bg-destructive hover:bg-destructive/90"
                                            >
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </TableCell>
                        </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={isSuperAdmin ? 6 : 5} className="h-48">
                                <div className="flex flex-col items-center justify-center text-center gap-3">
                                    <h3 className="text-xl font-semibold text-foreground">
                                        {isSuperAdmin ? "No products in the store yet." : "Your store is ready!"}
                                    </h3>
                                    <p className="text-muted-foreground">
                                        {isSuperAdmin ? "Once an admin adds a product, it will appear here." : "It looks like you haven't added any products yet. Let's fix that."}
                                    </p>
                                    {!isSuperAdmin && (
                                      <Button asChild>
                                          <Link href="/admin/add-item">
                                              <PlusCircle className="mr-2 h-4 w-4" />
                                              Add Your First Product
                                          </Link>
                                      </Button>
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
