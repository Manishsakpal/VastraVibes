export type Category = "Men" | "Women" | "Kids" | "Ethnic" | "Western";

export interface ClothingItem {
  id: string;
  title: string;
  description: string;
  price: number;
  discount?: number; // e.g., 20 for 20% off
  size: string; // e.g., "S, M, L" or "Free Size"
  category: Category;
  imageUrl: string;
  imageHint?: string; // For placeholder image generation hint
}

export type CartItem = ClothingItem & {
  quantity: number;
};
