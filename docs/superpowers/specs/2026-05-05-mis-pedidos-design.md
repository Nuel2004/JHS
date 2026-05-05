# Mis Pedidos — Design Spec
_2026-05-05_

## Overview

Nueva página `/mi/pedidos` que muestra el historial de compras del hermano autenticado. Tras completar un pago en la tienda (carrito o pedido individual), Stripe redirige aquí con `?pagado=1` mostrando un banner de confirmación.

---

## Architecture

### New file
- `src/pages/hermano/PedidosPage.tsx` — página completa

### Modified files
- `src/router.tsx` (o equivalente) — añadir ruta `/mi/pedidos`
- `supabase/functions/create-checkout-session/index.ts` — cambiar `success_url` del branch `carrito` de `/mi/tienda?pagado=1` a `/mi/pedidos?pagado=1`
- Menú/sidebar de área personal — añadir enlace a "Mis pedidos"

---

## UI Design (Layout C — cards individuales)

### Header
```
SectionLabel: "Área personal"
h1: "Mis pedidos"
subtitle: "Historial de compras en la tienda oficial"
divider: 40px línea dorada gradient
```

### Banner de éxito (solo cuando `?pagado=1`)
- Borde `border-secondary/30`, fondo `bg-secondary/7`
- Icono ✓ dorado + texto "Pago completado" + sub "Tus pedidos han sido actualizados"
- Solo visible mientras el query param esté presente; desaparece al limpiar el param

### Cards de pedidos

**Pendiente** (máximo contraste):
- Borde `border-secondary/35`, fondo `bg-secondary/4`
- Icono 44px con fondo `bg-secondary/10`
- Nombre producto en `text-primary` full opacity
- Fecha · cantidad · precio en `text-white/28` sans-serif 9px
- Badge amarillo "PENDIENTE" (`text-amber-500`)
- Botón "💳 Pagar ahora" — `bg-secondary/15 border-secondary/40 text-secondary`

**Pagado** (discreto):
- Borde estándar `border-white/7`
- Nombre en `text-white/60`
- Badge dorado tenue "PAGADO"
- Sin botón de acción

**Entregado** (mínimo):
- Borde `border-white/5`, `opacity-65` en el card entero
- Badge blanco tenue "ENTREGADO"

### Estado vacío
Texto itálico centrado: "Aún no has realizado ningún pedido." + enlace a `/mi/tienda`

---

## Data Flow

### Carga inicial
```
useEffect → supabase
  .from('pedidos')
  .select('*, productos(nombre, imagen_url)')
  .eq('hermano_id', user.id)
  .order('created_at', { ascending: false })
```

### Detección de `?pagado=1`
```
useEffect([searchParams]) →
  if searchParams.get('pagado') === '1':
    setMostrarBanner(true)
    setSearchParams({})  // limpiar URL
    refetch()            // actualizar lista
```

### Botón "Pagar ahora"
- Llama a `create-checkout-session` con `{ type: 'pedido', pedido_id: X, hermano_id: Y }`
- El branch `pedido` ya existe en el Edge Function (legacy single-pedido flow)
- `success_url: /mi/pedidos?pagado=1`
- El webhook Stripe actualiza el pedido a `pagado` en background

### Cambio en carrito
En `create-checkout-session`, branch `carrito`:
```ts
// antes
success_url: `${origin}/mi/tienda?pagado=1`
// después
success_url: `${origin}/mi/pedidos?pagado=1`
```

---

## Error Handling

- Error al cargar pedidos: texto "No se pudieron cargar tus pedidos. Inténtalo de nuevo." con botón de reintento
- Error al iniciar pago: toast de error, botón vuelve a estar activo
- Pedido sin producto (join null): mostrar "Producto eliminado" como nombre

---

## Testing Criteria

1. Tras pagar con carrito, el navegador llega a `/mi/pedidos?pagado=1` y muestra el banner
2. El banner desaparece y la URL se limpia tras el montaje
3. Los pedidos `pendiente` muestran el botón "Pagar ahora" y redirigen a Stripe
4. Los pedidos `pagado` y `entregado` no muestran botón de acción
5. Con 0 pedidos, se muestra el estado vacío con enlace a la tienda