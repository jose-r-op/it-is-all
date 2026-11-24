/**
 * Configuración oficial de IT IS ALL CLOTHING CO.
 * Al desplegar en Supabase/Vercel, reemplaza supabaseUrl y supabaseAnonKey.
 */
export const environment = {
  production: true,
  storeName: 'IT IS ALL',
  storeTagline: 'Streetwear sombrío, confección pesada y estética sin etiquetas.',
  whatsappNumber: '573003637722',
  currencyCode: 'COP',
  locale: 'es-CO',
  paymentMethods: [
    'Transferencia Bancolombia / Nequi / Daviplata',
    'Efectivo Contraentrega (Pago al recibir)',
    'Tarjeta Débito/Crédito (Link Wompi / MercadoPago)'
  ],
  supabaseUrl: 'TU_SUPABASE_URL',
  supabaseAnonKey: 'TU_SUPABASE_ANON_KEY'
};
