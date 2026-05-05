# Mis Pedidos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a dedicated `/mi/pedidos` page showing the hermano's order history with per-order Stripe payment buttons, and redirect there after every Stripe checkout.

**Architecture:** New `PedidosPage` component fetches pedidos with a Supabase join on `productos`, detects `?pagado=1` to show a success banner and clear the cart. Edge Function `success_url` values are updated from `/mi/tienda` to `/mi/pedidos`. `TiendaPage` loses its inline pedidos list (replaced by a link) and its now-unreachable `?pagado=1` handler.

**Tech Stack:** React 19 + TypeScript, React Router v6, Supabase JS client, react-hot-toast, lucide-react, Tailwind CSS v4, Zustand carritoStore.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/pages/hermano/PedidosPage.tsx` | Full orders page |
| Modify | `src/App.tsx` | Add `/mi/pedidos` route |
| Modify | `src/components/layout/Navbar.tsx` | Add "Pedidos" nav link |
| Modify | `supabase/functions/create-checkout-session/index.ts` | Update success_url to /mi/pedidos |
| Modify | `src/pages/hermano/TiendaPage.tsx` | Remove inline pedidos + ?pagado=1 handler |

---

### Task 1: Update success_url in Edge Function

**Files:**
- Modify: `supabase/functions/create-checkout-session/index.ts:58-73`

- [ ] **Step 1: Change both success_url lines in create-checkout-session**

In `supabase/functions/create-checkout-session/index.ts`, replace the two `success_url` lines inside the `carrito` and legacy `pedido` branches:

```typescript
// carrito branch (line ~58)
success_url = `${origin}/mi/pedidos?pagado=1`;
cancel_url  = `${origin}/mi/tienda`;

