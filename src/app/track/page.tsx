
"use client";

import { useState, FormEvent } from 'react';
import { useOrderContext } from '@/context/order-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import type { Order, OrderStatus } from '@/types';
import { AlertCircle, PackageSearch, Search, Truck } from 'lucide-react';

const statusBadgeVariant = (status: OrderStatus): 'default' | 'secondary' | 'outline' | 'destructive' => {
  switch (status) {
    case 'Delivered':
      return 'default';
    case 'Shipped':
      return 'secondary';
    case 'Cancelled':
      return 'destructive';
    case 'Placed':
    default:
      return 'outline';
  }
};

export default function TrackOrderPage() {
  const { orders, isLoading } = useOrderContext();
  const [orderId, setOrderId] = useState('');
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');

  const handleTrackOrder = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setFoundOrder(null);

    if (!orderId.trim()) {
      setError('Please enter an Order ID.');
      return;
    }

    const order = orders.find(o => o.id.toLowerCase() === orderId.trim().toLowerCase());

    if (order) {
      setFoundOrder(order);
    } else {
      setError('No order found with that ID. Please check the ID and try again.');
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl animate-fade-in-up">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold text-primary">
            <PackageSearch className="h-6 w-6" />
            Track Your Order
          </CardTitle>
          <CardDescription>Enter your Order ID below to check the status of your purchase.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTrackOrder} className="flex flex-col sm:flex-row items-start gap-4 mb-8">
            <Input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Enter your Order ID (e.g., order-1678886400000)"
              className="flex-grow text-base"
              aria-label="Order ID"
            />
            <Button type="submit" className="w-full sm:w-auto" disabled={isLoading}>
                <Search className="mr-2 h-4 w-4"/>
                {isLoading ? 'Loading...' : 'Track'}
            </Button>
          </form>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Tracking Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {foundOrder && (
            <div className="animate-fade-in-up">
              <h3 className="text-xl font-semibold mb-4">Order Details</h3>
              <Card>
                <CardHeader>
                    <CardTitle className="font-mono text-lg">{foundOrder.id}</CardTitle>
                    <CardDescription>Placed on: {new Date(foundOrder.date).toLocaleString()}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {foundOrder.items.map(item => (
                      <li key={item.id} className="flex flex-col sm:flex-row items-start gap-4 p-4 border rounded-md">
                        <Image src={item.imageUrls[0]} alt={item.title} width={80} height={80} className="rounded-md object-contain bg-white"/>
                        <div className="flex-grow">
                            <p className="font-medium">{item.title}</p>
                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                            <p className="text-sm text-muted-foreground">Price: ₹{item.finalPrice?.toFixed(2)}</p>
                        </div>
                        <div className="flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto">
                           <Badge variant={statusBadgeVariant(item.status)} className="capitalize text-sm py-1 px-3">{item.status}</Badge>
                           {item.trackingId && (
                                <Button asChild size="sm" variant="outline">
                                    <Link href={`https://www.bluedart.com/tracking?track=awb&awb_no_txt=${item.trackingId}`} target="_blank" rel="noopener noreferrer">
                                        <Truck className="mr-2 h-4 w-4"/>
                                        Track on Blue Dart
                                    </Link>
                                </Button>
                           )}
                        </div>
                      </li>  
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
