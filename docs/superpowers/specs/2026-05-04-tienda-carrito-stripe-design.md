# Diseño: Tienda profesional con carrito y pago Stripe

**Fecha:** 2026-05-04  
**Estado:** Aprobado  

---

## Objetivo

Mejorar la TiendaPage para que sea más profesional, activando el `carritoStore` existente (actualmente desconectado) y permitiendo comprar múltiples productos en un único checkout de Stripe.

---

## Alcance

- Activar `carritoStore` en TiendaPage (actualmente compra ítem a ítem)
- Crear componente `CartDrawer` (panel lateral deslizante)
- Mejorar visualmente las tarjetas de producto
- Actualizar Edge Function `create-checkout-session` para múltiples ítems
- Actualizar Edge Function `stripe-webhook` para marcar múltiples pedidos como pagados

**Fuera de alcance:** nuevos métodos de pago (solo tarjeta), nueva ruta de carrito, cambios en CuotasPage.

---

## Arquitectura y componentes

### Nuevos archivos
- `src/components/tienda/CartDrawer.tsx` — panel lateral del carrito

### Archivos modificados
- `src/pages/hermano/TiendaPage.tsx` — tarjetas + indicador de carrito
- `supabase/functions/create-checkout-session/index.ts` — soporte `type: 'carrito'`
- `supabase/functions/stripe-webhook/index.ts` — actualización de múltiples pedidos

---

## Componentes UI

### TiendaPage

**Tarjetas de producto:**
- Imagen aumentada a `h-48` (antes `h-28`)
- Badge de categoría como overlay sobre la imagen (esquina superior izquierda)
- Indicador de stock bajo más visible
- Si el producto NO está en el carrito: botón "Añadir al carrito"
- Si el producto SÍ está en el carrito: controles `−` / cantidad / `+` directamente en la tarjeta
- Animación de rebote breve al añadir (`scale` con Tailwind)

**Indicador de carrito:**
- Botón sticky en la esquina superior derecha de la sección tienda
- Icono `ShoppingCart` de lucide-react con badge numérico (total de unidades en el carrito)
- Al hacer click abre el `CartDrawer`

### CartDrawer

Panel deslizante desde la derecha con overlay oscuro semitransparente.

**Cabecera:** título "Tu carrito" + botón cerrar (X)

**Lista de ítems:**
- Por cada ítem: icono/imagen pequeña, nombre del producto, precio unitario
- Selector de cantidad: botones `−` y `+` con el número en el centro
- Botón de eliminar ítem (icono papelera)

**Pie:**
- Total calculado
- Botón primario "Pagar con Stripe" (deshabilitado si el carrito está vacío)
- Botón secundario "Vaciar carrito"

---

## Flujo de datos: checkout multi-producto

1. Usuario añade productos → `carritoStore.agregarItem(producto)`
2. Abre CartDrawer, revisa ítems y pulsa "Pagar con Stripe"
3. Para cada ítem del carrito se llama a `productoRepository.crearPedido()` → pedidos creados con estado `pendiente`
4. Se invoca `create-checkout-session` con `type: 'carrito'` y el array de ítems (con sus `pedido_id`, nombre, precio, cantidad)
5. Edge Function crea sesión Stripe con múltiples `line_items`, almacena los IDs de pedidos como JSON en `metadata.pedido_ids`
6. Redirect al checkout de Stripe
7. Al completarse el pago, webhook recibe `checkout.session.completed`
8. Webhook parsea `metadata.pedido_ids` y actualiza cada pedido a estado `pagado`
9. `success_url` → `/mi/tienda?pagado=1`, donde se vacía el carrito y se muestra toast de éxito

---

## Cambios en Edge Functions

### create-checkout-session — nuevo caso `carrito`

```
type: 'carrito'
items: Array<{
  pedido_id: number,
  nombre: string,
  precio: number,      // en euros
  cantidad: number
}>
hermano_id: number
```

Genera `line_items` de Stripe para cada elemento del array.  
Guarda `pedido_ids` como `JSON.stringify(items.map(i => i.pedido_id))` en `session.metadata`.

### stripe-webhook — nuevo caso `carrito`

Cuando `type === 'carrito'`:
```
const pedidoIds = JSON.parse(metadata.pedido_ids)
for (const id of pedidoIds) {
  await supabase.from('pedidos').update({ estado: 'pagado', pago_id: session.payment_intent }).eq('id', id)
}
```

---

## Manejo de errores

- Si falla la creación de algún pedido antes del checkout: mostrar toast de error, no continuar
- Si falla la sesión Stripe tras crear los pedidos: mostrar toast "Pedidos registrados, podrás pagarlos desde Mis pedidos" (patrón ya existente)
- Si el webhook falla: los pedidos quedan en `pendiente`; el admin puede actualizarlos manualmente desde AdminTiendaPage

---

## Estado del carrito tras el pago

- Al detectar `?pagado=1` en la URL de éxito: `carritoStore.vaciarCarrito()` + toast de éxito
- El carrito persiste en `localStorage` (ya configurado en el store) si el usuario abandona sin pagar