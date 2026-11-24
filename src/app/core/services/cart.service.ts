import { Injectable, computed, inject, signal } from '@angular/core';
import { CartItem, Product, cartItemKey } from '../models/product.model';
import { SupabaseService } from './supabase.service';

export const CART_STORAGE_KEY = 'clothing_store_cart_v1';
export const MAX_QTY_PER_ITEM = 99;

function isValidItem(value: unknown): value is CartItem {
  if (!value || typeof value !== 'object') return false;
  const v = value as Partial<CartItem>;
  const p = v.product as Partial<Product> | undefined;
  return (
    typeof v.selectedSize === 'string' &&
    typeof v.quantity === 'number' &&
    Number.isInteger(v.quantity) &&
    v.quantity > 0 &&
    !!p &&
    typeof p.id === 'number' &&
    typeof p.name === 'string' &&
    typeof p.price === 'number' &&
    Number.isFinite(p.price) &&
    typeof p.imageUrl === 'string'
  );
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly supabase = inject(SupabaseService);

  private readonly _items = signal<CartItem[]>(this.restore());
  readonly items = this._items.asReadonly();

  /** Drawer del carrito abierto/cerrado. */
  readonly isOpen = signal(false);
  /** true mientras se verifica disponibilidad/precios con Supabase. */
  readonly isCartLoading = signal(false);
  /** Nombres de prendas eliminadas del carrito por no estar ya disponibles. */
  readonly removedNotice = signal<string[]>([]);
  /** Incrementa en cada adición (para animar el contador). */
  readonly addPulse = signal(0);

  readonly totalItems = computed(() => this._items().reduce((acc, i) => acc + i.quantity, 0));
  readonly total = computed(() => this._items().reduce((acc, i) => acc + i.product.price * i.quantity, 0));
  readonly isEmpty = computed(() => this._items().length === 0);

  private refreshSeq = 0;

  constructor() {
    // Sincroniza entre pestañas abiertas de la tienda.
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === CART_STORAGE_KEY) this._items.set(this.restore());
      });
    }
  }

  subtotal(item: CartItem): number {
    return item.product.price * item.quantity;
  }

  addItem(product: Product, size: string, qty = 1): void {
    if (!product.available || !Number.isInteger(qty) || qty <= 0) return;
    const key = cartItemKey(product.id, size);
    const items = this._items();
    const existing = items.find((i) => i.key === key);
    const next = existing
      ? items.map((i) => (i.key === key ? { ...i, product, quantity: Math.min(MAX_QTY_PER_ITEM, i.quantity + qty) } : i))
      : [...items, { key, product, selectedSize: size, quantity: Math.min(MAX_QTY_PER_ITEM, qty) }];
    this.commit(next);
    this.addPulse.update((n) => n + 1);
  }

  updateQuantity(key: string, delta: number): void {
    const items = this._items();
    const item = items.find((i) => i.key === key);
    if (!item) return;
    const quantity = Math.min(MAX_QTY_PER_ITEM, item.quantity + delta);
    if (quantity <= 0) {
      this.removeItem(key);
      return;
    }
    this.commit(items.map((i) => (i.key === key ? { ...i, quantity } : i)));
  }

  removeItem(key: string): void {
    this.commit(this._items().filter((i) => i.key !== key));
  }

  clearCart(): void {
    this.commit([]);
    this.removedNotice.set([]);
  }

  open(): void {
    this.isOpen.set(true);
    void this.refreshFromServer();
  }

  close(): void {
    this.isOpen.set(false);
  }

  /**
   * Verifica con Supabase que las prendas sigan disponibles y actualiza precios/nombres/fotos.
   * Las no disponibles se retiran del carrito y se avisa al cliente.
   */
  async refreshFromServer(): Promise<void> {
    const ids = this._items().map((i) => i.product.id);
    if (!ids.length) return;
    const seq = ++this.refreshSeq;
    this.isCartLoading.set(true);
    try {
      const fresh = await this.supabase.fetchAvailableByIds(ids);
      if (fresh === null || seq !== this.refreshSeq) return; // sin verificación: conservar carrito
      const byId = new Map(fresh.map((p) => [p.id, p]));
      const removed: string[] = [];
      // Usar el estado ACTUAL (el cliente pudo agregar prendas mientras tanto).
      const next: CartItem[] = [];
      for (const item of this._items()) {
        const product = byId.get(item.product.id);
        if (product) next.push({ ...item, product });
        else if (ids.includes(item.product.id)) removed.push(`${item.product.name} (${item.selectedSize})`);
        else next.push(item);
      }
      this.commit(next);
      this.removedNotice.set(removed);
    } finally {
      if (seq === this.refreshSeq) this.isCartLoading.set(false);
    }
  }

  private commit(items: CartItem[]): void {
    this._items.set(items);
    this.persist(items);
  }

  private persist(items: CartItem[]): void {
    try {
      if (typeof localStorage === 'undefined') return;
      if (items.length) localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      else localStorage.removeItem(CART_STORAGE_KEY);
    } catch {
      // Cuota llena o almacenamiento bloqueado (modo privado): el carrito sigue en memoria.
    }
  }

  private restore(): CartItem[] {
    try {
      if (typeof localStorage === 'undefined') return [];
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (!raw) return [];
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      const merged = new Map<string, CartItem>();
      for (const entry of parsed) {
        if (!isValidItem(entry)) continue;
        const key = cartItemKey(entry.product.id, entry.selectedSize);
        const prev = merged.get(key);
        const quantity = Math.min(MAX_QTY_PER_ITEM, (prev?.quantity ?? 0) + entry.quantity);
        merged.set(key, { ...entry, key, quantity });
      }
      return Array.from(merged.values());
    } catch {
      return [];
    }
  }
}

