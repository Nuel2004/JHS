import { useEffect, useState } from 'react';
import { productoRepository } from '@/database/repositories';
import type { Producto } from '@/interfaces/Producto';
import { SectionLabel } from '@/components/landing/Helpers';
import { toast } from 'react-hot-toast';
import { Loader2, Package, Check, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'productos' | 'pedidos';

const ESTADO_COLOR: Record<string, string> = {
  pendiente: 'text-amber-600 border-amber-400/30 bg-amber-50',
  pagado:    'text-secondary border-secondary/30 bg-secondary/5',
  entregado: 'text-primary/40 border-secondary/15 bg-muted/40',
};

export default function AdminTiendaPage() {
  const [tab, setTab]           = useState<Tab>('productos');
  const [productos, setProductos] = useState<Producto[]>([]);
  const [pedidos, setPedidos]     = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [editStock, setEditStock] = useState<{ id: number; valor: number } | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    Promise.all([
      productoRepository.obtenerTodos(),
      productoRepository.obtenerTodosPedidos(),
    ]).then(([prods, peds]) => {
      setProductos(prods.data ?? []);
      setPedidos(peds.data ?? []);
      setLoading(false);
    });
  }, []);

  const guardarStock = async () => {
    if (!editStock) return;
    setGuardando(true);
    const { error } = await productoRepository.actualizarStock(editStock.id, editStock.valor);
    if (error) {
      toast.error(error);
    } else {
      setProductos((prev) =>
        prev.map((p) => p.id === editStock.id ? { ...p, stock: editStock.valor } : p)
      );
      toast.success('Stock actualizado');
      setEditStock(null);
    }
    setGuardando(false);
  };

  const totalPedidos  = pedidos.length;
  const totalRecaudado = pedidos.reduce((acc, p) => acc + Number(p.total ?? 0), 0);

  return (
    <div className="p-4 md:p-8">
      {/* Cabecera */}
      <div className="mb-8">
        <SectionLabel>Gestión comercial</SectionLabel>
        <h1 className="font-display text-3xl md:text-4xl text-primary mt-1">Tienda</h1>
        <p className="font-body text-sm text-primary/50 mt-1">
          Gestiona el catálogo de productos y los pedidos de los hermanos
        </p>
      </div>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        <div className="border border-secondary/15 p-4">
          <p className="font-body text-[9px] tracking-widest uppercase text-primary/40 mb-2">Productos</p>
          <p className="font-display text-3xl text-primary">{productos.filter((p) => p.activo).length}</p>
          <p className="font-body text-[9px] text-primary/30 mt-0.5">activos</p>
        </div>
        <div className="border border-secondary/15 p-4">
          <p className="font-body text-[9px] tracking-widest uppercase text-primary/40 mb-2">Pedidos</p>
          <p className="font-display text-3xl text-primary">{totalPedidos}</p>
          <p className="font-body text-[9px] text-primary/30 mt-0.5">totales</p>
        </div>
        <div className="border border-secondary/40 bg-secondary/5 p-4 col-span-2 md:col-span-1">
          <p className="font-body text-[9px] tracking-widest uppercase text-primary/40 mb-2">Recaudado</p>
          <p className="font-display text-3xl text-secondary">{totalRecaudado.toFixed(2)}€</p>
          <p className="font-body text-[9px] text-primary/30 mt-0.5">total pedidos</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-secondary/15 mb-6">
        {(['productos', 'pedidos'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-5 py-2.5 font-body text-[10px] tracking-widest uppercase border-b-2 -mb-px transition-colors',
              tab === t
                ? 'border-secondary text-secondary'
                : 'border-transparent text-primary/40 hover:text-primary/70'
            )}
          >
            {t === 'productos' ? 'Productos' : 'Pedidos'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 size={24} className="animate-spin text-secondary" />
        </div>
      ) : tab === 'productos' ? (

        /* ── Tab: Productos ── */
        <div className="border border-secondary/10 divide-y divide-secondary/8">
          {productos.length === 0 ? (
            <p className="px-4 py-8 font-body text-sm text-primary/35 italic text-center">
              No hay productos en la base de datos.
            </p>
          ) : (
            productos.map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors">
                <Package size={14} className="text-primary/25 shrink-0" />

                <div className="flex-1 min-w-0">
                  <p className="font-serif text-sm text-primary">{p.nombre}</p>
                  <p className="font-body text-[10px] text-primary/35">
                    {p.categoria ?? '—'} · {p.precio.toFixed(2)}€
                    {p.descripcion && ` · ${p.descripcion}`}
                  </p>
                </div>

                {/* Stock editable */}
                <div className="flex items-center gap-2">
                  {editStock?.id === p.id ? (
                    <>
                      <input
                        type="number"
                        min={0}
                        value={editStock.valor}
                        onChange={(e) =>
                          setEditStock({ id: p.id, valor: Math.max(0, Number(e.target.value)) })
                        }
                        onKeyDown={(e) => e.key === 'Enter' && guardarStock()}
                        className="w-16 border border-secondary/30 px-2 py-1 font-body text-xs text-center focus:outline-none focus:border-secondary"
                        autoFocus
                      />
                      <button
                        onClick={guardarStock}
                        disabled={guardando}
                        className="p-1 border border-secondary text-secondary hover:bg-secondary hover:text-white transition-colors"
                      >
                        {guardando
                          ? <Loader2 size={10} className="animate-spin" />
                          : <Check size={10} />}
                      </button>
                    </>
                  ) : (
                    <>
                      <span className={cn(
                        'font-body text-[11px]',
                        p.stock === 0 ? 'text-red-500' : p.stock < 5 ? 'text-amber-600' : 'text-primary/50'
                      )}>
                        {p.stock} ud.
                      </span>
                      <button
                        onClick={() => setEditStock({ id: p.id, valor: p.stock })}
                        className="p-1 text-primary/25 hover:text-secondary transition-colors"
                      >
                        <Edit2 size={11} />
                      </button>
                    </>
                  )}

                  {/* Indicador activo */}
                  <span
                    className={cn('ml-1 w-1.5 h-1.5 rounded-full', p.activo ? 'bg-secondary' : 'bg-primary/20')}
                    title={p.activo ? 'Activo' : 'Inactivo'}
                  />
                </div>
              </div>
            ))
          )}
        </div>

      ) : (

        /* ── Tab: Pedidos ── */
        <div className="border border-secondary/10 divide-y divide-secondary/8">
          {pedidos.length === 0 ? (
            <p className="px-4 py-8 font-body text-sm text-primary/35 italic text-center">
              No hay pedidos registrados.
            </p>
          ) : (
            pedidos.map((ped: any) => (
              <div key={ped.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-serif text-sm text-primary">
                    {ped.hermanos?.apellidos}, {ped.hermanos?.nombre}
                  </p>
                  <p className="font-body text-[10px] text-primary/35">
                    {ped.productos?.nombre} · {ped.cantidad} ud. · {Number(ped.total).toFixed(2)}€ ·{' '}
                    {new Date(ped.fecha).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <span className={cn(
                  'px-2 py-0.5 border text-[9px] tracking-widest uppercase font-body',
                  ESTADO_COLOR[ped.estado] ?? 'text-primary/40 border-secondary/15 bg-muted/40'
                )}>
                  {ped.estado}
                </span>
              </div>
            ))
          )}
        </div>

      )}
    </div>
  );
}
