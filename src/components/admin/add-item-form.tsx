"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useItemContext } from '@/context/item-context';
import { CATEGORIES } from '@/lib/constants';
import type { Category } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { addItemSchema } from '@/lib/schemas';

type AddItemFormValues = z.infer<typeof addItemSchema>;

const AddItemForm = () => {
  const { addItem } = useItemContext();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<AddItemFormValues>({
    resolver: zodResolver(addItemSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      size: '',
      category: undefined, // Or provide a default category if desired
      imageUrl: '',
      imageHint: '',
    },
  });

  const onSubmit = (data: AddItemFormValues) => {
    addItem(data);
    toast({
      title: 'Item Added!',
      description: `${data.title} has been successfully added to the store.`,
    });
    form.reset();
    router.push('/admin/dashboard'); // Optionally redirect or stay on page
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Men's Silk Kurta" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Detailed description of the item..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price ($)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="e.g., 49.99"
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Pass empty string or a parsed float. Zod will coerce and validate.
                    // This prevents `NaN` from being passed to the form state.
                    field.onChange(value === "" ? "" : parseFloat(value));
                  }}
                  // Ensure the input value is never NaN and doesn't show the initial 0.
                  value={isNaN(field.value) || field.value === 0 ? "" : field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="size"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Size(s)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., S, M, L or Free Size" {...field} />
              </FormControl>
              <FormDescription>Enter available sizes, comma-separated.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input type="url" placeholder="https://example.com/image.png" {...field} />
              </FormControl>
              <FormDescription>Enter a direct URL to the item image. Use placehold.co for placeholders.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="imageHint"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image Hint (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 'blue saree' or 'mens shoes'" {...field} />
              </FormControl>
              <FormDescription>Two keywords for placeholder image services if the main URL is a placeholder (e.g., placehold.co). Example: "red dress"</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Adding Item...' : 'Add Item'}
        </Button>
      </form>
    </Form>
  );
};

export default AddItemForm;
