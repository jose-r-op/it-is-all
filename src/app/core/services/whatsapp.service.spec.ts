import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { CartItem, OrderCheckoutForm, Product } from '../models/product.model';
import { formatPrice } from '../utils/format-price';
import { WhatsappService } from './whatsapp.service';

const product = (id: number, name: string, price: number): Product => ({
  id,
  name,
  description: null,
  price,
  category: 'Camisetas',
  sizes: ['S', 'M'],
  imageUrl: '',
  available: true,
  featured: false,
  createdAt: ''
});

describe('WhatsappService', () => {
  let service: WhatsappService;
  const items: CartItem[] = [
    { key: '1__M', product: product(1, 'Camiseta Básica', 59900), selectedSize: 'M', quantity: 2 },
    { key: '2__L', product: product(2, 'Hoodie & Co #1', 149900), selectedSize: 'L', quantity: 1 }
  ];
  const form: OrderCheckoutForm = {
    customerName: 'Ana Pérez',
    contactPhone: '+57 300 123 4567',
    address: 'Calle 10 # 20-30, Apto 401',
    city: 'Medellín',
    paymentMethod: environment.paymentMethods[1],
    notes: ''
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WhatsappService);
  });

  it('builds a wa.me URL to the configured number (digits only)', () => {
    const url = service.buildWhatsAppUrl(form, items, 269700);
    expect(url.startsWith(`https://wa.me/${environment.whatsappNumber.replace(/\D/g, '')}?text=`)).toBeTrue();
  });

  it('encodes the full message so it round-trips through decodeURIComponent', () => {
    const url = service.buildWhatsAppUrl(form, items, 269700);
    const text = url.split('?text=')[1];
    expect(text).not.toMatch(/[\s#&]/); // nothing that breaks the query string
    const decoded = decodeURIComponent(text);
    expect(decoded).toBe(service.buildMessage(form, items, 269700));
  });

  it('includes customer, contact, address, payment, items and total', () => {
    const msg = service.buildMessage(form, items, 269700);
    expect(msg).toContain(`*NUEVO PEDIDO - ${environment.storeName}*`);
    expect(msg).toContain('👤 *Cliente:* Ana Pérez');
    expect(msg).toContain('📞 *Contacto:* +57 300 123 4567');
    expect(msg).toContain('📍 *Dirección:* Calle 10 # 20-30, Apto 401 - Medellín');
    expect(msg).toContain(`💳 *Método de pago:* ${environment.paymentMethods[1]}`);
    expect(msg).toContain(`• 2x Camiseta Básica (Talla: M) — ${formatPrice(119800)}`);
    expect(msg).toContain(`• 1x Hoodie & Co #1 (Talla: L) — ${formatPrice(149900)}`);
    expect(msg).toContain(`💰 *TOTAL A PAGAR: ${formatPrice(269700)}*`);
    expect(msg).not.toContain('Notas');
  });

  it('omits city when empty and appends notes when present', () => {
    const msg = service.buildMessage({ ...form, city: '  ', notes: 'Entregar\nen portería' }, items, 1);
    expect(msg).toContain('📍 *Dirección:* Calle 10 # 20-30, Apto 401\n');
    expect(msg.endsWith('📝 *Notas:* Entregar en portería')).toBeTrue();
  });

  it('collapses user-entered newlines so fields cannot inject fake lines', () => {
    const msg = service.buildMessage({ ...form, customerName: 'Ana\n💰 *TOTAL A PAGAR: $1*' }, items, 269700);
    expect(msg.split('\n').filter((l) => l.startsWith('💰')).length).toBe(1);
  });

  it('formats prices using the configured currency', () => {
    expect(formatPrice(269700)).toMatch(/269[.,\s]?700/);
  });
});

