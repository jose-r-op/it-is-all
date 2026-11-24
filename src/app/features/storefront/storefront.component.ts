import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CartService } from '../../core/services/cart.service';
import { SupabaseService } from '../../core/services/supabase.service';
import { ProductCardSkeletonComponent } from '../../shared/components/skeletons/product-card-skeleton.component';
import { ProductCardComponent } from './product-card.component';

const ALL = 'TODOS';

function normalize(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

@Component({
  selector: 'app-storefront',
  standalone: true,
  imports: [ProductCardComponent, ProductCardSkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Navbar Darkwear -->
    <header class="sticky top-0 z-30 border-b border-white/10 bg-[#08080a]/90 backdrop-blur-md">
      <div class="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <!-- Logo con fuente gótica -->
        <a href="#" class="group flex items-baseline gap-1 text-2xl tracking-wider text-white transition hover:opacity-90">
          <span class="font-gothic text-3xl font-normal leading-none">{{ storeName }}</span>
          <span class="text-[#ff2a4b] text-3xl font-black leading-none">.</span>
        </a>

        <!-- Navegación central -->
        <nav class="hidden items-center gap-7 text-xs font-mono tracking-widest text-neutral-400 md:flex uppercase" aria-label="Categorías">
          <a href="#catalogo" class="transition hover:text-white hover:text-[#ff2a4b]">// DROP 2026</a>
          @for (cat of quickCategories(); track cat) {
            <a href="#catalogo" (click)="selectCategory(cat)" class="transition hover:text-white">{{ cat }}</a>
          }
          <a href="#manifiesto" class="transition hover:text-white">// MANIFIESTO</a>
        </nav>

        <!-- Botón de Carrito -->
        <button
          type="button"
          (click)="cart.open()"
          class="relative inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-[#16161a] px-4 py-2 text-xs font-mono uppercase tracking-wider text-white transition hover:border-[#ff2a4b] hover:bg-[#1f1f25] active:scale-95"
          [attr.aria-label]="'Abrir carrito, ' + cart.totalItems() + ' prendas'"
        >
          <svg class="h-4 w-4 text-[#ff2a4b]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12A1.125 1.125 0 0 1 19.747 21.75H4.253a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
          </svg>
          <span class="hidden sm:inline">DROP CART</span>
          @if (cart.totalItems() > 0) {
            @for (pulse of [cart.addPulse()]; track pulse) {
              <span class="flex h-5 min-w-5 animate-bump items-center justify-center rounded-full bg-[#ff2a4b] px-1.5 text-[10px] font-bold text-white shadow-[0_0_10px_rgba(255,42,75,0.7)]">
                {{ cart.totalItems() }}
              </span>
            }
          }
        </button>
      </div>
    </header>

    <main class="bg-[#08080a] text-white">
      <!-- Hero Banner IT IS ALL -->
      <section class="relative overflow-hidden border-b border-white/10 bg-[#08080a] py-24 sm:py-32 lg:py-40">
        <!-- Efectos de luz gótica en el fondo -->
        <div class="pointer-events-none absolute -top-40 right-0 h-96 w-96 rounded-full bg-[#ff2a4b]/15 blur-[120px]"></div>
        <div class="pointer-events-none absolute -bottom-40 left-0 h-96 w-96 rounded-full bg-white/5 blur-[120px]"></div>

        <div class="relative mx-auto flex max-w-7xl flex-col items-center text-center px-4 sm:px-6">
          <div class="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-mono uppercase tracking-widest text-neutral-300 backdrop-blur-md">
            <span class="h-1.5 w-1.5 rounded-full bg-[#ff2a4b] animate-pulse"></span>
            DROP OFICIAL 2026 // EDICIÓN LIMITADA
          </div>

          <h1 class="font-gothic text-6xl sm:text-7xl lg:text-9xl tracking-tight text-white select-none">
            {{ storeName }}
          </h1>

          <p class="mt-4 max-w-2xl text-sm sm:text-base font-light text-neutral-400 tracking-wide uppercase font-mono">
            {{ tagline }}
          </p>

          <div class="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href="#catalogo"
              class="rounded-lg bg-white px-7 py-3.5 text-xs font-bold uppercase tracking-widest text-black transition duration-300 hover:bg-[#ff2a4b] hover:text-white hover:shadow-[0_0_25px_rgba(255,42,75,0.6)]"
            >
              EXPLORAR PRENDAS
            </a>
            <a
              [href]="'https://wa.me/' + whatsapp"
              target="_blank"
              rel="noopener"
              class="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-[#16161a] px-6 py-3.5 text-xs font-mono uppercase tracking-wider text-neutral-200 transition hover:border-[#ff2a4b] hover:text-white"
            >
              <svg class="h-4 w-4 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
              WHATSAPP DIRECTO
            </a>
          </div>

          <!-- Sellos de calidad Darkwear -->
          <div class="mt-14 grid w-full max-w-4xl grid-cols-2 gap-4 border-t border-white/10 pt-8 sm:grid-cols-4 font-mono text-[11px] text-neutral-400 uppercase tracking-widest">
            <div class="flex items-center justify-center gap-2">
              <span class="text-[#ff2a4b]">✦</span> 480 GSM PESADO
            </div>
            <div class="flex items-center justify-center gap-2">
              <span class="text-[#ff2a4b]">☩</span> BOXY & OVERSIZE
            </div>
            <div class="flex items-center justify-center gap-2">
              <span class="text-[#ff2a4b]">◈</span> ENVÍOS COLOMBIA
            </div>
            <div class="flex items-center justify-center gap-2">
              <span class="text-[#ff2a4b]">✝</span> PEDIDOS POR WPP
            </div>
          </div>
        </div>
      </section>

      <!-- Catálogo de Prendas -->
      <section id="catalogo" class="mx-auto max-w-7xl scroll-mt-20 px-4 py-12 sm:px-6 sm:py-16">
        <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-white/10 pb-6">
          <div>
            <span class="text-xs font-mono tracking-widest text-[#ff2a4b] uppercase">// COLECCIÓN EXCLUSIVA</span>
            <h2 class="font-gothic text-4xl sm:text-5xl text-white tracking-wide mt-1">Catálogo de Prendas</h2>
            @if (!store.isLoading() && !store.error()) {
              <p class="mt-1 text-xs font-mono text-neutral-400">
                MOSTRANDO {{ filtered().length }} {{ filtered().length === 1 ? 'PIEZA' : 'PIEZAS DISPONIBLES' }}
              </p>
            }
          </div>

          <!-- Buscador -->
          <label class="relative w-full sm:w-72">
            <span class="sr-only">Buscar prendas</span>
            <input
              type="search"
              [value]="search()"
              (input)="search.set($any($event.target).value)"
              placeholder="BUSCAR PRENDA..."
              class="w-full rounded-lg border border-white/10 bg-[#16161a] px-3.5 py-2.5 pl-9 text-xs font-mono tracking-wider text-white placeholder-neutral-500 focus:border-[#ff2a4b] focus:outline-none focus:ring-1 focus:ring-[#ff2a4b]"
            />
            <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" stroke-linecap="round" />
            </svg>
          </label>
        </div>

        <!-- Filtro de Categorías -->
        <div class="-mx-4 mb-10 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0" role="tablist" aria-label="Filtrar por categoría">
          @if (store.isLoading()) {
            @for (i of [1, 2, 3, 4]; track i) {
              <div class="skeleton-dark h-9 w-24 shrink-0 rounded-lg" aria-hidden="true"></div>
            }
          } @else {
            @for (cat of categories(); track cat) {
              <button
                type="button"
                role="tab"
                [attr.aria-selected]="selectedCategory() === cat"
                (click)="selectCategory(cat)"
                class="shrink-0 rounded-lg border px-4 py-2 text-xs font-mono uppercase tracking-wider transition active:scale-95"
                [class]="selectedCategory() === cat
                  ? 'border-[#ff2a4b] bg-[#ff2a4b] text-white shadow-[0_0_12px_rgba(255,42,75,0.4)]'
                  : 'border-white/10 bg-[#16161a] text-neutral-400 hover:border-white/30 hover:text-white'"
              >
                {{ cat }}
              </button>
            }
          }
        </div>

        @if (store.usingDemoData()) {
          <div class="mb-8 rounded-lg border border-white/10 bg-[#111114] p-4 text-xs font-mono text-neutral-400 flex items-center justify-between">
            <span>// CATÁLOGO DEMO ACTIVO (DATOS DE IT IS ALL CARGADOS). CONECTA SUPABASE PARA GESTIÓN REMOTA.</span>
          </div>
        }

        <!-- Grilla con Skeletons o Productos -->
        @if (store.isLoading()) {
          <div class="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4" aria-busy="true" aria-label="Cargando prendas">
            @for (i of skeletonSlots; track i) {
              <app-product-card-skeleton />
            }
          </div>
        } @else if (store.error()) {
          <div class="flex flex-col items-center gap-4 rounded-xl border border-dashed border-white/20 bg-[#111114] px-6 py-16 text-center">
            <p class="text-sm font-mono text-neutral-400">{{ store.error() }}</p>
            <button type="button" (click)="store.loadProducts()" class="rounded-lg bg-[#ff2a4b] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white">REINTENTAR</button>
          </div>
        } @else if (filtered().length === 0) {
          <div class="rounded-xl border border-dashed border-white/20 bg-[#111114] px-6 py-16 text-center text-sm font-mono text-neutral-400">
            @if (store.products().length === 0) {
              // NO HAY PRENDAS DISPONIBLES EN ESTE MOMENTO.
            } @else {
              // NO SE ENCONTRARON PRENDAS BAJO ESTOS FILTROS.
              <button type="button" (click)="resetFilters()" class="ml-2 font-bold text-[#ff2a4b] underline">RESTAURAR FILTROS</button>
            }
          </div>
        } @else {
          <div class="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            @for (product of filtered(); track product.id) {
              <app-product-card [product]="product" />
            }
          </div>
        }
      </section>

      <!-- Manifiesto de la Marca -->
      <section id="manifiesto" class="border-t border-b border-white/10 bg-[#0e0e12] py-20 px-4 sm:px-6">
        <div class="mx-auto max-w-4xl text-center">
          <span class="text-xs font-mono tracking-widest text-[#ff2a4b] uppercase">// MANIFIESTO</span>
          <h2 class="font-gothic text-4xl sm:text-6xl text-white mt-2 mb-6">Construido en la Oscuridad</h2>
          <p class="text-neutral-400 text-sm sm:text-base leading-relaxed font-light">
            IT IS ALL no sigue tendencias. Creaciones pesadas, siluetas drop-shoulder y acabados industriales diseñados para quienes habitan la noche. Cada prenda se produce en tirajes cortos con telas de alto gramaje para garantizar una durabilidad absoluta.
          </p>
          <div class="mt-8 inline-block border border-white/20 px-6 py-2 text-xs font-mono uppercase tracking-widest text-neutral-300">
            NO FASHION // ONLY CODE & FABRIC
          </div>
        </div>
      </section>
    </main>

    <!-- Footer IT IS ALL -->
    <footer class="border-t border-white/10 bg-[#08080a] text-neutral-400">
      <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div class="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div class="md:col-span-2">
            <h3 class="font-gothic text-3xl text-white">{{ storeName }}<span class="text-[#ff2a4b]">.</span></h3>
            <p class="mt-2 max-w-md text-xs font-light text-neutral-400">
              Streetwear sombrío, confección pesada y estética sin etiquetas. Confeccionado para durar.
            </p>
          </div>
          <div>
            <h4 class="text-xs font-mono font-bold tracking-widest text-white uppercase">// NAVEGACIÓN</h4>
            <ul class="mt-3 space-y-2 text-xs font-mono">
              <li><a href="#" class="hover:text-white transition">INICIO</a></li>
              <li><a href="#catalogo" class="hover:text-white transition">DROP 2026</a></li>
              <li><a href="#manifiesto" class="hover:text-white transition">MANIFIESTO</a></li>
            </ul>
          </div>
          <div>
            <h4 class="text-xs font-mono font-bold tracking-widest text-white uppercase">// ATENCIÓN</h4>
            <ul class="mt-3 space-y-2 text-xs font-mono">
              <li>
                <a [href]="'https://wa.me/' + whatsapp" target="_blank" rel="noopener" class="text-neutral-300 hover:text-[#ff2a4b] transition">
                  WHATSAPP DIRECTO
                </a>
              </li>
              <li><span class="text-neutral-500">ENVÍOS A TODA COLOMBIA</span></li>
            </ul>
          </div>
        </div>
        <div class="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 text-[11px] font-mono sm:flex-row">
          <p>© {{ year }} {{ storeName }} CLOTHING CO. TODOS LOS DERECHOS RESERVADOS.</p>
          <p class="text-neutral-500">CONSTRUIDO EN LA OSCURIDAD.</p>
        </div>
      </div>
    </footer>
  `
})
export class StorefrontComponent implements OnInit {
  readonly store = inject(SupabaseService);
  readonly cart = inject(CartService);

  readonly storeName = environment.storeName;
  readonly tagline = environment.storeTagline;
  readonly whatsapp = environment.whatsappNumber.replace(/\D/g, '');
  readonly year = new Date().getFullYear();
  readonly skeletonSlots = [1, 2, 3, 4, 5, 6, 7, 8];

  readonly search = signal('');
  readonly selectedCategory = signal(ALL);

  readonly categories = computed(() => {
    const set = new Set(this.store.products().map((p) => p.category));
    return [ALL, ...Array.from(set).sort((a, b) => a.localeCompare(b, 'es'))];
  });
  readonly quickCategories = computed(() => this.categories().slice(1, 4));

  readonly filtered = computed(() => {
    const cat = this.selectedCategory();
    const q = normalize(this.search());
    return this.store.products().filter(
      (p) =>
        (cat === ALL || p.category === cat) &&
        (!q ||
          normalize(p.name).includes(q) ||
          normalize(p.category).includes(q) ||
          normalize(p.tagline ?? '').includes(q) ||
          normalize(p.description ?? '').includes(q))
    );
  });

  ngOnInit(): void {
    void this.store.loadProducts();
  }

  selectCategory(cat: string): void {
    this.selectedCategory.set(cat);
  }

  resetFilters(): void {
    this.search.set('');
    this.selectedCategory.set(ALL);
  }
}
