# Tienda de ropa — Angular + Supabase + WhatsApp + Vercel

Tienda ligera y responsiva (Angular 19, componentes standalone + Signals, Tailwind CSS 3). Las prendas se leen de la tabla `products` de Supabase, el carrito se guarda en `localStorage` y el pedido se envía por WhatsApp con un mensaje ya armado.

## Requisitos
- Node.js **18.19+** (probado con 18.20.8) y npm.

## 1. Configuración (placeholders)
Edita `src/environments/environment.ts`:

| Clave | Para qué |
|---|---|
| `storeName`, `storeTagline` | Nombre y frase de la marca |
| `whatsappNumber` | Número que recibe los pedidos, con código de país y solo dígitos (ej. `573001234567`) |
| `currencyCode`, `locale` | Moneda y formato de precios (ej. `COP` / `es-CO`, `MXN` / `es-MX`) |
| `paymentMethods` | Opciones del selector de método de pago |
| `supabaseUrl`, `supabaseAnonKey` | Supabase > Project Settings > API |

Mientras `supabaseUrl`/`supabaseAnonKey` tengan los placeholders, la tienda muestra un **catálogo demo** (banner amarillo).

## 2. Supabase
1. Abre **SQL Editor** en Supabase, pega `supabase/schema.sql` y ejecútalo (crea la tabla `products`, el RLS de solo lectura y el bucket público `products`).
2. Sube fotos a **Storage > products** y copia su URL pública en `image_url`.
3. Administra las prendas desde **Table Editor > products**:
   - `sizes`: texto separado por comas (`S, M, L, XL` o `Única`).
   - `available`: ponlo en `false` cuando la prenda se venda; desaparece de la tienda y se retira de los carritos al abrirlos.
   - `featured`: `true` para que salga primero.

## 3. Desarrollo
```bash
npm install
npm start                 # http://localhost:4200
npm test -- --watch=false # pruebas unitarias (Chrome headless; define CHROME_BIN si hace falta)
npm run build             # salida en dist/tienda-ropa/browser
```

## 4. Despliegue en Vercel
`vercel.json` ya define el build, la carpeta de salida (`dist/tienda-ropa/browser`), el rewrite de SPA y las cabeceras de caché. Importa el repositorio en Vercel o ejecuta `vercel --prod`.

## Funcionamiento
- **Carrito**: Signals + `localStorage` (`clothing_store_cart_v1`), se sincroniza entre pestañas. Al abrirlo se consulta Supabase para actualizar precios y retirar prendas no disponibles (mientras tanto se ven skeletons).
- **Skeletons**: grilla de 8 tarjetas mientras carga el catálogo, skeleton por imagen hasta su evento `load`, filas skeleton en el carrito y en sus miniaturas.
- **WhatsApp**: `https://wa.me/<número>?text=<mensaje codificado>` con cliente, contacto, dirección, método de pago, prendas (cantidad, talla, subtotal), total y notas. Los datos de entrega se recuerdan en el dispositivo (`clothing_store_checkout_v1`).
- **Precios**: el total que llega por WhatsApp se calcula en el navegador. Verifícalo contra tu Table Editor antes de confirmar el pedido.

