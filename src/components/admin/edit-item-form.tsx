
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useItemContext } from '@/context/item-context';
import { CATEGORIES, SIZES, COLORS } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { addItemSchema } from '@/lib/schemas';
import { Checkbox } from '../ui/checkbox';
import type { ClothingItem } from '@/types';

type EditItemFormValues = z.infer<typeof addItemSchema>;

interface EditItemFormProps {
  item: ClothingItem;
}

const EditItemForm = ({ item }: EditItemFormProps) => {
  const { updateItem } = useItemContext();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<EditItemFormValues>({
    resolver: zodResolver(addItemSchema),
    defaultValues: {
      title: item.title,
      description: item.description,
      price: item.price,
      discount: item.discount === 0 ? undefined : item.discount,
      size: item.size.split(', ').filter(Boolean),
      colors: item.colors.split(', ').filter(Boolean),
      category: item.category,
      imageUrls: item.imageUrls.join('\n'),
      imageHints: item.imageHints?.join('\n') || '',
      specifications: item.specifications?.join('\n') || '',
    },
  });

  const onSubmit = (data: EditItemFormValues) => {
    // Process the form data back into the format the context expects
    const processedData = {
        ...data,
        price: data.price,
        discount: data.discount || 0,
        size: data.size.join(', '),
        colors: data.colors.join(', '),
        imageUrls: data.imageUrls.split('\n').map(url => url.trim()).filter(url => url),
        imageHints: data.imageHints?.split('\n').map(hint => hint.trim()).filter(hint => hint) || [],
        specifications: data.specifications?.split('\n').map(spec => spec.trim()).filter(spec => spec) || [],
      };

    updateItem(item.id, processedData);
    toast({
      title: 'Item Updated!',
      description: `${data.title} has been successfully updated.`,
    });
    router.push('/admin/manage-products');
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
                    value={field.value ?? ''}
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
                     value={field.value ?? ''}
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
          render={() => (
            <FormItem>
              <FormLabel>Available Sizes</FormLabel>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {SIZES.map((item) => (
                  <FormField
                    key={item}
                    control={form.control}
                    name="size"
                    render={({ field }) => (
                      <FormItem key={item} className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(item)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...(field.value || []), item])
                                : field.onChange(field.value?.filter((value) => value !== item));
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal text-sm">{item}</FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="colors"
          render={() => (
            <FormItem>
              <FormLabel>Available Colors</FormLabel>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {COLORS.map((item) => (
                  <FormField
                    key={item}
                    control={form.control}
                    name="colors"
                    render={({ field }) => (
                      <FormItem key={item} className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(item)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...(field.value || []), item])
                                : field.onChange(field.value?.filter((value) => value !== item));
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal text-sm">{item}</FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
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
          {form.formState.isSubmitting ? 'Saving Changes...' : 'Save Changes'}
        </Button>
      </form>
    </Form>
  );
};

export default EditItemForm;
