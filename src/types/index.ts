export type Category = "Men" | "Women" | "Kids" | "Ethnic" | "Western";

export interface ClothingItem {
  id: string;
  title: string;
  description: string;
  price: number;
  size: string; // e.g., "S, M, L" or "Free Size"
  category: Category;
  imageUrl: string;
  imageHint?: string; // For placeholder image generation hint
}

export type CartItem = ClothingItem & {
  quantity: number;
};
