import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.scss'
})
export class CatalogComponent {
  @Input() products: Product[] = [];
  @Input() isLoading = false;
  @Input() error: string | null = null;
  @Output() addToCart = new EventEmitter<{ product: Product; size: string }>();
  @Output() retry = new EventEmitter<void>();

  // Filtro de categorías
  selectedCategory: string = 'TODAS';

  // Almacena la talla elegida para cada producto (id -> talla)
  selectedSizes: { [productId: number]: string } = {};

  get categories(): string[] {
    const unique = Array.from(new Set(this.products.map(p => p.category)));
    return ['TODAS', ...unique];
  }

  get filteredProducts(): Product[] {
    if (this.selectedCategory === 'TODAS') {
      return this.products;
    }
    return this.products.filter(p => p.category === this.selectedCategory);
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
  }

  selectSize(productId: number, size: string): void {
    this.selectedSizes[productId] = size;
  }

  getSelectedSize(product: Product): string {
    return this.selectedSizes[product.id] || product.sizes[0];
  }

  onAddToCart(product: Product): void {
    this.addToCart.emit({
      product,
      size: this.getSelectedSize(product)
    });
  }

  onRetry(): void {
    this.retry.emit();
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(value);
  }
}
