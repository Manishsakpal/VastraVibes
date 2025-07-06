import * as z from 'zod';
import { CATEGORIES } from './constants';

export const addItemSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters long." }).max(100),
  description: z.string().min(10, { message: "Description must be at least 10 characters long." }).max(500),
  price: z.coerce.number({invalid_type_error: "Price is required."}).positive({ message: "Price must be a positive number." }),
  discount: z.coerce.number().min(0, { message: "Discount must be at least 0."}).max(100, { message: "Discount cannot exceed 100."}).optional(),
  size: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one size.",
  }),
  colors: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one color.",
  }),
  category: z.enum(CATEGORIES, {
    errorMap: () => ({ message: "Please select a valid category." }),
  }),
  imageUrls: z.string().min(1, { message: "At least one image URL is required." }),
  imageHints: z.string().max(500, { message: "Image hints should be max 500 characters."}).optional(),
  specifications: z.string().optional(),
});

export const checkoutSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters long." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  address: z.string().min(10, { message: "Address must be at least 10 characters long." }),
  city: z.string().min(2, { message: "City must be at least 2 characters long." }),
  state: z.string().min(2, { message: "State/Province must be at least 2 characters long." }),
  zip: z.string().regex(/^\d{6}$/, { message: "Please enter a valid 6-digit postal code." }),
  phone: z.string().regex(/^(\+\d{1,3}[- ]?)?\d{10}$/, { message: "Please enter a valid 10-digit phone number." }),
});

export const adminUserSchema = z.object({
  id: z.string().min(3, { message: 'ID must be at least 3 characters long.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long.' }),
});
