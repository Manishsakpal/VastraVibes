"use client";

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useBagContext } from '@/context/bag-context';
import { useItemContext } from '@/context/item-context';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { checkoutSchema } from '@/lib/schemas';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { cartItems, totalPrice, clearBag, isLoading, cartCount } = useBagContext();
  const { recordPurchase } = useItemContext();
  const { toast } = useToast();
  const router = useRouter();

  const TAX_RATE = 0.08;
  const shipping = 5.00;
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

  const onSubmit = (data: CheckoutFormValues) => {
    console.log('Order submitted:', data);
    
    // Record the purchase before clearing the bag
    recordPurchase(cartItems);

    toast({
      title: 'Order Placed!',
      description: 'Thank you for your purchase. A confirmation has been sent to your email.',
    });
    clearBag();
    router.push('/');
  };

  if (isLoading || cartCount === 0) {
    return <div className="text-center py-20">Loading checkout...</div>;
  }

  return (
    <div className="container mx-auto py-8">
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
                    {form.formState.isSubmitting ? 'Processing...' : 'Proceed to Payment'}
                  </Button>
                   <p className="text-xs text-center text-muted-foreground mt-2">
                    You will be redirected to PhonePe to complete your payment securely.
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
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <div className="relative h-12 w-12 rounded-md overflow-hidden mr-3">
                        <Image src={item.imageUrl} alt={item.title} layout="fill" objectFit="cover" />
                      </div>
                      <div>
                        <p className="font-medium truncate max-w-[150px]">{item.title}</p>
                        <p className="text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p>${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><p>Subtotal</p><p>${totalPrice.toFixed(2)}</p></div>
                <div className="flex justify-between"><p>Shipping</p><p>${shipping.toFixed(2)}</p></div>
                <div className="flex justify-between"><p>Taxes</p><p>${taxes.toFixed(2)}</p></div>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between font-bold text-lg">
                <p>Grand Total</p>
                <p>${grandTotal.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
