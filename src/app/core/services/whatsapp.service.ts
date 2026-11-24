import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CartItem, OrderCheckoutForm } from '../models/product.model';
import { formatPrice } from '../utils/format-price';

/** Elimina saltos de línea / espacios repetidos para que el usuario no rompa el formato del mensaje. */
function clean(value: string | null | undefined): string {
  return (value ?? '').replace(/\s+/g, ' ').trim();
}

@Injectable({ providedIn: 'root' })
export class WhatsappService {
  /** Número destino con solo dígitos (wa.me no acepta +, espacios ni guiones). */
  get targetNumber(): string {
    return environment.whatsappNumber.replace(/\D/g, '');
  }

  buildMessage(form: OrderCheckoutForm, items: CartItem[], total: number): string {
    const city = clean(form.city);
    const notes = clean(form.notes);
    const lines = [
      `🛍️ *NUEVO PEDIDO - ${environment.storeName}*`,
      '',
      `👤 *Cliente:* ${clean(form.customerName)}`,
      `📞 *Contacto:* ${clean(form.contactPhone)}`,
      `📍 *Dirección:* ${clean(form.address)}${city ? ' - ' + city : ''}`,
      `💳 *Método de pago:* ${clean(form.paymentMethod)}`,
      '',
      `👕 *PRENDAS:*`,
      ...items.map(
        (item) =>
          `• ${item.quantity}x ${item.product.name} (Talla: ${item.selectedSize}) — ${formatPrice(item.product.price * item.quantity)}`
      ),
      '',
      `💰 *TOTAL A PAGAR: ${formatPrice(total)}*`
    ];
    if (notes) lines.push('', `📝 *Notas:* ${notes}`);
    return lines.join('\n');
  }

  buildWhatsAppUrl(form: OrderCheckoutForm, items: CartItem[], total: number): string {
    return `https://wa.me/${this.targetNumber}?text=${encodeURIComponent(this.buildMessage(form, items, total))}`;
  }

  /** Abre WhatsApp (app en móvil, Web en escritorio). Debe llamarse dentro de un evento de click. */
  openOrder(form: OrderCheckoutForm, items: CartItem[], total: number): string {
    const url = this.buildWhatsAppUrl(form, items, total);
    // Nota: con la feature 'noopener' window.open SIEMPRE devuelve null, por eso se anula opener a mano.
    const win = window.open(url, '_blank');
    if (win) win.opener = null;
    else window.location.href = url; // bloqueador de popups
    return url;
  }
}
