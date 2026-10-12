import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CartItem } from '../../models/product.model';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [],
  templateUrl: './cart-drawer.component.html',
  styleUrl: './cart-drawer.component.scss'
})
export class CartDrawerComponent {
  @Input() isOpen = false;
  @Input() items: CartItem[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() updateQuantity = new EventEmitter<{ index: number; change: number }>();
  @Output() removeItem = new EventEmitter<number>();
  @Output() clear = new EventEmitter<void>();
  @Output() explore = new EventEmitter<void>();

  get cartCount(): number {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  get cartTotal(): number {
    return this.items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(value);
  }

  onClose(): void {
    this.close.emit();
  }

  onUpdateQty(index: number, change: number): void {
    this.updateQuantity.emit({ index, change });
  }

  onRemove(index: number): void {
    this.removeItem.emit(index);
  }

  onClear(): void {
    this.clear.emit();
  }

  onExplore(): void {
    this.close.emit();
    this.explore.emit();
  }
}
