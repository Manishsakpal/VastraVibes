
"use client";

import { useItemContext } from '@/context/item-context';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useAdminAuth } from '@/context/admin-auth-context';

export default function ProductManagementTable() {
    const { items, deleteItem, isLoading } = useItemContext();
    const { currentAdminId } = useAdminAuth();
    const { toast } = useToast();

    const handleDelete = (itemId: string, itemTitle: string) => {
        deleteItem(itemId);
        toast({
            title: 'Item Deleted',
            description: `"${itemTitle}" has been removed from the store.`,
            variant: 'destructive',
        });
    };
    
    if (isLoading) {
        return <p>Loading products...</p>;
    }

    const adminItems = items.filter(item => item.adminId === currentAdminId);

    return (
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[80px]">Image</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {adminItems.length > 0 ? adminItems.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell>
                                <Image
                                    src={item.imageUrls[0] || 'https://placehold.co/100x100.png'}
                                    alt={item.title}
                                    width={50}
                                    height={66}
                                    className="rounded-md object-contain"
                                />
                            </TableCell>
                            <TableCell className="font-medium">{item.title}</TableCell>
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
                            <TableCell colSpan={5} className="text-center h-24">
                                You have not added any products yet.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
