
"use client";

import { useBagContext } from '@/context/bag-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const BagSkeleton = () => (
  <div className="container mx-auto py-8">
    <Skeleton className="h-9 w-1/2 mb-6" />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center p-4">
                  <Skeleton className="h-24 w-24 rounded-md mr-4" />
                  <div className="flex-grow space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                  <div className="text-right space-y-2">
                    <Skeleton className="h-5 w-20" />
                     <Skeleton className="h-8 w-8 ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <div>
        <Card className="shadow-lg">
          <CardHeader>
            <Skeleton className="h-7 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
             </div>
            <Separator />
            <Skeleton className="h-7 w-full" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-12 w-full" />
          </CardFooter>
        </Card>
      </div>
    </div>
  </div>
);


export default function BagPage() {
  const { cartItems, removeFromBag, updateQuantity, totalPrice, cartCount, isLoading } = useBagContext();
  const TAX_RATE = 0.08; // 8% tax
  const shipping = cartCount > 0 ? 100.00 : 0;
  const taxes = totalPrice * TAX_RATE;
  const grandTotal = totalPrice + taxes + shipping;

  if (isLoading) {
    return <BagSkeleton />;
  }

  if (cartCount === 0) {
    return (
      <div className="text-center py-20 flex flex-col items-center animate-fade-in-up">
        <ShoppingBag className="h-24 w-24 text-muted-foreground mb-4" />
        <h1 className="text-3xl font-bold text-primary mb-2">Your Bag is Empty</h1>
        <p className="text-muted-foreground mb-6">Looks like you haven’t added anything to your bag yet.</p>
        <Button asChild>
          <Link href="/">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 animate-fade-in-up">
      <h1 className="text-3xl font-bold mb-6 text-primary">Your Shopping Bag ({cartCount})</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              <ul className="divide-y divide-border">
                {cartItems.map(item => {
                  const hasDiscount = typeof item.discount === 'number' && item.discount > 0;
                  const finalPrice = hasDiscount ? item.price * (1 - item.discount! / 100) : item.price;
                  
                  const safeImageUrl = item.imageUrls?.[0] || 'https://placehold.co/100x100.png';

                  return (
                    <li key={item.id} className="flex items-center p-4">
                      <div className="relative h-24 w-24 rounded-md overflow-hidden mr-4">
                        <Image src={safeImageUrl} alt={item.title} fill={true} className="object-contain" />
                      </div>
                      <div className="flex-grow">
                        <h2 className="font-semibold">{item.title}</h2>
                        <p className="text-sm">
                          {hasDiscount && (
                            <span className="text-muted-foreground line-through mr-2">₹{item.price.toFixed(2)}</span>
                          )}
                          <span className={hasDiscount ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                            ₹{finalPrice.toFixed(2)}
                          </span>
                        </p>
                        <div className="flex items-center mt-2">
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-10 text-center">{item.quantity}</span>
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₹{(finalPrice * item.quantity).toFixed(2)}</p>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive mt-2" onClick={() => removeFromBag(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <p>Subtotal</p>
                <p>₹{totalPrice.toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p>Shipping</p>
                <p>₹{shipping.toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p>Taxes ({(TAX_RATE * 100).toFixed(0)}%)</p>
                <p>₹{taxes.toFixed(2)}</p>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <p>Total</p>
                <p>₹{grandTotal.toFixed(2)}</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full" size="lg">
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
