import { environment } from '../../../environments/environment';

let formatter: Intl.NumberFormat | null = null;

function getFormatter(): Intl.NumberFormat {
  if (!formatter) {
    try {
      formatter = new Intl.NumberFormat(environment.locale, {
        style: 'currency',
        currency: environment.currencyCode,
        maximumFractionDigits: environment.currencyCode === 'COP' ? 0 : 2
      });
    } catch {
      // Locale / moneda inválidos en la configuración: no romper la tienda.
      formatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 });
    }
  }
  return formatter;
}

/** Formatea un monto según `environment.locale` y `environment.currencyCode`. */
export function formatPrice(value: number): string {
  // Reemplaza espacios no separables para que el texto sea limpio en WhatsApp.
  return getFormatter().format(Number.isFinite(value) ? value : 0).replace(/\u00a0|\u202f/g, ' ');
}

