import { TestBed } from '@angular/core/testing';
import { CartItem, Product } from '../models/product.model';
import { CART_STORAGE_KEY, CartService, MAX_QTY_PER_ITEM } from './cart.service';
import { SupabaseService } from './supabase.service';

const product = (id: number, price: number, extra: Partial<Product> = {}): Product => ({
  id,
  name: `Prenda ${id}`,
  description: null,
  price,
  category: 'Camisetas',
  sizes: ['S', 'M', 'L'],
  imageUrl: `https://example.com/${id}.jpg`,
  available: true,
  featured: false,
  createdAt: '2026-01-01T00:00:00Z',
  ...extra
});

describe('CartService', () => {
  let fetchResult: Product[] | null;
  let supabaseStub: Pick<SupabaseService, 'fetchAvailableByIds'>;

  function create(): CartService {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [{ provide: SupabaseService, useValue: supabaseStub }] });
    return TestBed.inject(CartService);
  }

  beforeEach(() => {
    localStorage.clear();
    fetchResult = [];
    supabaseStub = { fetchAvailableByIds: jasmine.createSpy('fetch').and.callFake(async () => fetchResult) };
  });

  afterEach(() => localStorage.clear());

  it('starts empty with zero totals', () => {
    const cart = create();
    expect(cart.items()).toEqual([]);
    expect(cart.totalItems()).toBe(0);
    expect(cart.total()).toBe(0);
    expect(cart.isEmpty()).toBeTrue();
  });

  it('adds items, merging same product + size and separating different sizes', () => {
    const cart = create();
    const p = product(1, 50000);
    cart.addItem(p, 'M', 1);
    cart.addItem(p, 'M', 2);
    cart.addItem(p, 'L', 1);
    expect(cart.items().length).toBe(2);
    expect(cart.items().find((i) => i.selectedSize === 'M')!.quantity).toBe(3);
    expect(cart.totalItems()).toBe(4);
  });

  it('computes subtotals and total exactly', () => {
    const cart = create();
    cart.addItem(product(1, 59900), 'S', 2);
    cart.addItem(product(2, 149900), 'L', 1);
    const [a, b] = cart.items();
    expect(cart.subtotal(a)).toBe(119800);
    expect(cart.subtotal(b)).toBe(149900);
    expect(cart.total()).toBe(269700);
  });

  it('ignores unavailable products and invalid quantities', () => {
    const cart = create();
    cart.addItem(product(1, 100, { available: false }), 'M');
    cart.addItem(product(2, 100), 'M', 0);
    cart.addItem(product(3, 100), 'M', -2);
    cart.addItem(product(4, 100), 'M', 1.5);
    expect(cart.items()).toEqual([]);
  });

  it('caps quantity per item', () => {
    const cart = create();
    cart.addItem(product(1, 10), 'M', 98);
    cart.addItem(product(1, 10), 'M', 5);
    expect(cart.items()[0].quantity).toBe(MAX_QTY_PER_ITEM);
    cart.updateQuantity(cart.items()[0].key, 10);
    expect(cart.items()[0].quantity).toBe(MAX_QTY_PER_ITEM);
  });

  it('updateQuantity increments, decrements and removes at zero', () => {
    const cart = create();
    cart.addItem(product(1, 10), 'M', 1);
    const key = cart.items()[0].key;
    cart.updateQuantity(key, 2);
    expect(cart.items()[0].quantity).toBe(3);
    cart.updateQuantity(key, -3);
    expect(cart.items()).toEqual([]);
    cart.updateQuantity('missing', 1); // no-op
    expect(cart.items()).toEqual([]);
  });

  it('removeItem and clearCart', () => {
    const cart = create();
    cart.addItem(product(1, 10), 'M');
    cart.addItem(product(2, 10), 'M');
    cart.removeItem(cart.items()[0].key);
    expect(cart.items().map((i) => i.product.id)).toEqual([2]);
    cart.clearCart();
    expect(cart.items()).toEqual([]);
    expect(localStorage.getItem(CART_STORAGE_KEY)).toBeNull();
  });

  it('persists to localStorage and restores on a fresh instance (page reload)', () => {
    const cart = create();
    cart.addItem(product(1, 59900), 'S', 2);
    cart.addItem(product(2, 149900), 'L', 1);
    expect(JSON.parse(localStorage.getItem(CART_STORAGE_KEY)!).length).toBe(2);

    const reloaded = create();
    expect(reloaded.items().length).toBe(2);
    expect(reloaded.totalItems()).toBe(3);
    expect(reloaded.total()).toBe(269700);
  });

  it('survives corrupted or malicious localStorage content', () => {
    localStorage.setItem(CART_STORAGE_KEY, '{not json');
    expect(create().items()).toEqual([]);

    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ a: 1 }));
    expect(create().items()).toEqual([]);

    const good: CartItem = { key: 'x', product: product(1, 100), selectedSize: 'M', quantity: 2 };
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify([
        good,
        { ...good, quantity: -1 },
        { ...good, quantity: 'many' },
        { ...good, product: { ...good.product, price: 'free' } },
        null,
        { ...good, quantity: 1 } // duplicate key gets merged
      ])
    );
    const cart = create();
    expect(cart.items().length).toBe(1);
    expect(cart.items()[0].key).toBe('1__M');
    expect(cart.items()[0].quantity).toBe(3);
  });

  it('refreshFromServer updates prices and removes unavailable products', async () => {
    const cart = create();
    cart.addItem(product(1, 100), 'M', 2);
    cart.addItem(product(2, 200), 'S', 1);
    fetchResult = [product(1, 150)]; // product 2 sold out, product 1 price changed

    const pending = cart.refreshFromServer();
    expect(cart.isCartLoading()).toBeTrue();
    await pending;

    expect(cart.isCartLoading()).toBeFalse();
    expect(cart.items().length).toBe(1);
    expect(cart.total()).toBe(300);
    expect(cart.removedNotice()).toEqual(['Prenda 2 (S)']);
    expect(create().total()).toBe(300); // persisted
  });

  it('refreshFromServer keeps the cart when verification fails (null)', async () => {
    const cart = create();
    cart.addItem(product(1, 100), 'M', 1);
    fetchResult = null;
    await cart.refreshFromServer();
    expect(cart.items().length).toBe(1);
    expect(cart.isCartLoading()).toBeFalse();
  });

  it('refreshFromServer does not drop items added while the request was in flight', async () => {
    const cart = create();
    cart.addItem(product(1, 100), 'M', 1);
    let resolve!: (v: Product[]) => void;
    (supabaseStub.fetchAvailableByIds as jasmine.Spy).and.returnValue(new Promise<Product[]>((r) => (resolve = r)));
    const pending = cart.refreshFromServer();
    cart.addItem(product(9, 50), 'L', 1);
    resolve([product(1, 100)]);
    await pending;
    expect(cart.items().map((i) => i.product.id)).toEqual([1, 9]);
  });

  it('refreshFromServer with empty cart does not call Supabase', async () => {
    const cart = create();
    await cart.refreshFromServer();
    expect(supabaseStub.fetchAvailableByIds).not.toHaveBeenCalled();
    expect(cart.isCartLoading()).toBeFalse();
  });
});

