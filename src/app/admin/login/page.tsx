"use client";

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LogIn, AlertCircle } from 'lucide-react';
import type { Metadata } from 'next';

// Cannot define metadata in client component directly, will handle in layout or parent server component.
// For this standalone page, we are focusing on client logic.
// If SEO is critical for this page, convert to server component or use a higher-level metadata setup.

const AdminLoginPage = () => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { login, isAdmin, isLoading: authIsLoading } = useAdminAuth();

  useEffect(() => {
    if (isAdmin) {
      router.push('/admin/dashboard');
    }
  }, [isAdmin, router]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (login(id, password)) {
      router.push('/admin/dashboard');
    } else {
      setError('Invalid credentials. Please try again.');
    }
  };

  if (authIsLoading) {
     return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <LogIn className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }
  
  if (isAdmin) return null; // Or a loading spinner while redirecting

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-gradient-to-br from-background to-secondary/30 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <LogIn className="mx-auto h-12 w-12 text-primary mb-2" />
          <CardTitle className="text-3xl font-bold">Admin Login</CardTitle>
          <CardDescription>Access the Vastra Vibes control panel.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="adminId">Admin ID</Label>
              <Input
                id="adminId"
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="Enter admin ID"
                required
                className="text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="text-base"
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Login Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full text-lg py-3" disabled={authIsLoading}>
              {authIsLoading ? 'Authenticating...' : 'Login'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-xs text-muted-foreground">
          <p>Use provided credentials to access admin features.</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminLoginPage;

// Note: For actual metadata, `generateMetadata` would be used in a server component.
// export const metadata: Metadata = {
// title: 'Admin Login',
// description: 'Admin login page for Vastra Vibes.',
// };
