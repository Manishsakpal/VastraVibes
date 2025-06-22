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
      discount: 0,
      size: '',
      category: undefined,
      imageUrls: '',
      imageHints: '',
      specifications: '',
    },
  });

  const onSubmit = (data: AddItemFormValues) => {
    const processedData = {
        ...data,
        imageUrls: data.imageUrls.split('\n').map(url => url.trim()).filter(url => url),
        imageHints: data.imageHints?.split('\n').map(hint => hint.trim()).filter(hint => hint) || [],
        specifications: data.specifications?.split('\n').map(spec => spec.trim()).filter(spec => spec) || [],
      };

    addItem(processedData);
    toast({
      title: 'Item Added!',
      description: `${data.title} has been successfully added to the store.`,
    });
    form.reset();
    router.push('/admin/dashboard');
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (₹)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="e.g., 2999.00"
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === "" ? "" : parseFloat(value));
                    }}
                    value={isNaN(field.value) || field.value === 0 ? "" : field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="discount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="e.g., 15"
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === "" ? "" : parseInt(value, 10));
                    }}
                    value={isNaN(field.value) || field.value === 0 ? "" : field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>


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
          name="imageUrls"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URLs</FormLabel>
              <FormControl>
                <Textarea placeholder="https://example.com/image1.png&#10;https://example.com/image2.png" {...field} rows={4} />
              </FormControl>
              <FormDescription>Enter one image URL per line. The first URL will be the primary image.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="imageHints"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image Hints (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="blue saree&#10;red dress" {...field} rows={4} />
              </FormControl>
              <FormDescription>Enter one hint per line, corresponding to each image URL. Max two keywords per hint.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specifications"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Specifications (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Feature 1: Detail&#10;Feature 2: Detail" {...field} rows={4} />
              </FormControl>
              <FormDescription>Enter one specification per line. These will be displayed as a list on the product page.</FormDescription>
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
