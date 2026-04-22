import { useEffect, useState } from 'react';
import { hermanoRepository, productoRepository } from '@/database/repositories';
import type { Hermano } from '@/interfaces/Hermano';
import { SectionLabel } from '@/components/landing/Helpers';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import {
  Euro, Users, CheckCircle2, ShoppingBag,
  Loader2, Search, Trash2, Plus, TrendingDown, TrendingUp, Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const CUOTA_ANUAL = 10;
const GASTOS_KEY = 'jhs_gastos_tienda';

type CategoriaGasto = 'Material' | 'Mantenimiento' | 'Personal' | 'Otros';

interface GastoTienda {
  id: string;
  concepto: string;
  importe: number;
  fecha: string;
  categoria: CategoriaGasto;
}

const CATEGORIA_COLORS: Record<CategoriaGasto, string> = {
  Material:      'text-blue-600 bg-blue-50 border-blue-200',
  Mantenimiento: 'text-amber-600 bg-amber-50 border-amber-200',
  Personal:      'text-purple-600 bg-purple-50 border-purple-200',
  Otros:         'text-primary/60 bg-muted border-secondary/20',
};

const ESTADO_CONFIG = {
  activo:         { label: 'Activo',    color: 'text-secondary border-secondary/30 bg-secondary/5' },
  pendiente_pago: { label: 'Pendiente', color: 'text-amber-600 border-amber-400/30 bg-amber-50' },
  baja:           { label: 'Baja',      color: 'text-red-500 border-red-400/30 bg-red-50' },
};

const PEDIDO_ESTADO_COLOR: Record<string, string> = {
  pendiente: 'text-amber-600 border-amber-400/30 bg-amber-50',
  pagado:    'text-secondary border-secondary/30 bg-secondary/5',
  entregado: 'text-primary/40 border-secondary/15 bg-muted/40',
};

// ── Componentes auxiliares ────────────────────────────────────────────────────

function SummaryCard({ icon: Icon, label, value, sub, highlight = false, danger = false }: {
  icon: React.ElementType; label: string; value: string; sub?: string;
  highlight?: boolean; danger?: boolean;
}) {
  return (
    <div className={cn(
      'border p-5',
      highlight ? 'border-secondary/40 bg-secondary/5' : danger ? 'border-red-300/40 bg-red-50/40' : 'border-secondary/15'
    )}>
      <div className="flex items-center justify-between mb-3">
        <p className="font-body text-[9px] tracking-widest uppercase text-primary/40">{label}</p>
        <Icon size={14} className={highlight ? 'text-secondary' : danger ? 'text-red-400' : 'text-primary/30'} />
      </div>
      <p className={cn('font-display text-3xl', highlight ? 'text-secondary' : danger ? 'text-red-500' : 'text-primary')}>
        {value}
      </p>
      {sub && <p className="font-body text-[10px] text-primary/35 mt-1">{sub}</p>}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-5 py-2.5 font-body text-[10px] tracking-widest uppercase transition-colors border-b-2',
        active ? 'border-secondary text-secondary' : 'border-transparent text-primary/40 hover:text-primary/70'
      )}
    >
      {children}
    </button>
  );
}

// ── Tab 1: Cuotas de hermanos ─────────────────────────────────────────────────

