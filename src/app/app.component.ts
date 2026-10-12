import { Component, OnInit, inject } from '@angular/core';
import { Product, CartItem } from './models/product.model';
import { ProductService } from './services/product.service';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HeroComponent } from './components/hero/hero.component';
import { KineticCarouselComponent } from './components/kinetic-carousel/kinetic-carousel.component';
import { CatalogComponent } from './components/catalog/catalog.component';
import { ManifestoComponent } from './components/manifesto/manifesto.component';
import { FooterComponent } from './components/footer/footer.component';
import { CartDrawerComponent } from './components/cart-drawer/cart-drawer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    NavbarComponent,
    HeroComponent,
    KineticCarouselComponent,
    CatalogComponent,
    ManifestoComponent,
    FooterComponent,
    CartDrawerComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'IT IS ALL';

  // Inyección del servicio de productos
  private productService = inject(ProductService);

  // Estado del Carrito y Notificaciones
  isCartOpen = false;
  activeNotification: string | null = null;
  private notificationTimeout: any = null;

  // Catálogo dinámico proveniente de la API
  catalog: Product[] = [];
  isLoadingProducts = true;
  productError: string | null = null;

  // Carrito de compras reactivo
  cart: CartItem[] = [];

  ngOnInit(): void {
    this.fetchProducts();
  }

  fetchProducts(): void {
    this.isLoadingProducts = true;
    this.productError = null;

    this.productService.getProducts().subscribe({
      next: (products) => {
        this.catalog = products;
        this.isLoadingProducts = false;
      },
      error: (err) => {
        console.error('Error al conectar con la API de productos:', err);
        this.productError = 'No se pudo conectar con el catálogo. Verifica la conexión.';
        this.isLoadingProducts = false;
      }
    });
  }

  get cartCount(): number {
    return this.cart.reduce((total, item) => total + item.quantity, 0);
  }

  toggleCart(): void {
    this.isCartOpen = !this.isCartOpen;
  }

  openCart(): void {
    this.isCartOpen = true;
  }

  closeCart(): void {
    this.isCartOpen = false;
  }

  scrollTo(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  onAddToCart(event: { product: Product; size?: string } | Product): void {
    const product = 'product' in event ? event.product : event;
    const chosenSize = ('size' in event && event.size) ? event.size : product.sizes[0];
    const existing = this.cart.find(
      item => item.product.id === product.id && item.selectedSize === chosenSize
    );

    if (existing) {
      existing.quantity += 1;
    } else {
      this.cart.push({
        product,
        selectedSize: chosenSize,
        quantity: 1
      });
    }

    this.showToast(`Agregado a tu bolsa: ${product.name} [Talla ${chosenSize}]`);
  }

  onUpdateQuantity(event: { index: number; change: number }): void {
    const { index, change } = event;
    if (index >= 0 && index < this.cart.length) {
      const newQty = this.cart[index].quantity + change;
      if (newQty > 0) {
        this.cart[index].quantity = newQty;
      } else {
        this.onRemoveFromCart(index);
      }
    }
  }

  onRemoveFromCart(index: number): void {
    if (index >= 0 && index < this.cart.length) {
      const removed = this.cart[index].product.name;
      this.cart.splice(index, 1);
      this.showToast(`Eliminado de la bolsa: ${removed}`);
    }
  }

  onClearCart(): void {
    this.cart = [];
    this.showToast('Bolsa vaciada');
  }

  private showToast(message: string): void {
    this.activeNotification = message;
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }
    this.notificationTimeout = setTimeout(() => {
      this.activeNotification = null;
    }, 3200);
  }
}
