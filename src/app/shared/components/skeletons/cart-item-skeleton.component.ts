import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Placeholder de una fila del carrito en tema oscuro. */
@Component({
  selector: 'app-cart-item-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block', 'aria-hidden': 'true' },
  template: `
    <div class="flex gap-3 py-4 border-b border-white/5">
      <div class="skeleton-dark h-16 w-16 shrink-0 rounded-lg"></div>
      <div class="flex flex-1 flex-col gap-2">
        <div class="skeleton-dark h-4 w-3/4 rounded"></div>
        <div class="skeleton-dark h-3 w-1/3 rounded"></div>
        <div class="flex items-center justify-between pt-1">
          <div class="skeleton-dark h-8 w-24 rounded-lg"></div>
          <div class="skeleton-dark h-4 w-16 rounded"></div>
        </div>
      </div>
    </div>
  `
})
export class CartItemSkeletonComponent {}

/** Placeholder del bloque de resumen en tema oscuro. */
@Component({
  selector: 'app-cart-summary-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block', 'aria-hidden': 'true' },
  template: `
    <div class="flex flex-col gap-2 py-3">
      <div class="flex justify-between"><div class="skeleton-dark h-3 w-20 rounded"></div><div class="skeleton-dark h-3 w-16 rounded"></div></div>
      <div class="flex justify-between"><div class="skeleton-dark h-5 w-24 rounded"></div><div class="skeleton-dark h-5 w-24 rounded"></div></div>
    </div>
  `
})
export class CartSummarySkeletonComponent {}
