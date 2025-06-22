export type Category = "Men" | "Women" | "Kids" | "Ethnic" | "Western";

export interface ClothingItem {
  id: string;
  title: string;
  description: string;
  price: number;
  discount?: number; // e.g., 20 for 20% off
  size: string; // e.g., "S, M, L" or "Free Size"
  colors: string; // e.g., "Red, Blue, Black"
  category: Category;
  imageUrls: string[];
  imageHints?: string[]; // For placeholder image generation hint
  specifications?: string[];
}

export type CartItem = ClothingItem & {
  quantity: number;
};
