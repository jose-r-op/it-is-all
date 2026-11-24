import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Product } from '../../core/models/product.model';
import { PricePipe } from '../../core/pipes/price.pipe';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [PricePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @let p = product();
    <article class="group relative flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-[#16161a] transition duration-300 hover:border-[#ff2a4b]/50 hover:shadow-[0_0_25px_rgba(255,42,75,0.15)]">
      <!-- Contenedor de Imagen -->
      <div class="relative aspect-[3/4] w-full overflow-hidden bg-[#0c0c0e]">
        @if (!imageLoaded()) {
          <div class="skeleton-dark absolute inset-0" aria-hidden="true"></div>
        }
        @if (imageFailed()) {
          <div class="absolute inset-0 flex items-center justify-center text-xs text-neutral-500 font-mono">
            // IMAGEN NO DISPONIBLE
          </div>
        } @else {
          <img
            [src]="p.imageUrl"
            [alt]="p.name"
            loading="lazy"
            decoding="async"
            width="600"
            height="800"
            class="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105 group-hover:opacity-90"
            [class.opacity-0]="!imageLoaded()"
            (load)="imageLoaded.set(true)"
            (error)="onImageError()"
          />
        }

        <!-- Badges y Símbolo -->
        <div class="absolute left-3 top-3 flex flex-wrap gap-1.5 items-center">
          @if (p.badge) {
            <span class="rounded bg-black/80 backdrop-blur-md border border-white/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
              {{ p.badge }}
            </span>
          } @else if (p.featured) {
            <span class="rounded bg-[#ff2a4b] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-sm">
              DESTACADO
            </span>
          }
        </div>

        @if (p.symbol) {
          <span class="absolute right-3 top-3 text-sm font-bold text-white/70 select-none">
            {{ p.symbol }}
          </span>
        }
      </div>

      <!-- Contenido / Info -->
      <div class="flex flex-1 flex-col gap-2 p-4">
        <p class="text-[10px] font-mono tracking-widest text-[#ff2a4b] uppercase">
          // {{ p.category }}
        </p>
        <h3 class="line-clamp-2 text-sm font-semibold text-white tracking-wide leading-snug">
          {{ p.name }}
        </h3>

        @if (p.tagline) {
          <p class="line-clamp-1 text-xs text-neutral-400">
            {{ p.tagline }}
          </p>
        }

        <!-- Selector de Tallas -->
        <div class="flex flex-wrap gap-1.5 pt-2" role="radiogroup" [attr.aria-label]="'Talla de ' + p.name">
          @for (size of p.sizes; track size) {
            <button
              type="button"
              role="radio"
              [attr.aria-checked]="selectedSize() === size"
              (click)="selectSize(size)"
              class="min-w-8 rounded border px-2 py-1 text-[11px] font-mono font-medium transition active:scale-95"
              [class]="selectedSize() === size
                ? 'border-[#ff2a4b] bg-[#ff2a4b] text-white shadow-[0_0_10px_rgba(255,42,75,0.4)]'
                : 'border-white/10 bg-[#111114] text-neutral-300 hover:border-white/40 hover:text-white'"
            >
              {{ size }}
            </button>
          }
        </div>

        <!-- Precio -->
        <div class="mt-auto pt-3 flex items-baseline justify-between">
          <span class="text-xs font-mono text-neutral-500 uppercase">PRECIO</span>
          <p class="text-base font-bold text-white tracking-tight">{{ p.price | price }}</p>
        </div>

        <!-- Botón de Agregar -->
        <button
          type="button"
          (click)="add()"
          class="w-full rounded-lg px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition active:scale-[0.98]"
          [class]="justAdded()
            ? 'bg-emerald-600 text-white'
            : needsSize()
              ? 'border border-white/20 bg-transparent text-neutral-300 hover:border-[#ff2a4b] hover:text-[#ff2a4b]'
              : 'bg-white text-black hover:bg-[#ff2a4b] hover:text-white hover:shadow-[0_0_15px_rgba(255,42,75,0.5)]'"
        >
          @if (justAdded()) {
            ✓ AGREGADO AL DROP
          } @else if (needsSize()) {
            ELIGE TU TALLA
          } @else {
            AGREGAR AL DROP
          }
        </button>
        @if (showSizeHint()) {
          <p class="text-[11px] text-[#ff2a4b] font-mono text-center" role="alert">
            * Selecciona una talla antes de agregar.
          </p>
        }
      </div>
    </article>
  `
})
export class ProductCardComponent {
  private readonly cart = inject(CartService);

  readonly product = input.required<Product>();

  private readonly chosenSize = signal<string | null>(null);
  readonly selectedSize = computed(() => {
    const sizes = this.product().sizes;
    return this.chosenSize() ?? (sizes.length === 1 ? sizes[0] : null);
  });
  readonly needsSize = computed(() => this.selectedSize() === null);

  readonly imageLoaded = signal(false);
  readonly imageFailed = signal(false);
  readonly justAdded = signal(false);
  readonly showSizeHint = signal(false);
  private addedTimer: ReturnType<typeof setTimeout> | undefined;

  selectSize(size: string): void {
    this.chosenSize.set(size);
    this.showSizeHint.set(false);
  }

  onImageError(): void {
    this.imageFailed.set(true);
    this.imageLoaded.set(true);
  }

  add(): void {
    const size = this.selectedSize();
    if (!size) {
      this.showSizeHint.set(true);
      return;
    }
    this.cart.addItem(this.product(), size, 1);
    this.justAdded.set(true);
    clearTimeout(this.addedTimer);
    this.addedTimer = setTimeout(() => this.justAdded.set(false), 1200);
  }
}
