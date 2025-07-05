
"use client";

import { useOrderContext } from '@/context/order-context';
import { useAdminAuth } from '@/context/admin-auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowLeft, Loader2, PackageOpen, User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useMemo } from 'react';

export default function OrdersPage() {
  const { orders, isLoading: isOrdersLoading } = useOrderContext();
  const { currentAdminId, isSuperAdmin, isLoading: isAdminLoading } = useAdminAuth();

  const isLoading = isOrdersLoading || isAdminLoading;

  const relevantOrders = useMemo(() => {
    if (isSuperAdmin) {
      return orders; // Super admin sees all orders
    }
    if (!currentAdminId) {
      return []; // No admin logged in, show no orders
    }
    // Regular admin sees only orders containing at least one of their products
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
                
                // Filter items for the current admin's view, if not a super admin
                const itemsForThisAdmin = isSuperAdmin
                  ? order.items
                  : order.items.filter(item => item.adminId === currentAdminId);

                // Calculate the sub-total for this admin's items in this order
                const subTotalForThisAdmin = itemsForThisAdmin.reduce((acc, item) => {
                  const finalPricePerItem = item.finalPrice ?? (item.price * (1 - (item.discount ?? 0) / 100));
                  return acc + (finalPricePerItem * item.quantity);
                }, 0);


                return (
                  <AccordionItem value={order.id} key={order.id}>
                    <AccordionTrigger>
                      <div className="flex justify-between w-full pr-4">
                        <span className="font-mono text-sm">{order.id}</span>
                        <span className="text-muted-foreground text-sm">{new Date(order.date).toLocaleString()}</span>
                        <span className="font-bold">
                          {isSuperAdmin ? `₹${order.totalAmount.toFixed(2)}` : `Your items: ₹${subTotalForThisAdmin.toFixed(2)}`}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted/50 rounded-md">
                        <div>
                          <h4 className="font-semibold mb-2">Customer Details</h4>
                          <p><strong>Name:</strong> {order.customerDetails.name}</p>
                          <p><strong>Email:</strong> {order.customerDetails.email}</p>
                          <p><strong>Phone:</strong> {order.customerDetails.phone}</p>
                          <p><strong>Address:</strong> {order.customerDetails.address}, {order.customerDetails.city}, {order.customerDetails.state} {order.customerDetails.zip}</p>
                        </div>
                        <div>
                           <h4 className="font-semibold mb-2">
                            {isSuperAdmin ? 'Purchased Items' : 'Your Purchased Items'}
                          </h4>
                          <ul className="space-y-3">
                            {itemsForThisAdmin.map(item => {
                              return (
                                <li key={item.id} className="flex items-start gap-3">
                                  <Image 
                                    src={item.imageUrls[0]} 
                                    alt={item.title} 
                                    width={40} 
                                    height={40}
                                    className="rounded-sm object-contain bg-white" 
                                  />
                                  <div className="flex-grow">
                                    <p className="font-medium text-sm">{item.title}</p>
                                    <p className="text-xs text-muted-foreground">Qty: {item.quantity} @ ₹{item.finalPrice.toFixed(2)}</p>
                                    {isSuperAdmin && item.adminId && (
                                      <div className="flex items-center text-xs text-accent mt-1">
                                        <User className="mr-1.5 h-3 w-3" />
                                        <span>Sold by: {item.adminId}</span>
                                      </div>
                                    )}
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
