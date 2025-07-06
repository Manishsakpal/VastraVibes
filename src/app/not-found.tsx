
"use client";

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="text-center py-20 flex flex-col items-center animate-fade-in-up">
      <SearchX className="h-24 w-24 text-destructive mb-4" />
      <h1 className="text-4xl font-bold text-primary mb-2">404 - Page Not Found</h1>
      <p className="text-lg text-muted-foreground mb-6">
        Sorry, the page you are looking for does not exist or has been moved.
      </p>
      <Button asChild size="lg">
        <Link href="/">Return to Homepage</Link>
      </Button>
    </div>
  )
}