// legacy pedido branch (line ~72)
success_url = `${origin}/mi/pedidos?pagado=1`;
cancel_url  = `${origin}/mi/tienda`;
```

The full file after the change (only the two `success_url` assignments change):

```typescript
import Stripe from 'npm:stripe@14';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { type, hermano_id } = body;
    const origin = req.headers.get('origin') ?? 'http://localhost:5173';

    let line_items: Stripe.Checkout.SessionCreateParams.LineItem[];
    let success_url: string;
    let cancel_url: string;
    const metadata: Record<string, string> = { type, hermano_id: String(hermano_id) };

    if (type === 'cuota') {
      line_items = [{
        price_data: {
          currency: 'eur',
          product_data: { name: 'Cuota anual · Cofradía JHS Montijo' },
          unit_amount: 1000,
        },
        quantity: 1,
      }];
      success_url = `${origin}/mi/cuotas?pagado=1`;
      cancel_url  = `${origin}/mi/cuotas`;
    } else if (type === 'carrito') {
      const items = body.items as Array<{
        pedido_id: number;
        nombre: string;
        precio: number;
        cantidad: number;
      }>;
      if (!Array.isArray(items) || items.length === 0) {
        return new Response(JSON.stringify({ error: 'items must be a non-empty array' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      line_items = items.map((item) => ({
        price_data: {
          currency: 'eur',
          product_data: { name: item.nombre },
          unit_amount: Math.round(item.precio * 100),
        },
        quantity: item.cantidad,
      }));
      metadata.pedido_ids = JSON.stringify(items.map((i) => i.pedido_id));
      success_url = `${origin}/mi/pedidos?pagado=1`;
      cancel_url  = `${origin}/mi/tienda`;
    } else {
      // Caso legacy: type === 'pedido' (un solo producto)
      const { pedido_id, total, nombre } = body;
      line_items = [{
        price_data: {
          currency: 'eur',
          product_data: { name: nombre ?? 'Pedido · Cofradía JHS Montijo' },
          unit_amount: Math.round(total * 100),
        },
        quantity: 1,
      }];
      metadata.pedido_id = String(pedido_id);
      success_url = `${origin}/mi/pedidos?pagado=1`;
      cancel_url  = `${origin}/mi/tienda`;
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      success_url,
      cancel_url,
      payment_method_types: ['card'],
      locale: 'es',
      metadata,
    });

    if (!session.url) {
      return new Response(JSON.stringify({ error: 'Stripe did not return a checkout URL' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
```

- [ ] **Step 2: Commit**

```bash
git add supabase/functions/create-checkout-session/index.ts
git commit -m "feat(pedidos): redirect Stripe success to /mi/pedidos"
```

---

### Task 2: Create PedidosPage

**Files:**
- Create: `src/pages/hermano/PedidosPage.tsx`

- [ ] **Step 1: Create the file with full implementation**

```tsx
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useCarritoStore } from '@/stores/carritoStore';
import { SectionLabel, GoldenDivider } from '@/components/landing/Helpers';
import { supabaseClient } from '@/database/supabase/Client';
import { toast } from 'react-hot-toast';
import { Loader2, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Pedido } from '@/interfaces/Producto';

type PedidoConProducto = Pedido & {
  productos: { nombre: string; imagen_url: string | null } | null;
};

const BADGE: Record<string, { label: string; className: string }> = {
  pendiente: {
    label: 'Pendiente',
    className: 'text-amber-500 border-amber-400/35 bg-amber-50/10',
  },
  pagado: {
    label: 'Pagado',
    className: 'text-secondary/60 border-secondary/20 bg-secondary/4',
  },
  entregado: {
    label: 'Entregado',
    className: 'text-primary/25 border-white/10',
  },
};

export default function PedidosPage() {
  const { sessionHermano } = useAuthStore();
  const hermanoId = sessionHermano!.hermano.id;
  const { vaciarCarrito } = useCarritoStore();

  const [pedidos, setPedidos] = useState<PedidoConProducto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPago, setLoadingPago] = useState<number | null>(null);
  const [mostrarBanner, setMostrarBanner] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const fetchPedidos = async () => {
    const { data, error } = await supabaseClient
      .from('pedidos')
      .select('*, productos(nombre, imagen_url)')
      .eq('hermano_id', hermanoId)
      .order('fecha', { ascending: false });
    if (!error && data) setPedidos(data as PedidoConProducto[]);
  };

  useEffect(() => {
    fetchPedidos().finally(() => setLoading(false));
  }, [hermanoId]);

  useEffect(() => {
    if (searchParams.get('pagado') !== '1') return;
    vaciarCarrito();
    setMostrarBanner(true);
    setSearchParams({});
    fetchPedidos();
  }, [searchParams]);

  const pagarPedido = async (pedido: PedidoConProducto) => {
    setLoadingPago(pedido.id);
    try {
      const { data, error } = await supabaseClient.functions.invoke('create-checkout-session', {
        body: {
          type: 'pedido',
          hermano_id: hermanoId,
          pedido_id: pedido.id,
          nombre: pedido.productos?.nombre ?? 'Pedido',
          total: pedido.total,
        },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      throw new Error('No URL');
    } catch {
      toast.error('No se pudo iniciar el pago. Inténtalo de nuevo.');
    } finally {
      setLoadingPago(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 size={24} className="animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <SectionLabel>Área personal</SectionLabel>
      <h1 className="font-display text-4xl text-primary mt-1 mb-2">Mis pedidos</h1>
      <p className="font-body text-sm text-primary/55 mb-2">
        Historial de compras en la tienda oficial
      </p>
      <GoldenDivider className="justify-start" />

      {mostrarBanner && (
        <div className="mt-8 border border-secondary/30 bg-secondary/[0.07] px-4 py-3 flex items-center gap-3">
          <span className="text-secondary text-sm font-body">✓</span>
          <div>
            <p className="font-body text-[11px] text-secondary">Pago completado</p>
            <p className="font-body text-[9px] text-primary/35">Tus pedidos han sido actualizados</p>
          </div>
        </div>
      )}

      {pedidos.length === 0 ? (
        <p className="mt-10 font-body text-sm text-primary/35 italic text-center py-12 border border-dashed border-secondary/15">
          Aún no has realizado ningún pedido.{' '}
          <Link to="/mi/tienda" className="text-secondary underline underline-offset-2">
            Visita la tienda
          </Link>
        </p>
      ) : (
        <div className="mt-8 space-y-3">
          {pedidos.map((ped) => {
            const badge = BADGE[ped.estado] ?? BADGE.pendiente;
            const isPendiente = ped.estado === 'pendiente';
            const nombre = ped.productos?.nombre ?? `Producto #${ped.producto_id}`;
            const fecha = new Date(ped.fecha).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            });

            return (
              <div
                key={ped.id}
                className={cn(
                  'border p-[18px]',
                  isPendiente
                    ? 'border-secondary/35 bg-secondary/[0.04]'
                    : ped.estado === 'entregado'
                    ? 'border-white/5 opacity-65'
                    : 'border-white/[0.07]',
                )}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={cn(
                      'w-11 h-11 flex items-center justify-center shrink-0 border',
                      isPendiente
                        ? 'bg-secondary/10 border-secondary/20'
                        : 'bg-white/[0.03] border-white/[0.07]',
                    )}
                  >
                    <Package
                      size={20}
                      className={cn(isPendiente ? 'text-secondary/50' : 'text-white/20')}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p
                        className={cn(
                          'font-serif text-sm leading-snug',
                          isPendiente ? 'text-primary' : 'text-primary/60',
                        )}
                      >
                        {nombre}
                      </p>
                      <span
                        className={cn(
                          'shrink-0 px-2 py-0.5 border text-[7px] tracking-[2px] uppercase font-body',
                          badge.className,
                        )}
                      >
                        {badge.label}
                      </span>
                    </div>

                    <p className="font-body text-[9px] text-primary/28 mb-3">
                      {fecha} · {ped.cantidad} ud. · {Number(ped.total).toFixed(2)} €
                    </p>

                    {isPendiente && (
                      <button
                        type="button"
                        disabled={loadingPago === ped.id}
                        onClick={() => pagarPedido(ped)}
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-secondary/15 border border-secondary/40 text-secondary text-[8px] tracking-[2px] uppercase font-body hover:bg-secondary/25 transition-colors disabled:opacity-50"
                      >
                        {loadingPago === ped.id
                          ? <Loader2 size={11} className="animate-spin" />
                          : <span className="text-[11px]">💳</span>
                        }
                        Pagar ahora
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify the file was created**

Run: `npx tsc --noEmit`
Expected: no errors in PedidosPage.tsx (route not wired yet so unused import errors are expected until Task 3)

- [ ] **Step 3: Commit**

```bash
git add src/pages/hermano/PedidosPage.tsx
git commit -m "feat(pedidos): PedidosPage con cards pendiente/pagado/entregado"
```

---

### Task 3: Add route /mi/pedidos in App.tsx

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Add import for PedidosPage after the TiendaPage import**

In `src/App.tsx`, after line 37 (`import TiendaPage from './pages/hermano/TiendaPage';`), add:

```tsx
import PedidosPage from './pages/hermano/PedidosPage';
```

- [ ] **Step 2: Add the route inside the ProtectedRoute/NavbarPageLayout block**

In `src/App.tsx`, inside the `ProtectedRoute` children block (around line 79), add the new route after the existing `/mi/tienda` route:

```tsx
{ path: '/mi/cuotas', element: <CuotasPage /> },
{ path: '/mi/tienda', element: <TiendaPage /> },
{ path: '/mi/pedidos', element: <PedidosPage /> },
```

- [ ] **Step 3: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat(pedidos): add /mi/pedidos route"
```

---

### Task 4: Add "Pedidos" link in Navbar

**Files:**
- Modify: `src/components/layout/Navbar.tsx`

- [ ] **Step 1: Add Package to lucide-react imports**

In `src/components/layout/Navbar.tsx` line 6, add `Package` to the import list:

```tsx
import { LogOut, User, ShieldCheck, Menu, X, ChevronRight, ShoppingBag, Package } from 'lucide-react';
```

- [ ] **Step 2: Add desktop "Pedidos" link**

After the `/mi/tienda` NavLink block (around line 94), add:

```tsx
<NavLink to="/mi/pedidos">
  <Button
    variant="ghost"
    size="sm"
    className="font-body text-[10px] tracking-widest uppercase text-primary/60 hover:text-secondary hover:bg-secondary/5 gap-1.5 rounded-none"
  >
    <Package size={11} />
    Pedidos
  </Button>
</NavLink>
```

- [ ] **Step 3: Add mobile "Pedidos" link**

After the `/mi/tienda` mobile Link block (around line 217), add:

```tsx
<Link
  to="/mi/pedidos"
  onClick={() => setMenuOpen(false)}
  className="flex items-center justify-between py-2 font-body text-[11px] tracking-widest uppercase text-primary/60 no-underline"
>
  <span className="flex items-center gap-2"><Package size={12} /> Pedidos</span>
  <ChevronRight size={11} className="text-primary/20" />
</Link>
```

- [ ] **Step 4: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/Navbar.tsx
git commit -m "feat(pedidos): add Pedidos nav link desktop + mobile"
```

---

### Task 5: Clean up TiendaPage

Remove the now-unreachable `?pagado=1` handler and the inline pedidos list. Add a link to the dedicated page.

**Files:**
- Modify: `src/pages/hermano/TiendaPage.tsx`

- [ ] **Step 1: Remove unused imports and state**

In `src/pages/hermano/TiendaPage.tsx`:

1. Change the import on line 2 to remove `useSearchParams`:
```tsx
import { useEffect, useState } from 'react';
```

2. Change the type import on line 6 to remove `Pedido`:
```tsx
import type { Produto } from '@/interfaces/Produto';
```
Wait — the file imports from `@/interfaces/Produto` as `type { Produto, Pedido }`. Remove `Pedido`:
```tsx
import type { Produto } from '@/interfaces/Produto';
```
Actually looking at the file: line 6 is `import type { Produto, Pedido } from '@/interfaces/Produto';`
Change to:
```tsx
import type { Produto } from '@/interfaces/Produto';
```

3. Add `Link` to the react-router-dom import (needed for the "Ver mis pedidos" link):
```tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
```

- [ ] **Step 2: Remove pedidos state, searchParams, and ESTADO_BADGE**

Remove these lines entirely:
- The `ESTADO_BADGE` constant (lines 14–18)
- `const [pedidos, setPedidos] = useState<Pedido[]>([]);` (line 27)
- `const [searchParams, setSearchParams] = useSearchParams();` (line 30)

- [ ] **Step 3: Remove obtenerPedidosPorHermano from the initial fetch**

Replace the initial `useEffect` (lines 32–44) with a simpler version that only fetches products:

```tsx
useEffect(() => {
  productoRepository.obtenerActivos().then(({ data }) => {
    setProductos(data ?? []);
  }).catch(() => {
    toast.error('Error al cargar la tienda. Recarga la página.');
  }).finally(() => {
    setLoading(false);
  });
}, [hermanoId]);
```

- [ ] **Step 4: Remove the ?pagado=1 useEffect**

Delete the entire `useEffect` block (lines 47–55) that starts with:
```tsx
// Limpiar carrito y refrescar pedidos al volver de Stripe con éxito
useEffect(() => {
  if (searchParams.get('pagado') !== '1') return;
  ...
```

- [ ] **Step 5: Remove setPedidos from the catch in checkoutCarrito**

In the `checkoutCarrito` function catch block, remove the `productoRepository.obtenerPedidosPorHermano` call. The catch becomes:

```tsx
} catch {
  toast.success('Pedidos registrados. Podrás pagarlos desde "Mis pedidos".');
  vaciarCarrito();
  setDrawerOpen(false);
}
```

- [ ] **Step 6: Remove the nombreProducto helper**

Delete lines 128–129:
```tsx
const nombreProducto = (id: number) =>
  productos.find((p) => p.id === id)?.nombre ?? `Produto #${id}`;
```

- [ ] **Step 7: Replace the inline pedidos section with a link**

Replace the entire "Mis pedidos" div section at the bottom (lines 260–291) with a simple link:

```tsx
{/* Enlace a pedidos dedicado */}
<div className="border-t border-secondary/10 pt-6 flex items-center justify-between">
  <p className="font-serif text-[10px] tracking-widest uppercase text-primary/40">
    Mis pedidos
  </p>
  <Link
    to="/mi/pedidos"
    className="font-body text-[9px] tracking-widest uppercase text-secondary/70 hover:text-secondary transition-colors"
  >
    Ver historial →
  </Link>
</div>
```

- [ ] **Step 8: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 9: Commit**

```bash
git add src/pages/hermano/TiendaPage.tsx
git commit -m "refactor(tienda): remove inline pedidos, link to /mi/pedidos"
```

---

## Verification Checklist

After all tasks are complete:

- [ ] `npx tsc --noEmit` returns no errors
- [ ] Dev server starts: `npm run dev`
- [ ] Navigate to `/mi/pedidos` — page loads with header "Mis pedidos"
- [ ] If no orders: empty state shows with link to `/mi/tienda`
- [ ] If orders exist: pending ones show golden border + "Pagar ahora" button; paid/delivered are progressively more subdued
- [ ] Simulate post-payment: visit `/mi/pedidos?pagado=1` — banner appears, URL clears, banner stays visible
- [ ] TiendaPage bottom shows "Ver historial →" link pointing to `/mi/pedidos`
- [ ] Navbar shows "Pedidos" link on desktop and mobile