import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CartDrawerComponent } from './features/cart-drawer/cart-drawer.component';
import { StorefrontComponent } from './features/storefront/storefront.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [StorefrontComponent, CartDrawerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-storefront />
    <app-cart-drawer />
  `
})
export class AppComponent {}

