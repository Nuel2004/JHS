import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productoRepository } from '@/database/repositories';
import { useAuthStore } from '@/stores/authStore';
import { useCarritoStore } from '@/stores/carritoStore';
import type { Producto } from '@/interfaces/Producto';
import { SectionLabel } from '@/components/landing/Helpers';
import { supabaseClient, supabaseAdmin } from '@/database/supabase/Client';
import { toast } from 'react-hot-toast';
import { Loader2, Package, ShoppingCart } from 'lucide-react';
import CartDrawer from '@/components/tienda/CartDrawer';

function localImage(p: Producto): string | null {
  const n = p.nombre.toLowerCase();
  if (n.includes('palma'))                        return '/images/palma.png';
  if (n.includes('estampita'))                    return '/images/estampita.png';
  if (n.includes('medalla') || n.includes('pin')) return '/images/medalla.png';
  if (n.includes('traje') || n.includes('tunic')) return '/images/tunica.png';
  if (p.categoria === 'Palma')                    return '/images/palma.png';
  if (p.categoria === 'Traje')                    return '/images/tunica.png';
  return null;
}

export default function TiendaPage() {
  const { sessionHermano } = useAuthStore();
  const hermanoId = sessionHermano!.hermano.id;
  const { items, agregarItem, actualizarCantidad } = useCarritoStore();

  const [productos, setProductos]             = useState<Producto[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [drawerOpen, setDrawerOpen]           = useState(false);
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  useEffect(() => {
    productoRepository.obtenerActivos().then(({ data }) => {
      setProductos(data ?? []);
    }).catch(() => {
      toast.error('Error al cargar la tienda. Recarga la página.');
    }).finally(() => {
      setLoading(false);
    });
  }, [hermanoId]);

  const totalUnidades = items.reduce((acc, i) => acc + i.cantidad, 0);

  const cantidadEnCarrito = (productoId: number) =>
    items.find((i) => i.producto.id === productoId)?.cantidad ?? 0;

  const checkoutCarrito = async () => {
    setLoadingCheckout(true);
    if (items.length === 0) {
      setLoadingCheckout(false);
      return;
    }
    const resultados = await Promise.all(
      items.map((item) =>
        productoRepository.crearPedido(hermanoId, item.producto.id, item.cantidad)
      )
    );

    const failedIndex = resultados.findIndex(({ error }) => error);
    if (failedIndex !== -1) {
      const successIds = resultados
        .slice(0, failedIndex)
        .map((r) => r.data!.id);
      if (successIds.length > 0) {
        await supabaseAdmin.from('pedidos').delete().in('id', successIds);
      }
      toast.error('Error al registrar el pedido. Inténtalo de nuevo.');
      setLoadingCheckout(false);
      return;
    }

    const pedidosCreados = resultados.map((r, i) => ({
      pedido_id: r.data!.id,
      nombre: items[i].producto.nombre,
      precio: items[i].producto.precio,
      cantidad: items[i].cantidad,
    }));

    try {
      const { data: stripeData, error: stripeError } = await supabaseClient.functions.invoke(
        'create-checkout-session',
        {
          body: {
            type: 'carrito',
            hermano_id: hermanoId,
            items: pedidosCreados,
            origin: window.location.origin,
          },
        },
      );
      if (stripeError) throw stripeError;
      if (stripeData?.url) {
        window.location.href = stripeData.url;
        return;
      }
      throw new Error('No se recibió URL de pago');
    } catch (err: any) {
      const msg = err?.message ?? String(err);
      toast.error(`Error al iniciar el pago: ${msg}`);
    }
    setLoadingCheckout(false);
  };

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
          Materiales y Productos Oficiales
        </h1>
        <p className="font-body text-sm text-primary/55 mb-8 max-w-lg">
          Adquiere los materiales de la hermandad. Los pedidos quedan registrados
          y se tramitarán en los próximos días.
        </p>

        {/* Botón carrito flotante */}
        <button
          type="button"
          aria-label={`Abrir carrito${totalUnidades > 0 ? `, ${totalUnidades} unidades` : ''}`}
          onClick={() => setDrawerOpen(true)}
          className="fixed top-[72px] right-4 sm:right-6 z-30 flex items-center gap-2 px-3 py-2 bg-white border border-secondary/20 shadow-md hover:border-secondary/50 transition-colors"
        >
          <ShoppingCart size={16} className="text-secondary" />
          {totalUnidades > 0 && (
            <span className="size-5 flex items-center justify-center bg-secondary text-secondary-foreground text-[10px] font-body rounded-full">
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
              if (p.nombre.toLowerCase().includes('palma hermano')) return null;
              const imgSrc = p.imagen_url ?? localImage(p);
              const enCarrito = cantidadEnCarrito(p.id);
              return (
                <div
                  key={p.id}
                  className="border border-secondary/15 flex flex-col hover:border-secondary/30 transition-colors"
                >
                  {/* Imagen con badge de categoría superpuesto */}
                  <div className="relative h-36 sm:h-44 md:h-48 bg-primary flex items-center justify-center border-b border-secondary/10 overflow-hidden">
                    {imgSrc
                      ? <img src={imgSrc} alt={p.nombre} className="h-full w-full object-cover" />
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
                            type="button"
                            aria-label={`Reducir cantidad de ${p.nombre}`}
                            onClick={() => actualizarCantidad(p.id, enCarrito - 1)}
                            className="size-7 flex items-center justify-center border border-secondary/30 text-primary/60 hover:border-secondary text-sm"
                          >
                            −
                          </button>
                          <span className="flex-1 text-center font-body text-sm text-primary">
                            {enCarrito}
                          </span>
                          <button
                            type="button"
                            aria-label={`Aumentar cantidad de ${p.nombre}`}
                            onClick={() => actualizarCantidad(p.id, Math.min(enCarrito + 1, p.stock))}
                            className="size-7 flex items-center justify-center border border-secondary/30 text-primary/60 hover:border-secondary text-sm"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
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

        {/* Enlace a pedidos */}
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
      </div>
    </>
  );
}
