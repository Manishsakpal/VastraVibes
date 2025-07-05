
"use client";

import { useState, FormEvent, useEffect, useCallback } from 'react';
import { useOrderContext } from '@/context/order-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import type { Order, OrderStatus } from '@/types';
import { AlertCircle, PackageSearch, Search } from 'lucide-react';
import { RECENT_ORDER_ID_KEY } from '@/lib/constants';

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

  const searchOrderById = useCallback((idToSearch: string) => {
    if (!idToSearch) return;

    const order = orders.find(o => o.id.toLowerCase() === idToSearch.trim().toLowerCase());

    if (order) {
      setFoundOrder(order);
      setError('');
    } else {
      setFoundOrder(null);
      setError('No order found with that ID. Please check the ID and try again.');
    }
  }, [orders]);

  useEffect(() => {
    if (isLoading) return; // Wait until orders are loaded
    try {
      const recentOrderId = localStorage.getItem(RECENT_ORDER_ID_KEY);
      if (recentOrderId) {
        setOrderId(recentOrderId);
        searchOrderById(recentOrderId);
      }
    } catch (error) {
      console.warn("Could not read recent order ID from localStorage:", error);
    }
  }, [isLoading, orders, searchOrderById]);


  const handleTrackOrder = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setFoundOrder(null);

    if (!orderId.trim()) {
      setError('Please enter an Order ID.');
      return;
    }
    searchOrderById(orderId);
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
              placeholder="Enter your Order ID"
              className="flex-grow"
              aria-label="Order ID"
            />
            <Button type="submit" className="w-full sm:w-auto" disabled={isLoading}>
                <Search className="mr-2 h-4 w-4"/>
                {isLoading ? 'Loading...' : 'Track'}
            </Button>
          </form>

          {error && !foundOrder && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Tracking Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {foundOrder && (
            <div className="animate-fade-in-up mt-6 space-y-6">
              <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Order Details</CardTitle>
                    <div className="flex flex-col sm:flex-row sm:justify-between text-sm text-muted-foreground">
                      <p><strong>Order ID:</strong> <span className="font-mono">{foundOrder.id}</span></p>
                      <p><strong>Placed on:</strong> {new Date(foundOrder.date).toLocaleString()}</p>
                    </div>
                </CardHeader>
                <CardContent>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-2">Shipping To:</h4>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>{foundOrder.customerDetails.name}</p>
                          <p>{foundOrder.customerDetails.address}</p>
                          <p>{foundOrder.customerDetails.city}, {foundOrder.customerDetails.state} {foundOrder.customerDetails.zip}</p>
                           <p>Email: {foundOrder.customerDetails.email}</p>
                           <p>Phone: {foundOrder.customerDetails.phone}</p>
                        </div>
                      </div>
                      <div>
                          <h4 className="font-semibold mb-2">Total Amount:</h4>
                          <p className="text-2xl font-bold text-primary">₹{foundOrder.totalAmount.toFixed(2)}</p>
                      </div>
                   </div>
                </CardContent>
              </Card>

              <div>
                  <h3 className="text-lg font-semibold mb-4">Item Status</h3>
                  <ul className="space-y-4">
                    {foundOrder.items.map(item => (
                      <li key={item.id} className="flex flex-col sm:flex-row items-start gap-4 p-4 border rounded-md bg-muted/50">
                        <Image src={item.imageUrls[0]} alt={item.title} width={80} height={80} className="rounded-md object-contain bg-white"/>
                        <div className="flex-grow">
                            <p className="font-medium">{item.title}</p>
                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                            <p className="text-sm text-muted-foreground">Price: ₹{(item.finalPrice ?? 0).toFixed(2)}</p>
                        </div>
                        <div className="flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto">
                           <Badge variant={statusBadgeVariant(item.status)} className="capitalize text-sm py-1 px-3">{item.status}</Badge>
                        </div>
                      </li>  
                    ))}
                  </ul>
              </div>

            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
