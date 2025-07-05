"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAdminAuth } from '@/context/admin-auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';

const adminSchema = {
  id: (val: string) => val.length >= 3 || 'ID must be at least 3 characters',
  password: (val: string) => val.length >= 6 || 'Password must be at least 6 characters',
  name: (val: string) => val.length >= 2 || 'Name must be at least 2 characters',
};

export default function AdminUserTable() {
  const { admins, addAdmin, removeAdmin } = useAdminAuth();
  const { toast } = useToast();

  const form = useForm({
    defaultValues: { id: '', password: '', name: '' },
    mode: 'onChange',
  });

  const onSubmit = (data: { id: string; password: string; name: string; }) => {
    if (addAdmin(data.id, data.password, data.name)) {
      toast({ title: 'Admin Added', description: `Admin "${data.name}" has been created.` });
      form.reset();
    } else {
      toast({ title: 'Error', description: `Admin with ID "${data.id}" already exists.`, variant: 'destructive' });
    }
  };

  const handleDelete = (adminId: string, adminName: string) => {
    removeAdmin(adminId);
    toast({ title: 'Admin Removed', description: `Admin "${adminName}" has been removed.`, variant: 'destructive' });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Current Admins</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Admin ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-mono">{admin.id}</TableCell>
                  <TableCell>{admin.name}</TableCell>
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
                            This will permanently remove the admin "{admin.name}". This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(admin.id, admin.name)}
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add New Admin</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="id"
                  rules={{ validate: adminSchema.id }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin ID</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., newadmin" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                   rules={{ validate: adminSchema.password }}
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
                <FormField
                  control={form.control}
                  name="name"
                   rules={{ validate: adminSchema.name }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Jane Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" disabled={!form.formState.isValid}>
                Add Admin User
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
