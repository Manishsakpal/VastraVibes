
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
import { AlertCircle, PackageSearch, Search, Trash2, History } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

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

const OrderDetails = ({ order }: { order: Order }) => {
  const { updateOrderItemStatus } = useOrderContext();
  const { toast } = useToast();

  const handleCancelItem = async (itemId: string, itemTitle: string) => {
    await updateOrderItemStatus(order.id, itemId, 'Cancelled');
    toast({
        title: 'Item Cancelled',
        description: `Your request to cancel "${itemTitle}" has been processed.`,
    });
  };

  return (
    <AccordionContent>
      <div className="p-4 border-t bg-muted/30">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-semibold mb-2 text-lg">Shipping Details</h4>
            <div className="text-sm text-foreground/90 space-y-1">
              <p><strong>{order.customerDetails.name}</strong></p>
              <p>{order.customerDetails.address}</p>
              <p>{order.customerDetails.city}, {order.customerDetails.state} {order.customerDetails.zip}</p>
              <p><strong>Email:</strong> {order.customerDetails.email}</p>
              <p><strong>Phone:</strong> {order.customerDetails.phone}</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-lg">Items in your Order</h4>
            <ul className="space-y-4">
              {order.items.map(item => (
                <li key={item.id} className="flex flex-col sm:flex-row items-start gap-4 p-4 border rounded-md bg-background shadow-sm">
                  <Image src={item.imageUrls[0]} alt={item.title} width={80} height={80} className="rounded-md object-contain bg-white"/>
                  <div className="flex-grow">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    <p className="text-sm text-muted-foreground">Price: ₹{(item.finalPrice ?? 0).toFixed(2)}</p>
                  </div>
                  <div className="flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto">
                    <Badge variant={statusBadgeVariant(item.status)} className="capitalize text-sm py-1 px-3">{item.status}</Badge>
                    {item.status === 'Placed' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-destructive border-destructive/50 hover:bg-destructive/10 hover:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Cancel Item
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure you want to cancel this item?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will cancel "{item.title}" from your order. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Go Back</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleCancelItem(item.id, item.title)} 
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Yes, Cancel Item
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </li>  
              ))}
            </ul>
          </div>
        </div>
      </div>
    </AccordionContent>
  )
}

export default function TrackOrderPage() {
  const { orders, isLoading, getOrderHistory, addOrderToHistory } = useOrderContext();
  const [searchInput, setSearchInput] = useState('');
  const [error, setError] = useState('');
  const [trackedOrders, setTrackedOrders] = useState<Order[]>([]);

  const findOrdersInContext = useCallback((orderIds: string[]) => {
    return orderIds
      .map(id => orders.find(o => o.id.toLowerCase() === id.toLowerCase()))
      .filter((o): o is Order => !!o);
  }, [orders]);
  
  useEffect(() => {
    if (isLoading) return;
    const historyIds = getOrderHistory();
    const foundInContext = findOrdersInContext(historyIds);
    setTrackedOrders(foundInContext);
  }, [isLoading, orders, getOrderHistory, findOrdersInContext]);
  
  const handleTrackOrder = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!searchInput.trim()) {
      setError('Please enter an Order ID.');
      return;
    }
    
    const idToSearch = searchInput.trim().toLowerCase();
    const order = orders.find(o => o.id.toLowerCase() === idToSearch);

    if (order) {
      if (!trackedOrders.some(o => o.id === order.id)) {
        setTrackedOrders(prev => [order, ...prev]);
      }
      addOrderToHistory(order.id);
      setSearchInput('');
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
          <CardDescription>Enter an Order ID to find a specific order, or see your recent order history below.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTrackOrder} className="flex flex-col sm:flex-row items-start gap-4 mb-8">
            <Input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Enter your Order ID"
              className="flex-grow"
              aria-label="Order ID"
            />
            <Button type="submit" className="w-full sm:w-auto" disabled={isLoading}>
                <Search className="mr-2 h-4 w-4"/>
                {isLoading ? 'Loading...' : 'Track'}
            </Button>
          </form>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Tracking Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      
      {trackedOrders.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><History className="h-5 w-5" /> Your Recent Order History</h2>
          <Accordion type="multiple" className="w-full border rounded-lg shadow-sm space-y-2">
            {trackedOrders.map(order => (
               <AccordionItem value={order.id} key={order.id} className="border-b-0 bg-card rounded-lg overflow-hidden">
                  <AccordionTrigger className="p-4 hover:no-underline text-sm sm:text-base">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full text-left items-center">
                        <div>
                            <p className="font-semibold text-muted-foreground text-xs">Order ID</p>
                            <p className="font-mono text-foreground truncate text-sm">{order.id}</p>
                        </div>
                        <div>
                            <p className="font-semibold text-muted-foreground text-xs">Date Placed</p>
                            <p className="text-foreground text-sm">{new Date(order.date).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="font-semibold text-muted-foreground text-xs">Items</p>
                            <p className="text-foreground font-medium text-sm">{order.items.length}</p>
                        </div>
                        <div className="sm:text-right">
                            <p className="font-semibold text-muted-foreground text-xs">Total</p>
                            <p className="font-bold text-primary text-lg">₹{order.totalAmount.toFixed(2)}</p>
                        </div>
                    </div>
                  </AccordionTrigger>
                  <OrderDetails order={order} />
                </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}
    </div>
  );
}
