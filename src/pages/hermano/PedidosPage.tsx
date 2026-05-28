import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useCarritoStore } from '@/stores/carritoStore';
import { SectionLabel, GoldenDivider } from '@/components/landing/Helpers';
import { supabaseClient } from '@/database/supabase/Client';
import { toast } from 'react-hot-toast';
import { Loader2, Package } from 'lucide-react';
import { cn, formatEur } from '@/lib/utils';
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
  const { vaciarCarrito } = useCarritoStore();

  const [pedidos, setPedidos] = useState<PedidoConProducto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPago, setLoadingPago] = useState<number | null>(null);
  const [mostrarBanner, setMostrarBanner] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const hermanoId = sessionHermano?.hermano.id;

  const fetchPedidos = useCallback(async () => {
    if (!hermanoId) return;
    const { data, error } = await supabaseClient
      .from('pedidos')
      .select('*, productos(nombre, imagen_url)')
      .eq('hermano_id', hermanoId)
      .order('fecha', { ascending: false });
    if (!error && data) setPedidos(data as PedidoConProducto[]);
  }, [hermanoId]);

  useEffect(() => {
    fetchPedidos().finally(() => setLoading(false));
  }, [fetchPedidos]);

  useEffect(() => {
    if (searchParams.get('pagado') !== '1') return;
    vaciarCarrito();
    setMostrarBanner(true);
    setSearchParams({});
    fetchPedidos();
  }, [searchParams, fetchPedidos, vaciarCarrito, setSearchParams]);

  if (!sessionHermano) return null;

  const pagarPedido = async (pedido: PedidoConProducto) => {
    setLoadingPago(pedido.id);
    try {
      const { data, error } = await supabaseClient.functions.invoke('create-checkout-session', {
        body: {
          type: 'pedido',
          hermano_id: sessionHermano.hermano.id,
          pedido_id: pedido.id,
          nombre: pedido.productos?.nombre ?? 'Pedido',
          total: pedido.total,
          origin: window.location.origin,
        },
      });
      if (error) throw error;
      if (data?.url) {
        setLoadingPago(null);
        window.location.href = data.url;
        return;
      }
      throw new Error('No URL');
    } catch (err: any) {
      toast.error(`Error al iniciar el pago: ${err?.message ?? String(err)}`);
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
                      {fecha} · {ped.cantidad} ud. · {formatEur(Number(ped.total))} €
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