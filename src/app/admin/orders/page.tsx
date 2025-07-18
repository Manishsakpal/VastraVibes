
"use client";

import { useOrderContext } from '@/context/order-context';
import { useAdminAuth } from '@/context/admin-auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, PackageOpen, User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useMemo } from 'react';
import type { OrderStatus, OrderItem } from '@/types';

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


export default function OrdersPage() {
  const { orders, isLoading: isOrdersLoading, updateOrderItemStatus } = useOrderContext();
  const { isSuperAdmin, currentAdminId, isLoading: isAdminLoading } = useAdminAuth();

  const isLoading = isOrdersLoading || isAdminLoading;
  
  const relevantOrders = useMemo(() => {
    if (isSuperAdmin) {
      return orders;
    }
    if (!currentAdminId) {
      return [];
    }
    return orders.filter(order =>
      order.items.some(item => item.adminId === currentAdminId)
    );
  }, [orders, currentAdminId, isSuperAdmin]);

  const dashboardPath = isSuperAdmin ? "/superAdmin" : "/admin/dashboard";

  return (
    <div className="container mx-auto py-8 px-4 animate-fade-in-up">
      <Button variant="outline" asChild className="mb-6">
        <Link href={dashboardPath}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Customer Orders</CardTitle>
          <CardDescription>
            {isSuperAdmin ? "Viewing all orders across the store." : "Viewing orders containing your products."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-4">Loading orders...</p>
            </div>
          ) : relevantOrders.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center">
              <PackageOpen className="h-20 w-20 text-muted-foreground mb-4" />
              <p className="text-xl text-muted-foreground">No relevant orders have been placed yet.</p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {relevantOrders.map((order) => {
                
                const itemsForThisAdmin = isSuperAdmin
                  ? order.items
                  : order.items.filter(item => item.adminId === currentAdminId);
                
                if (itemsForThisAdmin.length === 0 && !isSuperAdmin) {
                    return null;
                }

                const subTotalForThisAdmin = itemsForThisAdmin.reduce((acc, item) => {
                  const finalPricePerItem = item.finalPrice ?? (item.price * (1 - (item.discount ?? 0) / 100));
                  return acc + (finalPricePerItem * item.quantity);
                }, 0);


                return (
                  <AccordionItem value={order.id} key={order.id}>
                    <AccordionTrigger>
                      <div className="flex flex-col text-left sm:flex-row sm:justify-between w-full pr-4 sm:items-center gap-2">
                        <span className="font-mono text-sm">{order.id}</span>
                        <span className="text-muted-foreground text-xs">{new Date(order.date).toLocaleString()}</span>
                        <span className="font-bold text-sm">
                          {isSuperAdmin ? `₹${order.totalAmount.toFixed(2)}` : `Your items: ₹${subTotalForThisAdmin.toFixed(2)}`}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted/50 rounded-md">
                        <div>
                          <h4 className="font-semibold mb-2">Customer Details</h4>
                          <p className="text-sm"><strong>Name:</strong> {order.customerDetails.name}</p>
                          <p className="text-sm"><strong>Email:</strong> {order.customerDetails.email}</p>
                          <p className="text-sm"><strong>Phone:</strong> {order.customerDetails.phone}</p>
                          <p className="text-sm"><strong>Address:</strong> {order.customerDetails.address}, {order.customerDetails.city}, {order.customerDetails.state} {order.customerDetails.zip}</p>
                        </div>
                        <div>
                           <h4 className="font-semibold mb-2">
                            {isSuperAdmin ? 'Purchased Items' : 'Your Purchased Items'}
                          </h4>
                          <ul className="space-y-4">
                            {itemsForThisAdmin.map(item => {
                              const isActionDisabled = item.status === 'Delivered' || item.status === 'Cancelled';
                              return (
                                <li key={item.id} className="flex flex-col sm:flex-row items-start gap-3">
                                  <Image 
                                    src={item.imageUrls[0]} 
                                    alt={item.title} 
                                    width={50} 
                                    height={50}
                                    className="rounded-sm object-contain bg-white" 
                                  />
                                  <div className="flex-grow">
                                    <p className="font-medium text-sm">{item.title}</p>
                                    <p className="text-xs text-muted-foreground">Qty: {item.quantity} @ ₹{(item.finalPrice ?? 0).toFixed(2)}</p>
                                    
                                    {isSuperAdmin && item.adminId && (
                                      <div className="flex items-center text-xs text-primary mt-1">
                                        <User className="mr-1.5 h-3 w-3" />
                                        <span>Sold by: {item.adminId ?? 'Unknown Seller'}</span>
                                      </div>
                                    )}

                                    <div className="flex items-center gap-4 mt-2">
                                      <Badge variant={statusBadgeVariant(item.status)} className="capitalize">{item.status}</Badge>
                                      
                                      <Select
                                        value={item.status}
                                        onValueChange={(newStatus: OrderStatus) => updateOrderItemStatus(order.id, item.id, newStatus)}
                                        disabled={isActionDisabled}
                                      >
                                        <SelectTrigger className="h-8 w-[140px] text-xs">
                                          <SelectValue placeholder="Update status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="Placed">Placed</SelectItem>
                                          <SelectItem value="Shipped">Shipped</SelectItem>
                                          <SelectItem value="Delivered">Delivered</SelectItem>
                                          <SelectItem value="Cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
