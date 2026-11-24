import { ChangeDetectionStrategy, Component, HostListener, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { OrderCheckoutForm } from '../../core/models/product.model';
import { PricePipe } from '../../core/pipes/price.pipe';
import { CartService } from '../../core/services/cart.service';
import { WhatsappService } from '../../core/services/whatsapp.service';
import { CartItemSkeletonComponent, CartSummarySkeletonComponent } from '../../shared/components/skeletons/cart-item-skeleton.component';

const CHECKOUT_DRAFT_KEY = 'clothing_store_checkout_v1';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [ReactiveFormsModule, PricePipe, CartItemSkeletonComponent, CartSummarySkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Overlay de fondo -->
    <div
      class="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
      [class]="cart.isOpen() ? 'opacity-100' : 'pointer-events-none opacity-0'"
      (click)="cart.close()"
      aria-hidden="true"
    ></div>

    <!-- Drawer Darkwear -->
    <aside
      class="fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-white/10 bg-[#0e0e12] text-white shadow-2xl transition-transform duration-300 ease-out sm:max-w-md"
      [class]="cart.isOpen() ? 'translate-x-0' : 'invisible translate-x-full'"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-title"
    >
      <!-- Cabecera del Drawer -->
      <div class="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-4 sm:px-6 bg-[#08080a]">
        <div class="flex items-baseline gap-2">
          <h2 id="cart-title" class="font-gothic text-2xl tracking-wide">DROP CART</h2>
          @if (cart.totalItems() > 0) {
            <span class="rounded bg-[#ff2a4b] px-2 py-0.5 text-[10px] font-mono font-bold text-white">
              {{ cart.totalItems() }} {{ cart.totalItems() === 1 ? 'PIEZA' : 'PIEZAS' }}
            </span>
          }
        </div>
        <button
          type="button"
          (click)="cart.close()"
          class="rounded-lg p-2 text-neutral-400 hover:bg-white/5 hover:text-white transition"
          aria-label="Cerrar carrito"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </div>

      <!-- Contenido scrolleable -->
      <div class="flex-1 overflow-y-auto px-4 sm:px-6">
        @if (cart.removedNotice().length) {
          <div class="mt-4 rounded-lg border border-[#ff2a4b]/30 bg-[#ff2a4b]/10 p-3 text-xs font-mono text-[#ff2a4b]" role="status">
            // PRENDAS AGOTADAS RETIRADAS: {{ cart.removedNotice().join(', ') }}.
          </div>
        }

        @if (orderSent()) {
          <div class="flex flex-col items-center gap-4 py-16 text-center">
            <div class="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/10 text-2xl text-emerald-400">
              ✓
            </div>
            <p class="font-mono text-sm font-bold tracking-wider text-white uppercase">// ¡PEDIDO ABIERTO EN WHATSAPP!</p>
            <p class="text-xs font-mono text-neutral-400 max-w-xs">
              Envía el mensaje en WhatsApp para que preparemos tu drop. Si no se abrió la ventana, dale a reintentar.
            </p>
            <div class="flex flex-wrap justify-center gap-2 pt-2">
              <button
                type="button"
                (click)="orderSent.set(false)"
                class="rounded-lg border border-white/20 bg-transparent px-4 py-2 text-xs font-mono uppercase tracking-wider text-neutral-300 hover:text-white"
              >
                VOLVER AL PEDIDO
              </button>
              <button
                type="button"
                (click)="finish()"
                class="rounded-lg bg-[#ff2a4b] px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider text-white hover:bg-[#e01c3c]"
              >
                VACIAR DROP Y SEGUIR
              </button>
            </div>
          </div>
        } @else if (cart.isCartLoading()) {
          <div class="divide-y divide-white/5" aria-busy="true" aria-label="Actualizando carrito">
            @for (i of skeletonRows(); track $index) {
              <app-cart-item-skeleton />
            }
            <app-cart-summary-skeleton />
          </div>
        } @else if (cart.isEmpty()) {
          <div class="flex flex-col items-center gap-4 py-24 text-center">
            <span class="text-4xl text-[#ff2a4b] select-none">✦</span>
            <p class="font-mono text-xs uppercase tracking-widest text-neutral-400">// TU DROP CART ESTÁ VACÍO</p>
            <button
              type="button"
              (click)="cart.close()"
              class="mt-2 rounded-lg bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-black hover:bg-[#ff2a4b] hover:text-white transition"
            >
              EXPLORAR PRENDAS
            </button>
          </div>
        } @else {
          <!-- Lista de Items -->
          <ul class="divide-y divide-white/5">
            @for (item of cart.items(); track item.key) {
              <li class="flex gap-3 py-4">
                <div class="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-[#16161a]">
                  @if (!loadedThumbs().has(item.key)) {
                    <div class="skeleton-dark absolute inset-0" aria-hidden="true"></div>
                  }
                  <img
                    [src]="item.product.imageUrl"
                    [alt]="item.product.name"
                    width="64"
                    height="64"
                    class="h-full w-full object-cover"
                    (load)="markThumb(item.key)"
                    (error)="markThumb(item.key)"
                  />
                </div>
                <div class="flex min-w-0 flex-1 flex-col gap-1">
                  <div class="flex items-start justify-between gap-2">
                    <p class="truncate text-xs font-semibold text-white tracking-wide">{{ item.product.name }}</p>
                    <button
                      type="button"
                      (click)="cart.removeItem(item.key)"
                      class="text-[10px] font-mono uppercase text-neutral-500 hover:text-[#ff2a4b] transition"
                      [attr.aria-label]="'Eliminar ' + item.product.name"
                    >
                      ✕
                    </button>
                  </div>
                  <p class="text-[11px] font-mono text-neutral-400">
                    TALLA: <span class="text-white">{{ item.selectedSize }}</span> · {{ item.product.price | price }}
                  </p>
                  <div class="mt-1 flex items-center justify-between">
                    <div class="inline-flex items-center rounded border border-white/15 bg-[#16161a]">
                      <button
                        type="button"
                        (click)="cart.updateQuantity(item.key, -1)"
                        class="h-7 w-7 text-sm font-mono text-neutral-300 hover:bg-white/10 hover:text-white"
                        aria-label="Quitar una"
                      >
                        −
                      </button>
                      <span class="w-7 text-center text-xs font-mono font-bold" aria-live="polite">{{ item.quantity }}</span>
                      <button
                        type="button"
                        (click)="cart.updateQuantity(item.key, 1)"
                        class="h-7 w-7 text-sm font-mono text-neutral-300 hover:bg-white/10 hover:text-white"
                        aria-label="Agregar una"
                      >
                        +
                      </button>
                    </div>
                    <p class="text-xs font-mono font-bold text-white">{{ cart.subtotal(item) | price }}</p>
                  </div>
                </div>
              </li>
            }
          </ul>

          <!-- Formulario de Checkout integrado -->
          <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-3.5 border-t border-white/10 py-6" novalidate>
            <div class="flex items-center justify-between">
              <h3 class="text-xs font-mono font-bold uppercase tracking-widest text-neutral-300">// DATOS DE ENVÍO</h3>
              <span class="text-[10px] font-mono text-[#ff2a4b]">* OBLIGATORIOS</span>
            </div>

            <label class="flex flex-col gap-1 text-[11px] font-mono uppercase tracking-wider text-neutral-400">
              Nombre Completo *
              <input
                formControlName="customerName"
                autocomplete="name"
                placeholder="EJ. CARLOS MÉNDEZ"
                class="rounded-lg border border-white/10 bg-[#16161a] px-3 py-2 text-xs font-mono text-white placeholder-neutral-600 focus:border-[#ff2a4b] focus:outline-none focus:ring-1 focus:ring-[#ff2a4b]"
                [class.border-red-500]="invalid('customerName')"
              />
            </label>

            <label class="flex flex-col gap-1 text-[11px] font-mono uppercase tracking-wider text-neutral-400">
              Número de Contacto (WhatsApp) *
              <input
                formControlName="contactPhone"
                type="tel"
                inputmode="tel"
                autocomplete="tel"
                placeholder="EJ. 300 123 4567"
                class="rounded-lg border border-white/10 bg-[#16161a] px-3 py-2 text-xs font-mono text-white placeholder-neutral-600 focus:border-[#ff2a4b] focus:outline-none focus:ring-1 focus:ring-[#ff2a4b]"
                [class.border-red-500]="invalid('contactPhone')"
              />
              @if (invalid('contactPhone')) {
                <span class="text-[10px] text-[#ff2a4b]">Ingresa mínimo 7 dígitos válidos.</span>
              }
            </label>

            <label class="flex flex-col gap-1 text-[11px] font-mono uppercase tracking-wider text-neutral-400">
              Dirección de Entrega *
              <input
                formControlName="address"
                autocomplete="street-address"
                placeholder="CALLE, NÚMERO, APTO, BARRIO"
                class="rounded-lg border border-white/10 bg-[#16161a] px-3 py-2 text-xs font-mono text-white placeholder-neutral-600 focus:border-[#ff2a4b] focus:outline-none focus:ring-1 focus:ring-[#ff2a4b]"
                [class.border-red-500]="invalid('address')"
              />
            </label>

            <label class="flex flex-col gap-1 text-[11px] font-mono uppercase tracking-wider text-neutral-400">
              Ciudad / Municipio
              <input
                formControlName="city"
                autocomplete="address-level2"
                placeholder="EJ. BOGOTÁ, MEDELLÍN, CALI..."
                class="rounded-lg border border-white/10 bg-[#16161a] px-3 py-2 text-xs font-mono text-white placeholder-neutral-600 focus:border-[#ff2a4b] focus:outline-none focus:ring-1 focus:ring-[#ff2a4b]"
              />
            </label>

            <label class="flex flex-col gap-1 text-[11px] font-mono uppercase tracking-wider text-neutral-400">
              Método de Pago *
              <select
                formControlName="paymentMethod"
                class="rounded-lg border border-white/10 bg-[#16161a] px-3 py-2 text-xs font-mono text-white focus:border-[#ff2a4b] focus:outline-none focus:ring-1 focus:ring-[#ff2a4b]"
                [class.border-red-500]="invalid('paymentMethod')"
              >
                <option value="" disabled>SELECCIONA FORMA DE PAGO…</option>
                @for (m of paymentMethods; track m) {
                  <option [value]="m">{{ m }}</option>
                }
              </select>
            </label>

            <label class="flex flex-col gap-1 text-[11px] font-mono uppercase tracking-wider text-neutral-400">
              Notas Adicionales (Opcional)
              <textarea
                formControlName="notes"
                rows="2"
                placeholder="EJ. DEJAR EN PORTERÍA, TIMBRE 402..."
                class="resize-none rounded-lg border border-white/10 bg-[#16161a] px-3 py-2 text-xs font-mono text-white placeholder-neutral-600 focus:border-[#ff2a4b] focus:outline-none focus:ring-1 focus:ring-[#ff2a4b]"
              ></textarea>
            </label>

            @if (submitted() && form.invalid) {
              <p class="text-[11px] font-mono text-[#ff2a4b]" role="alert">
                * Por favor completa todos los campos requeridos.
              </p>
            }
          </form>
        }
      </div>

      <!-- Barra Inferior de Total y Checkout -->
      @if (!cart.isEmpty() && !orderSent()) {
        <div class="shrink-0 border-t border-white/10 bg-[#08080a] px-4 pb-[max(1.2rem,env(safe-area-inset-bottom))] pt-4 sm:px-6">
          @if (cart.isCartLoading()) {
            <app-cart-summary-skeleton />
          } @else {
            <div class="mb-4 flex items-baseline justify-between font-mono">
              <span class="text-xs uppercase tracking-widest text-neutral-400">TOTAL DROP</span>
              <span class="text-xl font-bold tracking-tight text-white">{{ cart.total() | price }}</span>
            </div>
          }
          <button
            type="button"
            (click)="submit()"
            [disabled]="cart.isCartLoading()"
            class="flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-3.5 text-xs font-mono font-bold uppercase tracking-widest text-black transition hover:bg-[#20ba59] hover:shadow-[0_0_20px_rgba(37,211,102,0.4)] disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.99]"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.66.15-.2.3-.76.96-.93 1.16-.17.2-.34.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.66-1.6-.91-2.19-.24-.57-.48-.5-.66-.5h-.57c-.2 0-.52.08-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.48.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.32l-.34-.2-3.57.94.95-3.48-.22-.36a9.4 9.4 0 0 1-1.44-5.01c0-5.2 4.24-9.43 9.44-9.43 2.52 0 4.89.98 6.67 2.77a9.37 9.37 0 0 1 2.76 6.67c0 5.2-4.24 9.43-9.44 9.43M20.08 3.9A11.3 11.3 0 0 0 12.05.58C5.79.58.7 5.67.7 11.92c0 2 .52 3.95 1.52 5.67L.6 23.5l6.05-1.59a11.3 11.3 0 0 0 5.4 1.38h.01c6.25 0 11.34-5.09 11.34-11.34 0-3.03-1.18-5.88-3.32-8.02"/>
            </svg>
            ENVIAR PEDIDO POR WHATSAPP
          </button>
        </div>
      }
    </aside>
  `
})
export class CartDrawerComponent {
  readonly cart = inject(CartService);
  private readonly whatsapp = inject(WhatsappService);
  private readonly fb = inject(FormBuilder);

  readonly paymentMethods = environment.paymentMethods;
  readonly submitted = signal(false);
  readonly orderSent = signal(false);
  readonly loadedThumbs = signal<ReadonlySet<string>>(new Set());

  readonly form = this.fb.nonNullable.group({
    customerName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    contactPhone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-()]{7,20}$/)]],
    address: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
    city: ['', [Validators.maxLength(80)]],
    paymentMethod: ['', [Validators.required]],
    notes: ['', [Validators.maxLength(300)]]
  });

  constructor() {
    this.restoreDraft();
    this.form.valueChanges.subscribe(() => this.saveDraft());

    effect(() => {
      if (typeof document !== 'undefined') document.body.style.overflow = this.cart.isOpen() ? 'hidden' : '';
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.cart.isOpen()) this.cart.close();
  }

  skeletonRows(): number[] {
    return Array.from({ length: Math.max(1, Math.min(this.cart.items().length, 4)) });
  }

  markThumb(key: string): void {
    if (this.loadedThumbs().has(key)) return;
    this.loadedThumbs.update((s) => new Set(s).add(key));
  }

  invalid(name: keyof OrderCheckoutForm): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || this.submitted());
  }

  submit(): void {
    this.submitted.set(true);
    this.form.markAllAsTouched();
    if (this.form.invalid || this.cart.isEmpty() || this.cart.isCartLoading()) return;
    const order: OrderCheckoutForm = this.form.getRawValue();
    this.whatsapp.openOrder(order, this.cart.items(), this.cart.total());
    this.orderSent.set(true);
  }

  finish(): void {
    this.cart.clearCart();
    this.orderSent.set(false);
    this.submitted.set(false);
    this.form.controls.notes.reset('');
    this.cart.close();
  }

  private saveDraft(): void {
    try {
      const { notes: _notes, ...draft } = this.form.getRawValue();
      localStorage.setItem(CHECKOUT_DRAFT_KEY, JSON.stringify(draft));
    } catch {
      /* ignore */
    }
  }

  private restoreDraft(): void {
    try {
      const raw = localStorage.getItem(CHECKOUT_DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw) as Partial<OrderCheckoutForm>;
      const safe: Partial<Record<keyof OrderCheckoutForm, string>> = {};
      for (const k of ['customerName', 'contactPhone', 'address', 'city', 'paymentMethod'] as const) {
        if (typeof draft[k] === 'string') safe[k] = draft[k];
      }
      if (safe.paymentMethod && !this.paymentMethods.includes(safe.paymentMethod)) delete safe.paymentMethod;
      this.form.patchValue(safe, { emitEvent: false });
    } catch {
      /* ignore */
    }
  }
}
