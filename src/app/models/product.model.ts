export interface ProductImage {
  id?: number;
  imageUrl: string;
  isCover?: boolean;
  displayOrder?: number;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  badge?: string;
  tagline?: string;
  symbol?: string;
  description: string;
  sizes: string[];
  origin?: 'ItIsAll' | 'Resale' | string;
  condition?: string;
  brand?: string;
  color?: string;
  stock?: number;
  imageUrl?: string;
  coverImageUrl?: string;
  images?: ProductImage[];
  isFeatured?: boolean;
}

export interface CartItem {
  product: Product;
  selectedSize: string;
  quantity: number;
}
