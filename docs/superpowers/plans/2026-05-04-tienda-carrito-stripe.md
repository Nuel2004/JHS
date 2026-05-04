# Tienda profesional con carrito drawer y checkout multi-producto Stripe

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Activar el `carritoStore` existente en TiendaPage, añadir un `CartDrawer` lateral y actualizar las Edge Functions de Stripe para soportar checkout de múltiples productos.

**Architecture:** Se crea `CartDrawer` como componente nuevo en `src/components/tienda/`. TiendaPage delega en el carritoStore para gestionar ítems y llama al Edge Function `create-checkout-session` con `type: 'carrito'` y un array de ítems. El webhook procesa el array de pedido IDs desde `metadata.pedido_ids`. Las tarjetas de producto pasan de confirmar-comprar a añadir/quitar del carrito en línea.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Zustand (carritoStore ya existente), Supabase Edge Functions (Deno), Stripe v14

---

## Mapa de archivos

| Acción  | Ruta |
|---------|------|
| Crear   | `src/components/tienda/CartDrawer.tsx` |
| Modificar | `src/pages/hermano/TiendaPage.tsx` |
| Modificar | `supabase/functions/create-checkout-session/index.ts` |
| Modificar | `supabase/functions/stripe-webhook/index.ts` |

---

## Task 1: Actualizar Edge Function `create-checkout-session`

**Files:**
- Modify: `supabase/functions/create-checkout-session/index.ts`

- [ ] **Step 1: Reemplazar el contenido completo del archivo**

```typescript
// supabase/functions/create-checkout-session/index.ts
import Stripe from 'npm:stripe@14';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);
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
      line_items = items.map((item) => ({
        price_data: {
          currency: 'eur',
          product_data: { name: item.nombre },
          unit_amount: Math.round(item.precio * 100),
        },
        quantity: item.cantidad,
      }));
      metadata.pedido_ids = JSON.stringify(items.map((i) => i.pedido_id));
      success_url = `${origin}/mi/tienda?pagado=1`;
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
      success_url = `${origin}/mi/tienda?pagado=1`;
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
git commit -m "feat(stripe): soporte type carrito con múltiples line_items"
```

---

## Task 2: Actualizar Edge Function `stripe-webhook`

**Files:**
- Modify: `supabase/functions/stripe-webhook/index.ts`

- [ ] **Step 1: Reemplazar el contenido completo del archivo**

```typescript
// supabase/functions/stripe-webhook/index.ts
import Stripe from 'npm:stripe@14';
import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;

  const body = await req.text();
  const signature = req.headers.get('stripe-signature') ?? '';

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch {
    return new Response('Firma inválida', { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.CheckoutSession;
    const { type, hermano_id, pedido_id, pedido_ids } = session.metadata ?? {};

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    if (type === 'cuota' && hermano_id) {
      await supabase
        .from('hermanos')
        .update({ estado: 'activo' })
        .eq('id', hermano_id);
    } else if (type === 'carrito' && pedido_ids) {
      const ids = JSON.parse(pedido_ids) as number[];
      for (const id of ids) {
        await supabase
          .from('pedidos')
          .update({ estado: 'pagado', pago_id: session.payment_intent as string })
          .eq('id', id);
      }
    } else if (type === 'pedido' && pedido_id) {
      await supabase
        .from('pedidos')
        .update({ estado: 'pagado', pago_id: session.payment_intent as string })
        .eq('id', pedido_id);
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

- [ ] **Step 2: Commit**

```bash
git add supabase/functions/stripe-webhook/index.ts
git commit -m "feat(stripe): webhook procesa pedido_ids array para checkout carrito"
```

---

## Task 3: Crear componente `CartDrawer`

**Files:**
- Create: `src/components/tienda/CartDrawer.tsx`

- [ ] **Step 1: Crear directorio y archivo**

```bash
mkdir -p src/components/tienda
```

- [ ] **Step 2: Escribir el componente completo**

```tsx
// src/components/tienda/CartDrawer.tsx
import { X, ShoppingCart, Trash2, Loader2 } from 'lucide-react';
import { useCarritoStore } from '@/stores/carritoStore';
import { cn } from '@/lib/utils';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  onCheckout: () => void;
  loadingCheckout: boolean;
}