function CuentasHermanosTab({ hermanos }: { hermanos: Hermano[] }) {
  const [filtro, setFiltro] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState<'todos' | 'activo' | 'pendiente_pago' | 'baja'>('todos');

  const filtrados = hermanos.filter((h) => {
    const textoOk = `${h.nombre} ${h.apellidos} ${h.email}`.toLowerCase().includes(filtro.toLowerCase());
    const estadoOk = estadoFiltro === 'todos' || h.estado === estadoFiltro;
    return textoOk && estadoOk;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/30" />
          <Input
            placeholder="Buscar hermano…"
            className="pl-9 rounded-none border-secondary/30 bg-background text-sm"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {(['todos', 'activo', 'pendiente_pago', 'baja'] as const).map((e) => (
            <button
              key={e}
              onClick={() => setEstadoFiltro(e)}
              className={cn(
                'px-3 py-1.5 text-[9px] tracking-widest uppercase font-body border transition-colors',
                estadoFiltro === e
                  ? 'border-secondary bg-secondary/10 text-secondary'
                  : 'border-secondary/20 text-primary/40 hover:text-primary/70'
              )}
            >
              {e === 'todos' ? 'Todos' : e === 'activo' ? 'Activos' : e === 'pendiente_pago' ? 'Pendientes' : 'Baja'}
            </button>
          ))}
        </div>
      </div>

      <div className="border border-secondary/10 divide-y divide-secondary/10">
        <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2 bg-muted/30">
          {[
            { label: 'Hermano', span: 'col-span-4' },
            { label: 'Email',   span: 'col-span-3' },
            { label: 'Estado',  span: 'col-span-2' },
            { label: 'Cuota',   span: 'col-span-1' },
            { label: 'F. Alta', span: 'col-span-2' },
          ].map(({ label, span }) => (
            <p key={label} className={cn('font-body text-[9px] tracking-widest uppercase text-primary/40', span)}>
              {label}
            </p>
          ))}
        </div>

        {filtrados.map((h) => {
          const est = ESTADO_CONFIG[h.estado] ?? ESTADO_CONFIG.baja;
          const pagado = h.estado === 'activo';
          return (
            <div key={h.id} className="grid grid-cols-12 gap-3 px-4 py-3 items-center hover:bg-muted/20 transition-colors">
              <div className="col-span-12 md:col-span-4">
                <p className="font-serif text-sm text-primary">{h.apellidos}, {h.nombre}</p>
                <p className="font-body text-[10px] text-primary/35 md:hidden">{h.email}</p>
              </div>
              <p className="hidden md:block col-span-3 font-body text-xs text-primary/55 truncate">{h.email}</p>
              <div className="col-span-6 md:col-span-2">
                <span className={cn('inline-block px-2 py-0.5 text-[9px] tracking-widest uppercase border font-body', est.color)}>
                  {est.label}
                </span>
                {h.pago_presencial && (
                  <span className="ml-1 text-[8px] text-primary/30 uppercase tracking-widest">· Pres.</span>
                )}
              </div>
              <div className="col-span-3 md:col-span-1">
                {pagado
                  ? <span className="font-body text-xs text-secondary font-medium">{CUOTA_ANUAL} €</span>
                  : <span className="font-body text-xs text-primary/30">—</span>
                }
              </div>
              <p className="hidden md:block col-span-2 font-body text-[10px] text-primary/40">
                {h.fecha_alta ? new Date(h.fecha_alta).toLocaleDateString('es-ES') : '—'}
              </p>
            </div>
          );
        })}

        {filtrados.length === 0 && (
          <p className="text-center font-body text-sm text-primary/35 py-10">No se encontraron hermanos.</p>
        )}
      </div>

      <p className="font-body text-[10px] text-primary/30 mt-3 text-right">
        {filtrados.length} hermano{filtrados.length !== 1 ? 's' : ''} mostrado{filtrados.length !== 1 ? 's' : ''}
      </p>
    </div>
  );
}

// ── Tab 2: Ingresos de tienda (pedidos) ──────────────────────────────────────

function IngresostiendaTab({ pedidos }: { pedidos: any[] }) {
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'pendiente' | 'pagado' | 'entregado'>('todos');

  const filtrados = filtroEstado === 'todos'
    ? pedidos
    : pedidos.filter((p) => p.estado === filtroEstado);

  const totalFiltrados = filtrados.reduce((acc, p) => acc + Number(p.total), 0);

  return (
    <div>
      <div className="flex gap-1 mb-5 flex-wrap">
        {(['todos', 'pagado', 'entregado', 'pendiente'] as const).map((e) => (
          <button
            key={e}
            onClick={() => setFiltroEstado(e)}
            className={cn(
              'px-3 py-1.5 text-[9px] tracking-widest uppercase font-body border transition-colors',
              filtroEstado === e
                ? 'border-secondary bg-secondary/10 text-secondary'
                : 'border-secondary/20 text-primary/40 hover:text-primary/70'
            )}
          >
            {e === 'todos' ? 'Todos' : e.charAt(0).toUpperCase() + e.slice(1)}
          </button>
        ))}
      </div>

      <div className="border border-secondary/10 divide-y divide-secondary/8">
        <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2 bg-muted/30">
          {[
            { label: 'Hermano',  span: 'col-span-4' },
            { label: 'Producto', span: 'col-span-3' },
            { label: 'Fecha',    span: 'col-span-2' },
            { label: 'Importe',  span: 'col-span-2' },
            { label: 'Estado',   span: 'col-span-1' },
          ].map(({ label, span }) => (
            <p key={label} className={cn('font-body text-[9px] tracking-widest uppercase text-primary/40', span)}>
              {label}
            </p>
          ))}
        </div>

        {filtrados.length === 0 ? (
          <p className="text-center font-body text-sm text-primary/35 py-10">Sin pedidos en esta categoría.</p>
        ) : (
          filtrados.map((ped: any) => {
            const badge = PEDIDO_ESTADO_COLOR[ped.estado] ?? PEDIDO_ESTADO_COLOR.pendiente;
            return (
              <div key={ped.id} className="grid grid-cols-12 gap-3 px-4 py-3 items-center hover:bg-muted/20 transition-colors">
                <div className="col-span-12 md:col-span-4">
                  <p className="font-serif text-sm text-primary">
                    {ped.hermanos?.apellidos}, {ped.hermanos?.nombre}
                  </p>
                </div>
                <p className="col-span-6 md:col-span-3 font-body text-xs text-primary/55 truncate">
                  {ped.productos?.nombre} × {ped.cantidad}
                </p>
                <p className="hidden md:block col-span-2 font-body text-[10px] text-primary/40">
                  {new Date(ped.fecha).toLocaleDateString('es-ES')}
                </p>
                <p className="col-span-3 md:col-span-2 font-display text-base text-secondary">
                  +{Number(ped.total).toFixed(2)} €
                </p>
                <div className="col-span-3 md:col-span-1">
                  <span className={cn('inline-block px-2 py-0.5 border text-[9px] tracking-widest uppercase font-body', badge)}>
                    {ped.estado}
                  </span>
                </div>
              </div>
            );
          })
        )}

        {filtrados.length > 0 && (
          <div className="grid grid-cols-12 gap-3 px-4 py-3 bg-muted/30">
            <p className="col-span-9 font-body text-[9px] tracking-widest uppercase text-primary/40">
              Total mostrado
            </p>
            <p className="col-span-3 font-display text-lg text-secondary">+{totalFiltrados.toFixed(2)} €</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Tab 3: Gastos de tienda ───────────────────────────────────────────────────

function GastosTiendaTab({ palmasPedidos }: { palmasPedidos: any[] }) {
  const [gastos, setGastos] = useState<GastoTienda[]>([]);
  const [concepto, setConcepto] = useState('');
  const [importe, setImporte] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [categoria, setCategoria] = useState<CategoriaGasto>('Material');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(GASTOS_KEY);
      if (stored) setGastos(JSON.parse(stored));
    } catch { /* corrupted — start fresh */ }
  }, []);

  const persistir = (nuevos: GastoTienda[]) => {
    setGastos(nuevos);
    localStorage.setItem(GASTOS_KEY, JSON.stringify(nuevos));
  };

  const agregarGasto = () => {
    if (!concepto.trim()) { toast.error('Escribe un concepto'); return; }
    const valor = parseFloat(importe.replace(',', '.'));
    if (isNaN(valor) || valor <= 0) { toast.error('Importe no válido'); return; }
    setEnviando(true);
    const nuevo: GastoTienda = {
      id: crypto.randomUUID(),
      concepto: concepto.trim(),
      importe: valor,
      fecha,
      categoria,
    };
    persistir([nuevo, ...gastos]);
    setConcepto('');
    setImporte('');
    setFecha(new Date().toISOString().slice(0, 10));
    toast.success('Gasto registrado');
    setEnviando(false);
  };

  const eliminarGasto = (id: string) => {
    persistir(gastos.filter((g) => g.id !== id));
    toast.success('Gasto eliminado');
  };

  const totalGastos  = gastos.reduce((acc, g) => acc + g.importe, 0);
  const totalPalmas  = palmasPedidos.reduce((acc, p) => acc + Number(p.total), 0);
  const totalCombinado = totalGastos + totalPalmas;

  return (
    <div>
      <div className="border border-secondary/15 p-5 mb-6">
        <p className="font-body text-[9px] tracking-widest uppercase text-primary/40 mb-4">Registrar nuevo gasto</p>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Input
            placeholder="Concepto"
            className="rounded-none border-secondary/30 bg-background text-sm sm:col-span-2"
            value={concepto}
            onChange={(e) => setConcepto(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && agregarGasto()}
          />
          <Input
            placeholder="Importe (€)"
            type="number"
            min="0"
            step="0.01"
            className="rounded-none border-secondary/30 bg-background text-sm"
            value={importe}
            onChange={(e) => setImporte(e.target.value)}
          />
          <Input
            type="date"
            className="rounded-none border-secondary/30 bg-background text-sm"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-3">
          <div className="flex gap-1 flex-wrap">
            {(['Material', 'Mantenimiento', 'Personal', 'Otros'] as CategoriaGasto[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoria(cat)}
                className={cn(
                  'px-3 py-1.5 text-[9px] tracking-widest uppercase font-body border transition-colors',
                  categoria === cat
                    ? 'border-secondary bg-secondary/10 text-secondary'
                    : 'border-secondary/20 text-primary/40 hover:text-primary/70'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
          <Button
            onClick={agregarGasto}
            disabled={enviando}
            className="ml-auto rounded-none bg-secondary hover:bg-secondary/80 text-secondary-foreground text-xs tracking-widest uppercase gap-2"
          >
            <Plus size={13} />
            Añadir gasto
          </Button>
        </div>
      </div>

      {(gastos.length === 0 && palmasPedidos.length === 0) ? (
        <p className="text-center font-body text-sm text-primary/30 py-10 border border-dashed border-secondary/20">
          No hay gastos registrados aún.
        </p>
      ) : (
        <div className="border border-secondary/10 divide-y divide-secondary/10">
          <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2 bg-muted/30">
            {[
              { label: 'Concepto',  span: 'col-span-4' },
              { label: 'Categoría', span: 'col-span-2' },
              { label: 'Fecha',     span: 'col-span-2' },
              { label: 'Importe',   span: 'col-span-3' },
              { label: '',          span: 'col-span-1' },
            ].map(({ label, span }, i) => (
              <p key={i} className={cn('font-body text-[9px] tracking-widest uppercase text-primary/40', span)}>
                {label}
              </p>
            ))}
          </div>

          {/* Gastos manuales */}
          {gastos.map((g) => (
            <div key={g.id} className="grid grid-cols-12 gap-3 px-4 py-3 items-center hover:bg-muted/20 transition-colors">
              <p className="col-span-8 md:col-span-4 font-serif text-sm text-primary truncate">{g.concepto}</p>
              <div className="hidden md:block col-span-2">
                <span className={cn('inline-block px-2 py-0.5 text-[9px] tracking-widest uppercase border font-body', CATEGORIA_COLORS[g.categoria])}>
                  {g.categoria}
                </span>
              </div>
              <p className="hidden md:block col-span-2 font-body text-xs text-primary/50">
                {new Date(g.fecha + 'T00:00:00').toLocaleDateString('es-ES')}
              </p>
              <p className="col-span-3 font-display text-base text-red-500">
                -{g.importe.toFixed(2)} €
              </p>
              <div className="col-span-1 flex justify-end">
                <button
                  onClick={() => eliminarGasto(g.id)}
                  className="p-1.5 text-primary/20 hover:text-red-500 transition-colors"
                  title="Eliminar gasto"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}

          {/* Palmas automáticas (una por cofrade) */}
          {palmasPedidos.length > 0 && (
            <>
              <div className="px-4 py-2 bg-amber-50/60">
                <p className="font-body text-[9px] tracking-widest uppercase text-amber-700/60">
                  Palmas cofrades — automático ({palmasPedidos.length})
                </p>
              </div>
              {palmasPedidos.map((p: any) => (
                <div key={`palma-${p.id}`} className="grid grid-cols-12 gap-3 px-4 py-3 items-center bg-amber-50/30 hover:bg-amber-50/50 transition-colors">
                  <div className="col-span-8 md:col-span-4">
                    <p className="font-serif text-sm text-primary">
                      Palma — {p.hermanos?.apellidos}, {p.hermanos?.nombre}
                    </p>
                  </div>
                  <div className="hidden md:block col-span-2">
                    <span className="inline-block px-2 py-0.5 text-[9px] tracking-widest uppercase border font-body text-amber-700 bg-amber-50 border-amber-200">
                      Material
                    </span>
                  </div>
                  <p className="hidden md:block col-span-2 font-body text-xs text-primary/50">
                    {new Date(p.fecha).toLocaleDateString('es-ES')}
                  </p>
                  <p className="col-span-3 font-display text-base text-red-500">
                    -{Number(p.total).toFixed(2)} €
                  </p>
                  <div className="col-span-1" />
                </div>
              ))}
            </>
          )}

          <div className="grid grid-cols-12 gap-3 px-4 py-3 bg-muted/30">
            <p className="col-span-8 font-body text-[9px] tracking-widest uppercase text-primary/40">Total gastos</p>
            <p className="col-span-4 font-display text-lg text-red-500">-{totalCombinado.toFixed(2)} €</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function AdminCuentasPage() {
  const [hermanos, setHermanos]   = useState<Hermano[]>([]);
  const [pedidos, setPedidos]     = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState<'cuotas' | 'tienda' | 'gastos'>('cuotas');
  const [gastosTotales, setGastosTotales] = useState(0);

  useEffect(() => {
    Promise.all([
      hermanoRepository.obtenerTodos(),
      productoRepository.obtenerTodosPedidos(),
    ]).then(([herm, peds]) => {
      setHermanos(herm.data ?? []);
      setPedidos(peds.data ?? []);
      setLoading(false);
    });

    try {
      const stored = localStorage.getItem(GASTOS_KEY);
      if (stored) {
        const parsed: GastoTienda[] = JSON.parse(stored);
        setGastosTotales(parsed.reduce((acc, g) => acc + g.importe, 0));
      }
    } catch { /* noop */ }
  }, []);

  useEffect(() => {
    if (tab === 'cuotas') {
      try {
        const stored = localStorage.getItem(GASTOS_KEY);
        if (stored) {
          const parsed: GastoTienda[] = JSON.parse(stored);
          setGastosTotales(parsed.reduce((acc, g) => acc + g.importe, 0));
        }
      } catch { /* noop */ }
    }
  }, [tab]);

  const activos = hermanos.filter((h) => h.estado === 'activo').length;

  const recaudadoCuotas = activos * CUOTA_ANUAL;

  // Solo pedidos pagados o entregados cuentan como ingreso real
  const recaudadoTienda = pedidos
    .filter((p) => p.estado === 'pagado' || p.estado === 'entregado')
    .reduce((acc, p) => acc + Number(p.total), 0);

  // Palmas entregadas/pagadas a cofrades (gasto automático)
  const palmasPedidos = pedidos.filter(
    (p) => p.productos?.nombre === 'Palma Hermano' &&
           (p.estado === 'pagado' || p.estado === 'entregado')
  );
  const gastosPalmas = palmasPedidos.reduce((acc, p) => acc + Number(p.total), 0);

  const totalGastosConPalmas = gastosTotales + gastosPalmas;
  const totalIngresos        = recaudadoCuotas + recaudadoTienda;
  const balance              = totalIngresos - totalGastosConPalmas;

  return (
    <div className="p-4 md:p-8">
      {/* Cabecera */}
      <div className="mb-8">
        <SectionLabel>Administración</SectionLabel>
        <h1 className="font-display text-3xl md:text-4xl text-primary mt-1">Cuentas</h1>
        <p className="font-body text-sm text-primary/50 mt-1">
          Gestión financiera de la cofradía — cuotas, tienda y gastos
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={24} className="animate-spin text-secondary" />
        </div>
      ) : (
        <>
          {/* Tarjetas resumen — fila superior */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
            <SummaryCard
              icon={Users}
              label="Cuotas hermanos"
              value={`${recaudadoCuotas.toFixed(2)} €`}
              sub={`${activos} activos × ${CUOTA_ANUAL} €`}
            />
            <SummaryCard
              icon={ShoppingBag}
              label="Ingresos tienda"
              value={`${recaudadoTienda.toFixed(2)} €`}
              sub={`${pedidos.filter((p) => p.estado === 'pagado' || p.estado === 'entregado').length} pedidos cobrados`}
            />
            <SummaryCard
              icon={TrendingUp}
              label="Total ingresos"
              value={`${totalIngresos.toFixed(2)} €`}
              sub={`Cuotas + tienda`}
              highlight
            />
            <SummaryCard
              icon={TrendingDown}
              label="Gastos"
              value={`${totalGastosConPalmas.toFixed(2)} €`}
              sub={`Manuales + ${palmasPedidos.length} palmas`}
              danger={totalGastosConPalmas > 0}
            />
          </div>

          {/* Tarjeta balance — fila inferior destacada */}
          <div className={cn(
            'border p-5 mb-8 flex items-center justify-between',
            balance >= 0 ? 'border-secondary/40 bg-secondary/5' : 'border-red-300/40 bg-red-50/40'
          )}>
            <div>
              <p className="font-body text-[9px] tracking-widest uppercase text-primary/40 mb-1">Balance neto</p>
              <p className={cn('font-display text-4xl', balance >= 0 ? 'text-secondary' : 'text-red-500')}>
                {balance >= 0 ? '+' : ''}{balance.toFixed(2)} €
              </p>
              <p className="font-body text-[10px] text-primary/35 mt-1">
                {balance >= 0 ? 'Superávit' : 'Déficit'} · {totalIngresos.toFixed(2)} € ingresos − {totalGastosConPalmas.toFixed(2)} € gastos
              </p>
            </div>
            <Wallet size={32} className={balance >= 0 ? 'text-secondary/30' : 'text-red-300'} />
          </div>

          {/* Tabs */}
          <div className="border-b border-secondary/15 mb-6 flex gap-0">
            <TabButton active={tab === 'cuotas'} onClick={() => setTab('cuotas')}>
              <span className="flex items-center gap-2"><CheckCircle2 size={11} /> Cuotas</span>
            </TabButton>
            <TabButton active={tab === 'tienda'} onClick={() => setTab('tienda')}>
              <span className="flex items-center gap-2"><ShoppingBag size={11} /> Ingresos tienda</span>
            </TabButton>
            <TabButton active={tab === 'gastos'} onClick={() => setTab('gastos')}>
              <span className="flex items-center gap-2"><Euro size={11} /> Gastos</span>
            </TabButton>
          </div>

          {tab === 'cuotas'  && <CuentasHermanosTab hermanos={hermanos} />}
          {tab === 'tienda'  && <IngresostiendaTab pedidos={pedidos} />}
          {tab === 'gastos'  && <GastosTiendaTab palmasPedidos={palmasPedidos} />}
        </>
      )}
    </div>
  );
}
