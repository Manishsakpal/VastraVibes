
"use client";

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useBagContext } from '@/context/bag-context';
import { useItemContext } from '@/context/item-context';
import { useOrderContext } from '@/context/order-context';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { checkoutSchema } from '@/lib/schemas';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, CreditCard } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const CheckoutSkeleton = () => (
  <div className="container mx-auto py-8">
    <Skeleton className="h-10 w-40 mb-6" />
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
      <div className="lg:col-span-3">
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
            <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
            <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-10 w-full" /></div>
              <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-10 w-full" /></div>
              <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-10 w-full" /></div>
            </div>
            <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
            <Skeleton className="h-12 w-full mt-6" />
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2">
        <Card>
          <CardHeader><Skeleton className="h-7 w-3/4" /></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center"><Skeleton className="h-12 w-12 rounded-md mr-3" /><div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-3 w-12" /></div></div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <div className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /></div>
            <Separator className="my-4" />
            <Skeleton className="h-6 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);


export default function CheckoutPage() {
  const { cartItems, totalPrice, clearBag, isLoading, cartCount } = useBagContext();
  const { recordPurchase } = useItemContext();
  const { addOrder } = useOrderContext();
  const { toast } = useToast();
  const router = useRouter();

  const TAX_RATE = 0.08;
  const shippingThreshold = 450;
  const shippingCost = 50.00;
  const shipping = totalPrice > 0 && totalPrice < shippingThreshold ? shippingCost : 0;
  
  const taxes = totalPrice * TAX_RATE;
  const grandTotal = totalPrice + taxes + shipping;

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: '',
      email: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      phone: '',
    },
  });

  useEffect(() => {
    if (!isLoading && cartCount === 0) {
      router.replace('/');
    }
  }, [isLoading, cartCount, router]);

  const onSubmit = async (data: CheckoutFormValues) => {
    await recordPurchase(cartItems);
    await addOrder(cartItems, data, grandTotal);

    toast({
      title: 'Order Placed!',
      description: 'Thank you for your purchase. You are being redirected to track your order.',
    });

    clearBag();
    router.push('/track');
  };

  if (isLoading || cartCount === 0) {
    return <CheckoutSkeleton />;
  }

  return (
    <div className="container mx-auto py-8 animate-fade-in-up">
       <Button variant="outline" asChild className="mb-6">
        <Link href="/bag">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Bag
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        {/* Shipping Form */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Shipping & Contact Information</CardTitle>
              <CardDescription>Please provide your details to complete the order.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                   <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="address" render={({ field }) => (
                    <FormItem><FormLabel>Street Address</FormLabel><FormControl><Input placeholder="123 Main St" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField control={form.control} name="city" render={({ field }) => (
                      <FormItem><FormLabel>City</FormLabel><FormControl><Input placeholder="Anytown" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="state" render={({ field }) => (
                      <FormItem><FormLabel>State / Province</FormLabel><FormControl><Input placeholder="CA" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="zip" render={({ field }) => (
                      <FormItem><FormLabel>ZIP / Postal Code</FormLabel><FormControl><Input placeholder="12345" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                   <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" placeholder="(123) 456-7890" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <Button type="submit" className="w-full mt-6" size="lg" disabled={form.formState.isSubmitting}>
                    <CreditCard className="mr-2 h-5 w-5" />
                    {form.formState.isSubmitting ? 'Redirecting to Payment...' : 'Proceed to Payment'}
                  </Button>
                   <p className="text-xs text-center text-muted-foreground mt-2">
                    You will be redirected to our secure payment partner to complete your purchase.
                  </p>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-2">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cartItems.map(item => {
                  const hasDiscount = typeof item.discount === 'number' && item.discount > 0;
                  const finalPrice = hasDiscount ? item.price * (1 - item.discount! / 100) : item.price;
                  const safeImageUrl = item.imageUrls?.[0] || 'https://placehold.co/100x100.png';

                  return (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <div className="relative h-12 w-12 rounded-md overflow-hidden mr-3 bg-white">
                          <Image src={safeImageUrl} alt={item.title} fill={true} className="object-contain" />
                        </div>
                        <div>
                          <p className="font-medium truncate max-w-[150px]">{item.title}</p>
                          <p className="text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p>₹{(finalPrice * item.quantity).toFixed(2)}</p>
                    </div>
                  )
                })}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><p>Subtotal</p><p>₹{totalPrice.toFixed(2)}</p></div>
                <div className="flex justify-between"><p>Shipping</p><p>{shipping > 0 ? `₹${shipping.toFixed(2)}` : 'FREE'}</p></div>
                <div className="flex justify-between"><p>Taxes</p><p>₹{taxes.toFixed(2)}</p></div>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between font-bold text-lg">
                <p>Grand Total</p>
                <p>₹{grandTotal.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
