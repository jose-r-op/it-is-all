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
  supabaseUrl: 'https://jqzhqoutbgcttmbyklan.supabase.co',
  supabaseAnonKey: 'sb_publishable_gf9CLCmQ638lYICve2sz-A_jqIn1oQl'
};
