import { useEffect, useState } from 'react';
import { productoRepository } from '@/database/repositories';
import { useAuthStore } from '@/stores/authStore';
import type { Producto, Pedido } from '@/interfaces/Producto';
import { SectionLabel } from '@/components/landing/Helpers';
import { toast } from 'react-hot-toast';
import { Loader2, Package, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const ESTADO_BADGE: Record<string, string> = {
  pendiente: 'text-amber-600 border-amber-400/30 bg-amber-50',
  pagado:    'text-secondary border-secondary/30 bg-secondary/5',
  entregado: 'text-primary/40 border-secondary/15 bg-muted/40',
};

export default function TiendaPage() {
  const { sessionHermano } = useAuthStore();
  const hermanoId = sessionHermano!.hermano.id;

  const [productos, setProductos] = useState<Producto[]>([]);
  const [pedidos, setPedidos]     = useState<Pedido[]>([]);
  const [loading, setLoading]     = useState(true);
  const [confirmando, setConfirmando] = useState<number | null>(null);
  const [comprando, setComprando]     = useState<number | null>(null);

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

  const comprar = async (producto: Producto) => {
    setComprando(producto.id);
    setConfirmando(null);
    const { data, error } = await productoRepository.crearPedido(hermanoId, producto.id, 1);
    if (error) {
      toast.error(error);
    } else {
      if (data) setPedidos((prev) => [data, ...prev]);
      toast.success(`Pedido de "${producto.nombre}" registrado`);
    }
    setComprando(null);
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

      {/* Grid de productos */}
      {productos.length === 0 ? (
        <p className="text-center font-body text-sm text-primary/35 py-16 border border-dashed border-secondary/20">
          No hay productos disponibles actualmente.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {productos.map((p) => (
            <div
              key={p.id}
              className="border border-secondary/15 flex flex-col hover:border-secondary/30 transition-colors"
            >
              {/* Imagen / placeholder */}
              <div className="h-28 bg-primary flex items-center justify-center border-b border-secondary/10">
                {p.imagen_url
                  ? <img src={p.imagen_url} alt={p.nombre} className="h-full w-full object-cover" />
                  : <Package size={32} className="text-secondary/40" />
                }
              </div>

              <div className="p-5 flex-1 flex flex-col">
                {/* Nombre + categoría */}
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="font-serif text-sm text-primary leading-snug">{p.nombre}</p>
                  {p.categoria && (
                    <span className="shrink-0 px-1.5 py-0.5 border border-secondary/20 text-[9px] tracking-widest uppercase font-body text-primary/40">
                      {p.categoria}
                    </span>
                  )}
                </div>

                {/* Descripción */}
                {p.descripcion && (
                  <p className="font-body text-[11px] text-primary/50 italic leading-relaxed mb-3">
                    {p.descripcion}
                  </p>
                )}

                {/* Precio + acción */}
                <div className="mt-auto">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-display text-2xl text-secondary">{p.precio.toFixed(2)}€</p>
                    {p.stock > 0 && p.stock < 10 && (
                      <p className="font-body text-[9px] text-amber-600">
                        Últimas {p.stock} ud.
                      </p>
                    )}
                  </div>

                  {confirmando === p.id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => comprar(p)}
                        disabled={comprando === p.id}
                        className="flex-1 py-1.5 bg-secondary text-secondary-foreground text-[9px] tracking-widest uppercase font-body hover:bg-secondary/90 transition-colors flex items-center justify-center"
                      >
                        {comprando === p.id
                          ? <Loader2 size={10} className="animate-spin" />
                          : 'Confirmar'}
                      </button>
                      <button
                        onClick={() => setConfirmando(null)}
                        className="px-2.5 py-1.5 border border-secondary/20 text-primary/40 hover:text-primary/70 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmando(p.id)}
                      disabled={p.stock === 0}
                      className="w-full py-1.5 border border-secondary text-[9px] tracking-widest uppercase font-body text-secondary hover:bg-secondary hover:text-secondary-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {p.stock === 0 ? 'Agotado' : 'Comprar'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
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
  );
}
