import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CartService } from '../../core/services/cart.service';
import { SupabaseService } from '../../core/services/supabase.service';
import { WhatsappService } from '../../core/services/whatsapp.service';
import { DEMO_PRODUCTS } from '../../core/data/demo-products';
import { CartDrawerComponent } from './cart-drawer.component';

describe('CartDrawerComponent', () => {
  let fixture: ComponentFixture<CartDrawerComponent>;
  let cart: CartService;
  let openOrder: jasmine.Spy;
  let resolveFetch: (v: typeof DEMO_PRODUCTS | null) => void;

  beforeEach(() => {
    localStorage.clear();
    openOrder = jasmine.createSpy('openOrder');
    TestBed.configureTestingModule({
      imports: [CartDrawerComponent],
      providers: [
        {
          provide: SupabaseService,
          useValue: { fetchAvailableByIds: () => new Promise((r) => (resolveFetch = r)) }
        },
        { provide: WhatsappService, useValue: { openOrder } }
      ]
    });
    cart = TestBed.inject(CartService);
    fixture = TestBed.createComponent(CartDrawerComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
    document.body.style.overflow = '';
  });

  const el = () => fixture.nativeElement as HTMLElement;

  it('shows cart skeletons while verifying with Supabase, then the items', fakeAsync(() => {
    cart.addItem(DEMO_PRODUCTS[0], 'M', 2);
    cart.open();
    fixture.detectChanges();
    expect(el().querySelectorAll('app-cart-item-skeleton').length).toBe(1);
    expect(el().querySelector('app-cart-summary-skeleton')).not.toBeNull();

    resolveFetch([DEMO_PRODUCTS[0]]);
    tick();
    fixture.detectChanges();
    expect(el().querySelector('app-cart-item-skeleton')).toBeNull();
    expect(el().textContent).toContain(DEMO_PRODUCTS[0].name);
    expect(el().textContent).toContain('TALLA: M');
  }));

  it('does not open WhatsApp when required fields are missing', fakeAsync(() => {
    cart.addItem(DEMO_PRODUCTS[0], 'M', 1);
    cart.open();
    resolveFetch([DEMO_PRODUCTS[0]]);
    tick();
    fixture.componentInstance.submit();
    fixture.detectChanges();
    expect(openOrder).not.toHaveBeenCalled();
    expect(el().textContent).toContain('Por favor completa todos los campos requeridos');
  }));

  it('opens WhatsApp with form data, items and total when valid', fakeAsync(() => {
    cart.addItem(DEMO_PRODUCTS[0], 'M', 2);
    cart.open();
    resolveFetch([DEMO_PRODUCTS[0]]);
    tick();
    const c = fixture.componentInstance;
    c.form.setValue({
      customerName: 'Ana',
      contactPhone: '3001234567',
      address: 'Calle 1 # 2-3',
      city: '',
      paymentMethod: c.paymentMethods[0],
      notes: ''
    });
    c.submit();
    expect(openOrder).toHaveBeenCalledTimes(1);
    const [form, items, total] = openOrder.calls.mostRecent().args;
    expect(form.customerName).toBe('Ana');
    expect(items.length).toBe(1);
    expect(total).toBe(DEMO_PRODUCTS[0].price * 2);
    expect(c.orderSent()).toBeTrue();
  }));
});

