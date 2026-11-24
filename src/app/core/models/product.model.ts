/** Fila tal como existe en la tabla `public.products` de Supabase. */
export interface ProductRow {
  id: number;
  name: string;
  description: string | null;
  price: number | string; // numeric puede llegar como string
  category: string | null;
  sizes: string | null;
  image_url: string;
  available: boolean;
  featured: boolean;
  badge?: string | null;
  tagline?: string | null;
  symbol?: string | null;
  created_at: string;
}

/** Producto listo para la interfaz. */
export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  category: string;
  sizes: string[];
  imageUrl: string;
  available: boolean;
  featured: boolean;
  badge?: string;
  tagline?: string;
  symbol?: string;
  createdAt: string;
}

export interface CartItem {
  /** `${productId}__${size}` — identifica una prenda + talla. */
  key: string;
  product: Product;
  selectedSize: string;
  quantity: number;
}

export interface OrderCheckoutForm {
  customerName: string;
  contactPhone: string;
  address: string;
  city?: string;
  paymentMethod: string;
  notes?: string;
}

export const DEFAULT_SIZE = 'Única';

/** Convierte "S, M , L,,XL" en ["S","M","L","XL"] (sin duplicados). Vacío => ["Única"]. */
export function parseSizes(raw: string | null | undefined): string[] {
  const sizes = (raw ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const unique = Array.from(new Set(sizes));
  return unique.length ? unique : [DEFAULT_SIZE];
}

export function mapProductRow(row: ProductRow): Product {
  const price = typeof row.price === 'string' ? Number.parseFloat(row.price) : row.price;
  return {
    id: Number(row.id),
    name: row.name,
    description: row.description,
    price: Number.isFinite(price) ? price : 0,
    category: row.category?.trim() || 'General',
    sizes: parseSizes(row.sizes),
    imageUrl: row.image_url,
    available: row.available !== false,
    featured: !!row.featured,
    badge: row.badge ?? undefined,
    tagline: row.tagline ?? undefined,
    symbol: row.symbol ?? undefined,
    createdAt: row.created_at
  };
}

export function cartItemKey(productId: number, size: string): string {
  return `${productId}__${size}`;
}

