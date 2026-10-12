export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  badge?: string;
  tagline: string;
  symbol: string;
  description: string;
  sizes: string[];
}

export interface CartItem {
  product: Product;
  selectedSize: string;
  quantity: number;
}
