import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Placeholder con proporciones exactas de la tarjeta de producto en tema oscuro. */
@Component({
  selector: 'app-product-card-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block', 'aria-hidden': 'true' },
  template: `
    <div class="flex h-full flex-col overflow-hidden rounded-xl border border-white/5 bg-[#16161a]">
      <div class="skeleton-dark aspect-[3/4] w-full"></div>
      <div class="flex flex-1 flex-col gap-2.5 p-4">
        <div class="skeleton-dark h-3 w-20 rounded"></div>
        <div class="skeleton-dark h-5 w-4/5 rounded"></div>
        <div class="skeleton-dark h-3 w-full rounded"></div>
        <div class="flex gap-1.5 pt-2">
          <div class="skeleton-dark h-7 w-9 rounded"></div>
          <div class="skeleton-dark h-7 w-9 rounded"></div>
          <div class="skeleton-dark h-7 w-9 rounded"></div>
        </div>
        <div class="skeleton-dark mt-auto h-6 w-28 rounded"></div>
        <div class="skeleton-dark h-11 w-full rounded-lg"></div>
      </div>
    </div>
  `
})
export class ProductCardSkeletonComponent {}
