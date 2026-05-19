import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { productoRepository } from '@/database/repositories';
import type { Producto, ProductoCreate, CategoriaProducto } from '@/interfaces/Producto';
import { SectionLabel } from '@/components/landing/Helpers';
import { toast } from 'react-hot-toast';
import {
  Loader2, Package, Edit2, Trash2, Plus, X, Check,
  ChevronRight, AlertTriangle, Upload, ImageIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'productos' | 'pedidos';
type EstadoPedido = 'pendiente' | 'pagado' | 'entregado';

const ESTADO_COLOR: Record<EstadoPedido, string> = {
  pendiente: 'text-amber-600 border-amber-400/30 bg-amber-50',
  pagado:    'text-secondary border-secondary/30 bg-secondary/5',
  entregado: 'text-primary/40 border-secondary/15 bg-muted/40',
};

const ESTADO_SIGUIENTE: Record<EstadoPedido, EstadoPedido> = {
  pendiente: 'pagado',
  pagado:    'entregado',
  entregado: 'pendiente',
};

const CATEGORIAS: CategoriaProducto[] = ['Palma', 'Traje', 'Merchandising'];

const PRODUCTO_VACIO: ProductoCreate = {
  nombre: '',
  descripcion: '',
  precio: 0,
  stock: 0,
  categoria: null,
  imagen_url: '',
  activo: true,
};

/* ── Modal crear / editar producto ── */
function ProductoModal({
  inicial,
  onGuardar,
  onCerrar,
}: {
  inicial: ProductoCreate & { id?: number };
  onGuardar: (datos: ProductoCreate & { id?: number }) => Promise<void>;
  onCerrar: () => void;
}) {
  const [form, setForm] = useState(inicial);
  const [guardando, setGuardando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (k: keyof ProductoCreate, v: any) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendo(true);
    const { url, error } = await productoRepository.subirImagen(file);
    setSubiendo(false);
    if (error) { toast.error(error); return; }
    set('imagen_url', url ?? null);
    toast.success('Imagen subida');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim()) { toast.error('El nombre es obligatorio'); return; }
    if (form.precio < 0)     { toast.error('El precio no puede ser negativo'); return; }
    setGuardando(true);
    await onGuardar(form);
    setGuardando(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md border border-secondary/20 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-secondary/10">
          <h2 className="font-display text-lg text-primary">
            {inicial.id ? 'Editar producto' : 'Nuevo producto'}
          </h2>
          <button onClick={onCerrar} className="text-primary/30 hover:text-primary transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block font-body text-[10px] tracking-widest uppercase text-primary/40 mb-1">
              Nombre *
            </label>
            <input
              value={form.nombre}
              onChange={(e) => set('nombre', e.target.value)}
              className="w-full border border-secondary/20 px-3 py-2 font-body text-sm focus:outline-none focus:border-secondary"
              placeholder="Ej. Palma Grande"
            />
          </div>

          <div>
            <label className="block font-body text-[10px] tracking-widest uppercase text-primary/40 mb-1">
              Descripción
            </label>
            <input
              value={form.descripcion ?? ''}
              onChange={(e) => set('descripcion', e.target.value || null)}
              className="w-full border border-secondary/20 px-3 py-2 font-body text-sm focus:outline-none focus:border-secondary"
              placeholder="Descripción breve"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-body text-[10px] tracking-widest uppercase text-primary/40 mb-1">
                Precio (€) *
              </label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={form.precio}
                onChange={(e) => set('precio', parseFloat(e.target.value) || 0)}
                className="w-full border border-secondary/20 px-3 py-2 font-body text-sm focus:outline-none focus:border-secondary"
              />
            </div>
            <div>
              <label className="block font-body text-[10px] tracking-widest uppercase text-primary/40 mb-1">
                Stock
              </label>
              <input
                type="number"
                min={0}
                value={form.stock}
                onChange={(e) => set('stock', Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full border border-secondary/20 px-3 py-2 font-body text-sm focus:outline-none focus:border-secondary"
              />
            </div>
          </div>

          <div>
            <label className="block font-body text-[10px] tracking-widest uppercase text-primary/40 mb-1">
              Categoría
            </label>
            <select
              value={form.categoria ?? ''}
              onChange={(e) => set('categoria', e.target.value || null)}
              className="w-full border border-secondary/20 px-3 py-2 font-body text-sm focus:outline-none focus:border-secondary bg-white"
            >
              <option value="">— Sin categoría —</option>
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Imagen */}
          <div>
            <label className="block font-body text-[10px] tracking-widest uppercase text-primary/40 mb-1">
              Imagen
            </label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
            />
            <div className="flex gap-2 items-start">
              {/* Preview */}
              {form.imagen_url ? (
                <div className="relative shrink-0 w-16 h-16 border border-secondary/20 overflow-hidden bg-muted/20">
                  <img src={form.imagen_url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => set('imagen_url', null)}
                    className="absolute top-0.5 right-0.5 bg-white/80 rounded-full p-0.5 text-primary/50 hover:text-red-500 transition-colors"
                  >
                    <X size={10} />
                  </button>
                </div>
              ) : (
                <div className="shrink-0 w-16 h-16 border border-dashed border-secondary/25 flex items-center justify-center bg-muted/10">
                  <ImageIcon size={20} className="text-primary/20" />
                </div>
              )}
              <div className="flex-1 space-y-1.5">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={subiendo}
                  className="flex items-center gap-1.5 px-3 py-2 border border-secondary/20 font-body text-[10px] tracking-widest uppercase text-primary/50 hover:border-secondary hover:text-secondary transition-colors disabled:opacity-50 w-full justify-center"
                >
                  {subiendo
                    ? <><Loader2 size={10} className="animate-spin" /> Subiendo…</>
                    : <><Upload size={10} /> Subir desde ordenador</>
                  }
                </button>
                <input
                  value={form.imagen_url ?? ''}
                  onChange={(e) => set('imagen_url', e.target.value || null)}
                  className="w-full border border-secondary/15 px-2 py-1.5 font-body text-[11px] text-primary/50 focus:outline-none focus:border-secondary placeholder:text-primary/25"
                  placeholder="o pega una URL…"
                />
              </div>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.activo ?? true}
              onChange={(e) => set('activo', e.target.checked)}
              className="accent-secondary"
            />
            <span className="font-body text-sm text-primary/60">Activo (visible en tienda)</span>
          </label>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onCerrar}
              className="flex-1 border border-secondary/20 py-2 font-body text-xs tracking-widest uppercase text-primary/50 hover:bg-muted/30 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando || subiendo}
              className="flex-1 bg-secondary text-white py-2 font-body text-xs tracking-widest uppercase hover:bg-secondary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {guardando ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Diálogo de confirmación ── */
function ConfirmDialog({
  mensaje,
  onConfirmar,
  onCancelar,
}: {
  mensaje: string;
  onConfirmar: () => void;
  onCancelar: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-sm border border-red-200 shadow-xl p-6">
        <div className="flex items-start gap-3 mb-5">
          <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <p className="font-body text-sm text-primary">{mensaje}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancelar}
            className="flex-1 border border-secondary/20 py-2 font-body text-xs tracking-widest uppercase text-primary/50 hover:bg-muted/30 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            className="flex-1 bg-red-500 text-white py-2 font-body text-xs tracking-widest uppercase hover:bg-red-600 transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Página principal ── */
export default function AdminTiendaPage() {
  const isSuperAdmin = useAuthStore((s) => s.isSuperAdmin);
  const [tab, setTab]           = useState<Tab>('productos');
  const [productos, setProductos] = useState<Producto[]>([]);
  const [pedidos, setPedidos]     = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);

  // Modales producto
  const [modalProducto, setModalProducto] = useState<(ProductoCreate & { id?: number }) | null>(null);
  // Confirm eliminar
  const [confirmEliminar, setConfirmEliminar] = useState<{ tipo: 'producto' | 'pedido'; id: number } | null>(null);
  // Estado pedido en proceso
  const [cambiandoEstado, setCambiandoEstado] = useState<number | null>(null);

  const cargar = useCallback(async () => {
    const [prods, peds] = await Promise.all([
      productoRepository.obtenerTodos(),
      productoRepository.obtenerTodosPedidos(),
    ]);
    setProductos(prods.data ?? []);
    setPedidos(peds.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  /* ── Acciones producto ── */
  const handleGuardarProducto = async (datos: ProductoCreate & { id?: number }) => {
    const { id, ...campos } = datos;
    if (id) {
      const { error } = await productoRepository.actualizarProducto(id, campos);
      if (error) { toast.error(error); return; }
      setProductos((prev) => prev.map((p) => p.id === id ? { ...p, ...campos } as Producto : p));
      toast.success('Producto actualizado');
    } else {
      const { data, error } = await productoRepository.crearProducto(campos);
      if (error || !data) { toast.error(error ?? 'Error al crear'); return; }
      setProductos((prev) => [...prev, data]);
      toast.success('Producto creado');
    }
    setModalProducto(null);
  };

  const handleEliminarProducto = async (id: number) => {
    const { error } = await productoRepository.eliminarProducto(id);
    if (error) { toast.error(error); return; }
    setProductos((prev) => prev.filter((p) => p.id !== id));
    toast.success('Producto eliminado');
    setConfirmEliminar(null);
  };

  /* ── Acciones pedido ── */
  const handleAvanzarEstado = async (pedidoId: number, estadoActual: EstadoPedido) => {
    const siguiente = ESTADO_SIGUIENTE[estadoActual];
    setCambiandoEstado(pedidoId);
    const { error } = await productoRepository.actualizarEstadoPedido(pedidoId, siguiente);
    if (error) {
      toast.error(error);
    } else {
      setPedidos((prev) =>
        prev.map((p) => p.id === pedidoId ? { ...p, estado: siguiente } : p)
      );
      toast.success(`Pedido marcado como ${siguiente}`);
    }
    setCambiandoEstado(null);
  };

  const handleEliminarPedido = async (id: number) => {
    const { error } = await productoRepository.eliminarPedido(id);
    if (error) { toast.error(error); return; }
    setPedidos((prev) => prev.filter((p) => p.id !== id));
    toast.success('Pedido eliminado');
    setConfirmEliminar(null);
  };

  const totalRecaudado = pedidos
    .filter((p) => p.estado === 'pagado' || p.estado === 'entregado')
    .reduce((acc, p) => acc + Number(p.total ?? 0), 0);

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
          <p className="font-display text-3xl text-primary">{pedidos.length}</p>
          <p className="font-body text-[9px] text-primary/30 mt-0.5">totales</p>
        </div>
        <div className="border border-secondary/40 bg-secondary/5 p-4 col-span-2 md:col-span-1">
          <p className="font-body text-[9px] tracking-widest uppercase text-primary/40 mb-2">Recaudado</p>
          <p className="font-display text-3xl text-secondary">{totalRecaudado.toFixed(2)}€</p>
          <p className="font-body text-[9px] text-primary/30 mt-0.5">pedidos pagados/entregados</p>
        </div>
      </div>

      {/* Tabs + botón añadir */}
      <div className="flex items-center border-b border-secondary/15 mb-6">
        <div className="flex flex-1">
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

        {tab === 'productos' && isSuperAdmin && (
          <button
            onClick={() => setModalProducto(PRODUCTO_VACIO)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-secondary text-secondary hover:bg-secondary hover:text-white transition-colors font-body text-[10px] tracking-widest uppercase mb-px"
          >
            <Plus size={11} />
            Nuevo
          </button>
        )}
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
              No hay productos. Crea el primero con el botón "Nuevo".
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

                {/* Stock */}
                <span className={cn(
                  'font-body text-[11px]',
                  p.stock === 0 ? 'text-red-500' : p.stock < 5 ? 'text-amber-600' : 'text-primary/50'
                )}>
                  {p.stock} ud.
                </span>

                {/* Indicador activo */}
                <span
                  className={cn('w-1.5 h-1.5 rounded-full', p.activo ? 'bg-secondary' : 'bg-primary/20')}
                  title={p.activo ? 'Activo' : 'Inactivo'}
                />

                {/* Acciones */}
                <button
                  onClick={() => setModalProducto({ ...p })}
                  className="p-1 text-primary/25 hover:text-secondary transition-colors"
                  title="Editar"
                >
                  <Edit2 size={12} />
                </button>
                <button
                  onClick={() => setConfirmEliminar({ tipo: 'producto', id: p.id })}
                  className="p-1 text-primary/25 hover:text-red-500 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 size={12} />
                </button>
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

                {/* Badge estado con botón para avanzar */}
                <button
                  onClick={() => handleAvanzarEstado(ped.id, ped.estado)}
                  disabled={cambiandoEstado === ped.id}
                  title="Avanzar estado"
                  className={cn(
                    'flex items-center gap-1 px-2 py-0.5 border text-[9px] tracking-widest uppercase font-body transition-opacity hover:opacity-70',
                    ESTADO_COLOR[ped.estado as EstadoPedido] ?? 'text-primary/40 border-secondary/15 bg-muted/40'
                  )}
                >
                  {cambiandoEstado === ped.id
                    ? <Loader2 size={8} className="animate-spin" />
                    : <ChevronRight size={8} />
                  }
                  {ped.estado}
                </button>

                {/* Eliminar pedido */}
                <button
                  onClick={() => setConfirmEliminar({ tipo: 'pedido', id: ped.id })}
                  className="p-1 text-primary/25 hover:text-red-500 transition-colors"
                  title="Eliminar pedido"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))
          )}
        </div>

      )}

      {/* Modal crear/editar producto */}
      {modalProducto && (
        <ProductoModal
          inicial={modalProducto}
          onGuardar={handleGuardarProducto}
          onCerrar={() => setModalProducto(null)}
        />
      )}

      {/* Confirm eliminar */}
      {confirmEliminar && (
        <ConfirmDialog
          mensaje={
            confirmEliminar.tipo === 'producto'
              ? '¿Eliminar este producto? Esta acción no se puede deshacer.'
              : '¿Eliminar este pedido? Esta acción no se puede deshacer.'
          }
          onConfirmar={() =>
            confirmEliminar.tipo === 'producto'
              ? handleEliminarProducto(confirmEliminar.id)
              : handleEliminarPedido(confirmEliminar.id)
          }
          onCancelar={() => setConfirmEliminar(null)}
        />
      )}
    </div>
  );
}