import { Injectable, signal } from '@angular/core';
import type { SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { DEMO_PRODUCTS } from '../data/demo-products';
import { Product, ProductRow, mapProductRow } from '../models/product.model';

const PRODUCT_COLUMNS = 'id, name, description, price, category, sizes, image_url, available, featured, created_at';

export function isSupabaseConfigured(url: string = environment.supabaseUrl, key: string = environment.supabaseAnonKey): boolean {
  return /^https:\/\/.+/.test(url) && !!key && !key.startsWith('TU_');
}

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  readonly products = signal<Product[]>([]);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);
  readonly usingDemoData = signal(!isSupabaseConfigured());

  /** Retardo artificial del modo demo (ms) para poder ver los skeletons. */
  demoDelayMs = 600;

  private clientPromise: Promise<SupabaseClient> | null = null;
  private loadSeq = 0;

  /** Carga perezosa del SDK para no inflar el bundle inicial. */
  private getClient(): Promise<SupabaseClient> {
    if (!this.clientPromise) {
      const cleanUrl = environment.supabaseUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
      this.clientPromise = import('@supabase/supabase-js').then(({ createClient }) =>
        createClient(cleanUrl, environment.supabaseAnonKey, {
          auth: { persistSession: false, autoRefreshToken: false }
        })
      );
    }
    return this.clientPromise;
  }

  /** Descarga el catálogo disponible (destacados primero, luego más recientes). */
  async loadProducts(): Promise<void> {
    const seq = ++this.loadSeq;
    this.isLoading.set(true);
    this.error.set(null);
    try {
      let list: Product[];
      if (this.usingDemoData()) {
        await this.delay(this.demoDelayMs);
        list = DEMO_PRODUCTS.filter((p) => p.available);
      } else {
        const client = await this.getClient();
        const { data, error } = await client
          .from('products')
          .select(PRODUCT_COLUMNS)
          .eq('available', true)
          .order('featured', { ascending: false })
          .order('created_at', { ascending: false });
        if (error) throw error;
        list = ((data ?? []) as ProductRow[]).map(mapProductRow);
      }
      if (seq === this.loadSeq) this.products.set(list);
    } catch (err) {
      console.error('[SupabaseService] Error cargando productos', err);
      if (seq === this.loadSeq) this.error.set('No pudimos cargar el catálogo. Revisa tu conexión e intenta de nuevo.');
    } finally {
      if (seq === this.loadSeq) this.isLoading.set(false);
    }
  }

  /**
   * Devuelve las versiones actuales y DISPONIBLES de los productos indicados.
   * Un id ausente en la respuesta significa que ya no está disponible.
   * Devuelve `null` si no se pudo verificar (error de red), para no vaciar el carrito por error.
   */
  async fetchAvailableByIds(ids: number[]): Promise<Product[] | null> {
    const unique = Array.from(new Set(ids));
    if (!unique.length) return [];
    try {
      if (this.usingDemoData()) {
        await this.delay(Math.min(this.demoDelayMs, 400));
        return DEMO_PRODUCTS.filter((p) => p.available && unique.includes(p.id));
      }
      const client = await this.getClient();
      const { data, error } = await client
        .from('products')
        .select(PRODUCT_COLUMNS)
        .in('id', unique)
        .eq('available', true);
      if (error) throw error;
      return ((data ?? []) as ProductRow[]).map(mapProductRow);
    } catch (err) {
      console.error('[SupabaseService] Error verificando disponibilidad', err);
      return null;
    }
  }

  private delay(ms: number): Promise<void> {
    return ms > 0 ? new Promise((resolve) => setTimeout(resolve, ms)) : Promise.resolve();
  }
}

