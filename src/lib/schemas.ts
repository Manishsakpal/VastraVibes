import * as z from 'zod';
import { CATEGORIES } from './constants';

export const addItemSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters long." }).max(100),
  description: z.string().min(10, { message: "Description must be at least 10 characters long." }).max(500),
  price: z.coerce.number().positive({ message: "Price must be a positive number." }),
  size: z.string().min(1, { message: "Size information is required." }),
  category: z.enum(CATEGORIES, {
    errorMap: () => ({ message: "Please select a valid category." }),
  }),
  imageUrl: z.string().url({ message: "Please enter a valid image URL." }),
  imageHint: z.string().max(50, { message: "Image hint should be max 50 characters."}).optional(),
});

export const checkoutSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters long." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  address: z.string().min(10, { message: "Address must be at least 10 characters long." }),
  city: z.string().min(2, { message: "City must be at least 2 characters long." }),
  state: z.string().min(2, { message: "State/Province must be at least 2 characters long." }),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/, { message: "Please enter a valid ZIP code." }),
  phone: z.string().regex(/^(\+\d{1,3}[- ]?)?\d{10}$/, { message: "Please enter a valid 10-digit phone number." }),
});
