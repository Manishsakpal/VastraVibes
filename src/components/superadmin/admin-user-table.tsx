
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAdminAuth } from '@/context/admin-auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';
import { adminUserSchema } from '@/lib/schemas';

type AdminFormValues = z.infer<typeof adminUserSchema>;

export default function AdminUserTable() {
  const { admins, addAdmin, removeAdmin } = useAdminAuth();
  const { toast } = useToast();

  const form = useForm<AdminFormValues>({
    resolver: zodResolver(adminUserSchema),
    defaultValues: { id: '', password: '' },
  });

  const onSubmit = async (data: AdminFormValues) => {
    const status = await addAdmin(data.id, data.password);
    
    switch (status) {
      case 'SUCCESS':
        toast({ title: 'Admin Added', description: `Admin "${data.id}" has been created.` });
        form.reset();
        break;
      case 'ALREADY_EXISTS':
        toast({ title: 'Creation Failed', description: `Admin with ID "${data.id}" already exists.`, variant: 'destructive' });
        break;
      case 'CONFLICTS_WITH_SUPERADMIN':
        toast({ title: 'Creation Failed', description: `That ID is reserved for the Super Admin. Please choose a different ID.`, variant: 'destructive' });
        break;
      case 'ERROR':
        toast({ title: 'Error', description: 'A database error occurred. Please try again.', variant: 'destructive' });
        break;
    }
  };

  const handleDelete = (adminId: string) => {
    removeAdmin(adminId);
    toast({ title: 'Admin Removed', description: `Admin "${adminId}" has been removed.`, variant: 'destructive' });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Current Admins</CardTitle>
          <CardDescription>A list of all standard admin users for the store.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admin ID</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-mono">{admin.id}</TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently remove the admin "{admin.id}". This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(admin.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Remove Admin
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add New Admin</CardTitle>
           <CardDescription>Create a new standard admin user account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Admin ID</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., new.admin" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                 {form.formState.isSubmitting ? 'Adding...' : 'Add Admin User'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