export default function CartDrawer({ open, onClose, onCheckout, loadingCheckout }: CartDrawerProps) {
  const { items, total, quitarItem, actualizarCantidad, vaciarCarrito } = useCarritoStore();

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-black/40 z-40 transition-opacity duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-80 bg-white z-50 flex flex-col shadow-2xl transition-transform duration-300',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-secondary/10">
          <div className="flex items-center gap-2">
            <ShoppingCart size={16} className="text-secondary" />
            <p className="font-serif text-sm text-primary">Tu carrito</p>
          </div>
          <button
            onClick={onClose}
            className="text-primary/40 hover:text-primary/70 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-secondary/8">
          {items.length === 0 ? (
            <p className="font-body text-sm text-primary/35 italic text-center py-12 px-5">
              El carrito está vacío
            </p>
          ) : (
            items.map((item) => (
              <div key={item.producto.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="font-serif text-xs text-primary leading-snug">{item.producto.nombre}</p>
                  <p className="font-body text-[10px] text-primary/45 mt-0.5">
                    {item.producto.precio.toFixed(2)} € / ud.
                  </p>
                </div>

                {/* Quantity controls */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => actualizarCantidad(item.producto.id, item.cantidad - 1)}
                    className="w-5 h-5 flex items-center justify-center border border-secondary/20 text-primary/50 hover:border-secondary/50 text-xs"
                  >
                    −
                  </button>
                  <span className="w-5 text-center font-body text-xs text-primary">
                    {item.cantidad}
                  </span>
                  <button
                    onClick={() => actualizarCantidad(item.producto.id, item.cantidad + 1)}
                    className="w-5 h-5 flex items-center justify-center border border-secondary/20 text-primary/50 hover:border-secondary/50 text-xs"
                  >
                    +
                  </button>
                </div>

                <p className="font-display text-sm text-secondary shrink-0 w-14 text-right">
                  {(item.producto.precio * item.cantidad).toFixed(2)}€
                </p>

                <button
                  onClick={() => quitarItem(item.producto.id)}
                  className="text-primary/25 hover:text-red-400 transition-colors shrink-0"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-secondary/10 space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-serif text-xs text-primary/50">Total</p>
            <p className="font-display text-xl text-secondary">{total.toFixed(2)}€</p>
          </div>

          <button
            onClick={onCheckout}
            disabled={items.length === 0 || loadingCheckout}
            className="w-full py-2.5 bg-secondary text-secondary-foreground text-[9px] tracking-widest uppercase font-body hover:bg-secondary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loadingCheckout && <Loader2 size={12} className="animate-spin" />}
            Pagar con Stripe
          </button>

          {items.length > 0 && (
            <button
              onClick={vaciarCarrito}
              className="w-full py-1.5 text-[9px] tracking-widest uppercase font-body text-primary/30 hover:text-primary/50 transition-colors"
            >
              Vaciar carrito
            </button>
          )}
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 3: Verificar que compila sin errores**

```bash
npm run build
```

Expected: sin errores de TypeScript.

- [ ] **Step 4: Commit**

```bash
git add src/components/tienda/CartDrawer.tsx
git commit -m "feat(tienda): componente CartDrawer con controles de cantidad y checkout"
```

---

## Task 4: Actualizar `TiendaPage`

**Files:**
- Modify: `src/pages/hermano/TiendaPage.tsx`

- [ ] **Step 1: Reemplazar el contenido completo del archivo**

```tsx
// src/pages/hermano/TiendaPage.tsx
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productoRepository } from '@/database/repositories';
import { useAuthStore } from '@/stores/authStore';
import { useCarritoStore } from '@/stores/carritoStore';
import type { Producto, Pedido } from '@/interfaces/Producto';
import { SectionLabel } from '@/components/landing/Helpers';
import { supabaseClient } from '@/database/supabase/Client';
import { toast } from 'react-hot-toast';
import { Loader2, Package, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import CartDrawer from '@/components/tienda/CartDrawer';

const ESTADO_BADGE: Record<string, string> = {
  pendiente: 'text-amber-600 border-amber-400/30 bg-amber-50',
  pagado:    'text-secondary border-secondary/30 bg-secondary/5',
  entregado: 'text-primary/40 border-secondary/15 bg-muted/40',
};

export default function TiendaPage() {
  const { sessionHermano } = useAuthStore();
  const hermanoId = sessionHermano!.hermano.id;
  const { items, total, agregarItem, actualizarCantidad, vaciarCarrito } = useCarritoStore();

  const [productos, setProductos]         = useState<Producto[]>([]);
  const [pedidos, setPedidos]             = useState<Pedido[]>([]);
  const [loading, setLoading]             = useState(true);
  const [drawerOpen, setDrawerOpen]       = useState(false);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [searchParams, setSearchParams]   = useSearchParams();

  useEffect(() => {
    Promise.all([
      productoRepository.obtenerActivos(),
      productoRepository.obtenerPedidosPorHermano(hermanoId),
    ]).then(([prods, peds]) => {
      setProductos(prods.data ?? []);
      setPedidos(peds.data ?? []);
      setLoading(false);
    });
  }, [hermanoId]);

  // Limpiar carrito y refrescar pedidos al volver de Stripe con éxito
  useEffect(() => {
    if (searchParams.get('pagado') !== '1') return;
    vaciarCarrito();
    toast.success('¡Pedido pagado con éxito!');
    setSearchParams({});
    productoRepository.obtenerPedidosPorHermano(hermanoId).then(({ data }) => {
      if (data) setPedidos(data);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const totalUnidades = items.reduce((acc, i) => acc + i.cantidad, 0);

  const cantidadEnCarrito = (productoId: number) =>
    items.find((i) => i.producto.id === productoId)?.cantidad ?? 0;

  const checkoutCarrito = async () => {
    setLoadingCheckout(true);
    const pedidosCreados: Array<{
      pedido_id: number;
      nombre: string;
      precio: number;
      cantidad: number;
    }> = [];

    for (const item of items) {
      const { data, error } = await productoRepository.crearPedido(
        hermanoId,
        item.producto.id,
        item.cantidad,
      );
      if (error || !data) {
        toast.error('Error al registrar el pedido. Inténtalo de nuevo.');
        setLoadingCheckout(false);
        return;
      }
      pedidosCreados.push({
        pedido_id: data.id,
        nombre: item.producto.nombre,
        precio: item.producto.precio,
        cantidad: item.cantidad,
      });
    }

    try {
      const { data: stripeData, error: stripeError } = await supabaseClient.functions.invoke(
        'create-checkout-session',
        {
          body: {
            type: 'carrito',
            hermano_id: hermanoId,
            items: pedidosCreados,
          },
        },
      );
      if (stripeError) throw stripeError;
      if (stripeData?.url) window.location.href = stripeData.url;
    } catch {
      toast.success('Pedidos registrados. Podrás pagarlos desde "Mis pedidos".');
      vaciarCarrito();
      setDrawerOpen(false);
      productoRepository.obtenerPedidosPorHermano(hermanoId).then(({ data }) => {
        if (data) setPedidos(data);
      });
    }
    setLoadingCheckout(false);
  };

  const nombreProducto = (id: number) =>
    productos.find((p) => p.id === id)?.nombre ?? `Producto #${id}`;

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 size={24} className="animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <>
      <CartDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onCheckout={checkoutCarrito}
        loadingCheckout={loadingCheckout}
      />

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Cabecera */}
        <SectionLabel>Tienda oficial</SectionLabel>
        <h1 className="font-display text-4xl text-primary mt-1 mb-2">
          Materiales y merchandising
        </h1>
        <p className="font-body text-sm text-primary/55 mb-8 max-w-lg">
          Adquiere los materiales de la hermandad. Los pedidos quedan registrados
          y se tramitarán en los próximos días.
        </p>

        {/* Botón carrito flotante */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="fixed top-20 right-6 z-30 flex items-center gap-2 px-3 py-2 bg-white border border-secondary/20 shadow-md hover:border-secondary/50 transition-colors"
        >
          <ShoppingCart size={16} className="text-secondary" />
          {totalUnidades > 0 && (
            <span className="w-5 h-5 flex items-center justify-center bg-secondary text-secondary-foreground text-[10px] font-body rounded-full">
              {totalUnidades}
            </span>
          )}
        </button>

        {/* Grid de productos */}
        {productos.length === 0 ? (
          <p className="text-center font-body text-sm text-primary/35 py-16 border border-dashed border-secondary/20">
            No hay productos disponibles actualmente.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
            {productos.map((p) => {
              const enCarrito = cantidadEnCarrito(p.id);
              return (
                <div
                  key={p.id}
                  className="border border-secondary/15 flex flex-col hover:border-secondary/30 transition-colors"
                >
                  {/* Imagen con badge de categoría superpuesto */}
                  <div className="relative h-48 bg-primary flex items-center justify-center border-b border-secondary/10 overflow-hidden">
                    {p.imagen_url
                      ? <img src={p.imagen_url} alt={p.nombre} className="h-full w-full object-cover" />
                      : <Package size={40} className="text-secondary/30" />
                    }
                    {p.categoria && (
                      <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/50 text-white text-[9px] tracking-widest uppercase font-body">
                        {p.categoria}
                      </span>
                    )}
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <p className="font-serif text-sm text-primary leading-snug mb-1">{p.nombre}</p>

                    {p.descripcion && (
                      <p className="font-body text-[11px] text-primary/50 italic leading-relaxed mb-3">
                        {p.descripcion}
                      </p>
                    )}

                    <div className="mt-auto">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-display text-2xl text-secondary">{p.precio.toFixed(2)}€</p>
                        {p.stock > 0 && p.stock < 10 && (
                          <p className="font-body text-[9px] text-amber-600">
                            Últimas {p.stock} ud.
                          </p>
                        )}
                      </div>

                      {enCarrito > 0 ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => actualizarCantidad(p.id, enCarrito - 1)}
                            className="w-7 h-7 flex items-center justify-center border border-secondary/30 text-primary/60 hover:border-secondary text-sm"
                          >
                            −
                          </button>
                          <span className="flex-1 text-center font-body text-sm text-primary">
                            {enCarrito}
                          </span>
                          <button
                            onClick={() => actualizarCantidad(p.id, enCarrito + 1)}
                            className="w-7 h-7 flex items-center justify-center border border-secondary/30 text-primary/60 hover:border-secondary text-sm"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => agregarItem(p)}
                          disabled={p.stock === 0}
                          className="w-full py-1.5 border border-secondary text-[9px] tracking-widest uppercase font-body text-secondary hover:bg-secondary hover:text-secondary-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          {p.stock === 0 ? 'Agotado' : 'Añadir al carrito'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Mis pedidos */}
        <div className="border-t border-secondary/10 pt-8">
          <p className="font-serif text-[10px] tracking-widest uppercase text-primary/40 mb-4">
            Mis pedidos
          </p>
          {pedidos.length === 0 ? (
            <p className="font-body text-sm text-primary/35 italic">
              Aún no has realizado ningún pedido.
            </p>
          ) : (
            <div className="border border-secondary/10 divide-y divide-secondary/8">
              {pedidos.map((ped) => {
                const badge = ESTADO_BADGE[ped.estado] ?? ESTADO_BADGE.pendiente;
                return (
                  <div key={ped.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-serif text-sm text-primary">
                        {nombreProducto(ped.producto_id)}
                      </p>
                      <p className="font-body text-[10px] text-primary/35">
                        {new Date(ped.fecha).toLocaleDateString('es-ES')} · {ped.cantidad} ud. · {Number(ped.total).toFixed(2)}€
                      </p>
                    </div>
                    <span className={cn('px-2 py-0.5 border text-[9px] tracking-widest uppercase font-body', badge)}>
                      {ped.estado}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Verificar que compila sin errores**

```bash
npm run build
```

Expected: sin errores de TypeScript ni de Vite.

- [ ] **Step 3: Commit**

```bash
git add src/pages/hermano/TiendaPage.tsx
git commit -m "feat(tienda): carrito drawer con checkout multi-producto Stripe"
```

---

## Verificación manual (navegador)

Una vez completadas todas las tareas:

1. `npm run dev` y navegar a `/mi/tienda`
2. Añadir un producto → el badge del carrito debe mostrar `1`
3. Añadir otro producto o incrementar cantidad → badge actualizado
4. Abrir drawer → ver ítems, precios, total
5. Cambiar cantidad con `−`/`+` → total se recalcula en tiempo real
6. Quitar ítem → desaparece del drawer
7. "Vaciar carrito" → drawer queda vacío
8. Añadir producto y pulsar "Pagar con Stripe" → redirect a checkout de Stripe con los ítems correctos
9. Cancelar pago → volver a `/mi/tienda` sin cambios en carrito
10. Completar pago en modo test → volver a `/mi/tienda?pagado=1` → toast de éxito + carrito vacío + pedidos actualizados en "Mis pedidos"