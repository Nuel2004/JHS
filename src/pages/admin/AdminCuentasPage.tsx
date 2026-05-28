import { useEffect, useMemo, useState } from 'react';
import { hermanoRepository, productoRepository } from '@/database/repositories';
import type { Hermano } from '@/interfaces/Hermano';
import { SectionLabel } from '@/components/landing/Helpers';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import {
  Euro, Users, CheckCircle2, ShoppingBag,
  Loader2, Search, Trash2, Plus, TrendingDown, TrendingUp, Wallet,
  BookOpen, Clock, CalendarDays, BarChart2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';

const CUOTA_ANUAL = 10;
const GASTOS_KEY = 'jhs_gastos_tienda';
const MOVIMIENTOS_KEY = 'jhs_movimientos';
const MARGEN_TIENDA = 0.30;
const COSTE_TIENDA  = 1 - MARGEN_TIENDA; // 0.70

// Las palmas se compran para los cofrades: coste 100%, sin margen
const esPalma = (p: any) => String(p.productos?.nombre ?? '').toLowerCase().includes('palma');

// ── Legacy Gastos tab ─────────────────────────────────────────────────────────
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

// ── Balance types ─────────────────────────────────────────────────────────────
type TipoMovimiento = 'ingreso' | 'gasto';

const CATEGORIAS_INGRESO = [
  'Donativo Particular',
  'Donativo Bolsa',
  'Otro Ingreso',
] as const;

const CATEGORIAS_GASTO_BAL = [
  'Palmas',
  'Merchandising',
  'Fotocopias',
  'Coste Reparto',
  'Comisión Banco',
  'Donativo',
  'Flores',
  'Inversión',
  'Otros',
] as const;

type CategoriaIngreso     = typeof CATEGORIAS_INGRESO[number];
type CategoriaGastoBalance = typeof CATEGORIAS_GASTO_BAL[number];
type CategoriaMovimiento  = CategoriaIngreso | CategoriaGastoBalance;

interface MovimientoManual {
  id: string;
  tipo: TipoMovimiento;
  concepto: string;
  persona: string;
  importe: number;
  fecha: string;
  categoria: CategoriaMovimiento;
}

// ── Shared config ─────────────────────────────────────────────────────────────
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

// ── Utility components ────────────────────────────────────────────────────────
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
      type="button"
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
              type="button"
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
            <div key={h.id}>
              {/* Mobile card */}
              <div className="md:hidden px-4 py-3 hover:bg-muted/20 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-serif text-sm text-primary">{h.apellidos}, {h.nombre}</p>
                    <p className="font-body text-[10px] text-primary/35 truncate">{h.email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn('inline-block px-2 py-0.5 text-[9px] tracking-widest uppercase border font-body', est.color)}>
                      {est.label}
                    </span>
                    {pagado
                      ? <span className="font-body text-xs text-secondary font-medium">{CUOTA_ANUAL} €</span>
                      : <span className="font-body text-xs text-primary/30">-</span>
                    }
                  </div>
                </div>
                {h.pago_presencial && (
                  <p className="font-body text-[8px] text-primary/30 uppercase tracking-widest mt-0.5">Pago presencial</p>
                )}
              </div>
              {/* Desktop row */}
              <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-3 items-center hover:bg-muted/20 transition-colors">
                <div className="col-span-4">
                  <p className="font-serif text-sm text-primary">{h.apellidos}, {h.nombre}</p>
                </div>
                <p className="col-span-3 font-body text-xs text-primary/55 truncate">{h.email}</p>
                <div className="col-span-2">
                  <span className={cn('inline-block px-2 py-0.5 text-[9px] tracking-widest uppercase border font-body', est.color)}>
                    {est.label}
                  </span>
                  {h.pago_presencial && (
                    <span className="ml-1 text-[8px] text-primary/30 uppercase tracking-widest">· Pres.</span>
                  )}
                </div>
                <div className="col-span-1">
                  {pagado
                    ? <span className="font-body text-xs text-secondary font-medium">{CUOTA_ANUAL} €</span>
                    : <span className="font-body text-xs text-primary/30">-</span>
                  }
                </div>
                <p className="col-span-2 font-body text-[10px] text-primary/40">
                  {h.fecha_alta ? new Date(h.fecha_alta).toLocaleDateString('es-ES') : '-'}
                </p>
              </div>
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

// ── Tab 2: Ingresos de tienda ─────────────────────────────────────────────────
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
            type="button"
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
              <div key={ped.id}>
                {/* Mobile card */}
                <div className="md:hidden px-4 py-3 hover:bg-muted/20 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-serif text-sm text-primary">
                        {ped.hermanos?.apellidos}, {ped.hermanos?.nombre}
                      </p>
                      <p className="font-body text-[10px] text-primary/55 truncate mt-0.5">
                        {ped.productos?.nombre} × {ped.cantidad}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <p className="font-display text-base text-secondary">+{Number(ped.total).toFixed(2)} €</p>
                      <span className={cn('inline-block px-2 py-0.5 border text-[9px] tracking-widest uppercase font-body', badge)}>
                        {ped.estado}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Desktop row */}
                <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-3 items-center hover:bg-muted/20 transition-colors">
                  <div className="col-span-4">
                    <p className="font-serif text-sm text-primary">
                      {ped.hermanos?.apellidos}, {ped.hermanos?.nombre}
                    </p>
                  </div>
                  <p className="col-span-3 font-body text-xs text-primary/55 truncate">
                    {ped.productos?.nombre} × {ped.cantidad}
                  </p>
                  <p className="col-span-2 font-body text-[10px] text-primary/40">
                    {new Date(ped.fecha).toLocaleDateString('es-ES')}
                  </p>
                  <p className="col-span-2 font-display text-base text-secondary">
                    +{Number(ped.total).toFixed(2)} €
                  </p>
                  <div className="col-span-1">
                    <span className={cn('inline-block px-2 py-0.5 border text-[9px] tracking-widest uppercase font-body', badge)}>
                      {ped.estado}
                    </span>
                  </div>
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
function GastosTiendaTab({ pedidosVendidos }: { pedidosVendidos: any[] }) {
  const [gastos, setGastos] = useState<GastoTienda[]>([]);
  const [concepto, setConcepto] = useState('');
  const [importe, setImporte] = useState('');
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
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

  const palmasPedidos  = pedidosVendidos.filter(esPalma);
  const otrosPedidos   = pedidosVendidos.filter((p: any) => !esPalma(p));

  const totalGastos        = gastos.reduce((acc, g) => acc + g.importe, 0);
  const totalPalmas        = palmasPedidos.reduce((acc: number, p: any) => acc + Number(p.total), 0);
  const totalOtros         = otrosPedidos.reduce((acc: number, p: any) => acc + Number(p.total) * COSTE_TIENDA, 0);
  const totalCombinado     = totalGastos + totalPalmas + totalOtros;

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
                type="button"
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

      {(gastos.length === 0 && palmasPedidos.length === 0 && otrosPedidos.length === 0) ? (
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
              // index key acceptable: static list
              <p key={i} className={cn('font-body text-[9px] tracking-widest uppercase text-primary/40', span)}>
                {label}
              </p>
            ))}
          </div>

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
                  type="button"
                  onClick={() => eliminarGasto(g.id)}
                  className="p-1.5 text-primary/20 hover:text-red-500 transition-colors"
                  title="Eliminar gasto"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}

          {palmasPedidos.length > 0 && (
            <>
              <div className="px-4 py-2 bg-amber-50/60">
                <p className="font-body text-[9px] tracking-widest uppercase text-amber-700/60">
                  Palmas: coste completo · automático ({palmasPedidos.length})
                </p>
              </div>
              {palmasPedidos.map((p: any) => (
                <div key={`palma-${p.id}`} className="grid grid-cols-12 gap-3 px-4 py-3 items-center bg-amber-50/30 hover:bg-amber-50/50 transition-colors">
                  <div className="col-span-8 md:col-span-4">
                    <p className="font-serif text-sm text-primary">
                      {p.productos?.nombre ?? 'Palma'} × {p.cantidad} · {p.hermanos?.apellidos}, {p.hermanos?.nombre}
                    </p>
                  </div>
                  <div className="hidden md:block col-span-2">
                    <span className="inline-block px-2 py-0.5 text-[9px] tracking-widest uppercase border font-body text-amber-700 bg-amber-50 border-amber-200">
                      Palmas
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

          {otrosPedidos.length > 0 && (
            <>
              <div className="px-4 py-2 bg-blue-50/60">
                <p className="font-body text-[9px] tracking-widest uppercase text-blue-700/60">
                  Coste otros productos, automático ({otrosPedidos.length}) · margen {Math.round(MARGEN_TIENDA * 100)}%
                </p>
              </div>
              {otrosPedidos.map((p: any) => (
                <div key={`coste-${p.id}`} className="grid grid-cols-12 gap-3 px-4 py-3 items-center bg-blue-50/20 hover:bg-blue-50/40 transition-colors">
                  <div className="col-span-8 md:col-span-4">
                    <p className="font-serif text-sm text-primary">
                      {p.productos?.nombre ?? 'Producto'} × {p.cantidad} · {p.hermanos?.apellidos}, {p.hermanos?.nombre}
                    </p>
                  </div>
                  <div className="hidden md:block col-span-2">
                    <span className="inline-block px-2 py-0.5 text-[9px] tracking-widest uppercase border font-body text-blue-700 bg-blue-50 border-blue-200">
                      Coste producto
                    </span>
                  </div>
                  <p className="hidden md:block col-span-2 font-body text-xs text-primary/50">
                    {new Date(p.fecha).toLocaleDateString('es-ES')}
                  </p>
                  <p className="col-span-3 font-display text-base text-red-500">
                    -{(Number(p.total) * COSTE_TIENDA).toFixed(2)} €
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

// ── Tab 4: Balance Económico ──────────────────────────────────────────────────
function BalanceTab({
  hermanos,
  pedidos,
}: {
  hermanos: Hermano[];
  pedidos: any[];
}) {
  const [movimientos, setMovimientos] = useState<MovimientoManual[]>([]);
  const [gastosLegacy, setGastosLegacy] = useState<GastoTienda[]>([]);
  const [tipo, setTipo]           = useState<TipoMovimiento>('ingreso');
  const [concepto, setConcepto]   = useState('');
  const [persona, setPersona]     = useState('');
  const [importe, setImporte]     = useState('');
  const [fecha, setFecha]         = useState(() => new Date().toISOString().slice(0, 10));
  const [categoria, setCategoria] = useState<CategoriaMovimiento>('Donativo Particular');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(MOVIMIENTOS_KEY);
      if (stored) setMovimientos(JSON.parse(stored));
      const storedGastos = localStorage.getItem(GASTOS_KEY);
      if (storedGastos) setGastosLegacy(JSON.parse(storedGastos));
    } catch { /* noop */ }
  }, []);

  const persistir = (nuevos: MovimientoManual[]) => {
    setMovimientos(nuevos);
    localStorage.setItem(MOVIMIENTOS_KEY, JSON.stringify(nuevos));
  };

  const agregar = () => {
    if (!concepto.trim()) { toast.error('Escribe un concepto'); return; }
    const valor = parseFloat(importe.replace(',', '.'));
    if (isNaN(valor) || valor <= 0) { toast.error('Importe no válido'); return; }
    const nuevo: MovimientoManual = {
      id: crypto.randomUUID(),
      tipo,
      concepto: concepto.trim(),
      persona: persona.trim(),
      importe: valor,
      fecha,
      categoria,
    };
    persistir([...movimientos, nuevo]);
    setConcepto('');
    setPersona('');
    setImporte('');
    setFecha(new Date().toISOString().slice(0, 10));
    toast.success(tipo === 'ingreso' ? 'Ingreso registrado' : 'Gasto registrado');
  };

  const eliminar = (id: string) => {
    persistir(movimientos.filter((m) => m.id !== id));
    toast.success('Movimiento eliminado');
  };

  // Build unified ledger rows from all sources
  const filas = useMemo(() => {
    type Fila = {
      id: string;
      fecha: string;
      persona: string;
      concepto: string;
      categoria: string;
      ingreso: number;
      gasto: number;
      deletable: boolean;
      movimientoId?: string;
    };
    const rows: Fila[] = [];

    // Cuotas (one row per active hermano)
    hermanos
      .filter((h) => h.estado === 'activo')
      .forEach((h) => {
        const nombre = [h.apellidos, h.nombre].filter(Boolean).join(', ');
        rows.push({
          id: `cuota-${h.id}`,
          fecha: h.fecha_alta ?? '',
          persona: nombre,
          concepto: 'Cuota anual',
          categoria: 'Cuota',
          ingreso: CUOTA_ANUAL,
          gasto: 0,
          deletable: false,
        });
      });

    // Tienda pedidos (paid/delivered)
    pedidos
      .filter((p) => p.estado === 'pagado' || p.estado === 'entregado')
      .forEach((p) => {
        const nombre = p.hermanos
          ? [p.hermanos.apellidos, p.hermanos.nombre].filter(Boolean).join(', ')
          : '—';
        rows.push({
          id: `pedido-${p.id}`,
          fecha: p.fecha ?? '',
          persona: nombre,
          concepto: `${p.productos?.nombre ?? 'Producto'} × ${p.cantidad}`,
          categoria: 'Tienda',
          ingreso: Number(p.total),
          gasto: 0,
          deletable: false,
        });
      });

    // Manual movimientos
    movimientos.forEach((m) => {
      rows.push({
        id: `manual-${m.id}`,
        fecha: m.fecha,
        persona: m.persona,
        concepto: m.concepto,
        categoria: m.categoria,
        ingreso: m.tipo === 'ingreso' ? m.importe : 0,
        gasto:   m.tipo === 'gasto'   ? m.importe : 0,
        deletable: true,
        movimientoId: m.id,
      });
    });

    // Gastos de hermandad (del tab Gastos)
    gastosLegacy.forEach((g) => {
      rows.push({
        id: `gasto-${g.id}`,
        fecha: g.fecha,
        persona: '',
        concepto: g.concepto,
        categoria: g.categoria,
        ingreso: 0,
        gasto: g.importe,
        deletable: false,
      });
    });

    // Coste de productos vendidos: palmas al 100%, otros al 70%
    pedidos
      .filter((p) => p.estado === 'pagado' || p.estado === 'entregado')
      .forEach((p) => {
        const nombre = p.hermanos
          ? [p.hermanos.apellidos, p.hermanos.nombre].filter(Boolean).join(', ')
          : '—';
        const coste = esPalma(p) ? Number(p.total) : Number(p.total) * COSTE_TIENDA;
        rows.push({
          id: `coste-${p.id}`,
          fecha: p.fecha ?? '',
          persona: nombre,
          concepto: `${p.productos?.nombre ?? 'Producto'} × ${p.cantidad} — coste`,
          categoria: esPalma(p) ? 'Palmas' : 'Coste producto',
          ingreso: 0,
          gasto: coste,
          deletable: false,
        });
      });

    // Sort ascending by date
    rows.sort((a, b) => {
      if (!a.fecha && !b.fecha) return 0;
      if (!a.fecha) return 1;
      if (!b.fecha) return -1;
      return a.fecha.localeCompare(b.fecha);
    });

    return rows;
  }, [hermanos, pedidos, movimientos, gastosLegacy]);

  // Running saldo
  const filasConSaldo = useMemo(() => {
    let saldo = 0;
    return filas.map((f) => {
      saldo += f.ingreso - f.gasto;
      return { ...f, saldo };
    });
  }, [filas]);

  const totalIngresos = filas.reduce((s, f) => s + f.ingreso, 0);
  const totalGastos   = filas.reduce((s, f) => s + f.gasto, 0);
  const saldoFinal    = totalIngresos - totalGastos;

  const categoriasActuales = tipo === 'ingreso'
    ? (CATEGORIAS_INGRESO as readonly string[])
    : (CATEGORIAS_GASTO_BAL as readonly string[]);

  const formatFecha = (f: string) => {
    if (!f) return '—';
    try {
      // Date-only strings need T00:00:00 to avoid UTC-shift
      const d = f.length === 10 ? new Date(f + 'T00:00:00') : new Date(f);
      return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' });
    } catch { return f; }
  };

  return (
    <div>
      {/* Totals row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="border border-secondary/15 p-4">
          <p className="font-body text-[9px] tracking-widest uppercase text-primary/40 mb-2">Total ingresos</p>
          <p className="font-display text-2xl text-secondary">+{totalIngresos.toFixed(2)} €</p>
        </div>
        <div className="border border-red-200/40 bg-red-50/20 p-4">
          <p className="font-body text-[9px] tracking-widest uppercase text-primary/40 mb-2">Total gastos</p>
          <p className="font-display text-2xl text-red-500">-{totalGastos.toFixed(2)} €</p>
        </div>
        <div className={cn('border p-4', saldoFinal >= 0 ? 'border-secondary/40 bg-secondary/5' : 'border-red-300/40 bg-red-50/40')}>
          <p className="font-body text-[9px] tracking-widest uppercase text-primary/40 mb-2">Saldo final</p>
          <p className={cn('font-display text-2xl', saldoFinal >= 0 ? 'text-secondary' : 'text-red-500')}>
            {saldoFinal >= 0 ? '+' : ''}{saldoFinal.toFixed(2)} €
          </p>
        </div>
      </div>

      {/* Form: add movement */}
      <div className="border border-secondary/15 p-5 mb-6">
        <p className="font-body text-[9px] tracking-widest uppercase text-primary/40 mb-4">Registrar movimiento</p>

        {/* Tipo toggle */}
        <div className="flex gap-1 mb-4">
          {(['ingreso', 'gasto'] as const).map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => {
                setTipo(t);
                setCategoria(t === 'ingreso' ? 'Donativo Particular' : 'Palmas');
              }}
              className={cn(
                'px-4 py-1.5 text-[9px] tracking-widest uppercase font-body border transition-colors',
                tipo === t
                  ? t === 'ingreso'
                    ? 'border-secondary bg-secondary/10 text-secondary'
                    : 'border-red-400 bg-red-50 text-red-600'
                  : 'border-secondary/20 text-primary/40 hover:text-primary/70'
              )}
            >
              {t === 'ingreso' ? '+ Ingreso' : '− Gasto'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          <Input
            placeholder="Concepto *"
            className="rounded-none border-secondary/30 bg-background text-sm"
            value={concepto}
            onChange={(e) => setConcepto(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && agregar()}
          />
          <Input
            placeholder="Persona (opcional)"
            className="rounded-none border-secondary/30 bg-background text-sm"
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
          />
          <Input
            placeholder="Importe (€) *"
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

        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex gap-1 flex-wrap">
            {categoriasActuales.map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setCategoria(cat as CategoriaMovimiento)}
                className={cn(
                  'px-3 py-1.5 text-[9px] tracking-widest uppercase font-body border transition-colors',
                  categoria === cat
                    ? tipo === 'ingreso'
                      ? 'border-secondary bg-secondary/10 text-secondary'
                      : 'border-red-400 bg-red-50 text-red-600'
                    : 'border-secondary/20 text-primary/40 hover:text-primary/70'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
          <Button
            onClick={agregar}
            className={cn(
              'ml-auto rounded-none text-xs tracking-widest uppercase gap-2 shrink-0',
              tipo === 'ingreso'
                ? 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
                : 'bg-red-500 hover:bg-red-600 text-white'
            )}
          >
            <Plus size={13} />
            Añadir {tipo}
          </Button>
        </div>
      </div>

      {/* Ledger table */}
      {filasConSaldo.length === 0 ? (
        <p className="text-center font-body text-sm text-primary/30 py-10 border border-dashed border-secondary/20">
          Sin movimientos registrados.
        </p>
      ) : (
        <div className="border border-secondary/10 overflow-x-auto">
          {/* Header — desktop only */}
          <div className="hidden lg:grid grid-cols-12 gap-2 px-4 py-2 bg-muted/30 border-b border-secondary/10">
            {[
              { label: 'Fecha',     span: 'col-span-1' },
              { label: 'Persona',   span: 'col-span-2' },
              { label: 'Concepto',  span: 'col-span-3' },
              { label: 'Categoría', span: 'col-span-2' },
              { label: 'Ingreso',   span: 'col-span-1' },
              { label: 'Gasto',     span: 'col-span-1' },
              { label: 'Saldo',     span: 'col-span-1' },
              { label: '',          span: 'col-span-1' },
            ].map(({ label, span }, i) => (
              // index key acceptable: static list
              <p key={i} className={cn('font-body text-[9px] tracking-widest uppercase text-primary/40', span)}>
                {label}
              </p>
            ))}
          </div>

          <div className="divide-y divide-secondary/8">
            {filasConSaldo.map((fila) => (
              <div
                key={fila.id}
                className="grid grid-cols-12 gap-2 px-4 py-3 items-start lg:items-center hover:bg-muted/20 transition-colors"
              >
                {/* Fecha */}
                <p className="col-span-3 lg:col-span-1 font-body text-[10px] text-primary/50 mt-0.5">
                  {formatFecha(fila.fecha)}
                </p>

                {/* Persona */}
                <p className="col-span-5 lg:col-span-2 font-serif text-xs text-primary truncate">
                  {fila.persona || '—'}
                </p>

                {/* Concepto + categoria (mobile shows concepto only) */}
                <div className="col-span-4 lg:col-span-3">
                  <p className="font-body text-xs text-primary/80 truncate">{fila.concepto}</p>
                  {/* Categoria — visible only on mobile */}
                  <span className={cn(
                    'lg:hidden inline-block mt-0.5 px-1.5 py-0.5 text-[8px] tracking-widest uppercase border font-body',
                    fila.ingreso > 0
                      ? 'text-secondary border-secondary/30 bg-secondary/5'
                      : 'text-red-500 border-red-200 bg-red-50/50'
                  )}>
                    {fila.categoria}
                  </span>
                </div>

                {/* Categoría — desktop */}
                <div className="hidden lg:block col-span-2">
                  <span className={cn(
                    'inline-block px-2 py-0.5 text-[8px] tracking-widest uppercase border font-body',
                    fila.ingreso > 0
                      ? 'text-secondary border-secondary/30 bg-secondary/5'
                      : 'text-red-500 border-red-200 bg-red-50/50'
                  )}>
                    {fila.categoria}
                  </span>
                </div>

                {/* Ingreso — desktop */}
                <p className={cn(
                  'hidden lg:block col-span-1 font-display text-sm',
                  fila.ingreso > 0 ? 'text-secondary' : 'text-primary/20'
                )}>
                  {fila.ingreso > 0 ? `+${fila.ingreso.toFixed(2)}` : '—'}
                </p>

                {/* Gasto — desktop */}
                <p className={cn(
                  'hidden lg:block col-span-1 font-display text-sm',
                  fila.gasto > 0 ? 'text-red-500' : 'text-primary/20'
                )}>
                  {fila.gasto > 0 ? `-${fila.gasto.toFixed(2)}` : '—'}
                </p>

                {/* Saldo — desktop */}
                <p className={cn(
                  'hidden lg:block col-span-1 font-display text-sm font-medium',
                  fila.saldo >= 0 ? 'text-secondary' : 'text-red-500'
                )}>
                  {fila.saldo >= 0 ? '+' : ''}{fila.saldo.toFixed(2)}
                </p>

                {/* Delete / source label */}
                <div className="col-span-12 lg:col-span-1 flex items-center justify-between lg:justify-end mt-1 lg:mt-0">
                  {/* Mobile: amounts + saldo */}
                  <div className="flex gap-3 lg:hidden">
                    {fila.ingreso > 0 && (
                      <span className="font-display text-sm text-secondary">+{fila.ingreso.toFixed(2)} €</span>
                    )}
                    {fila.gasto > 0 && (
                      <span className="font-display text-sm text-red-500">-{fila.gasto.toFixed(2)} €</span>
                    )}
                    <span className={cn(
                      'font-display text-sm',
                      fila.saldo >= 0 ? 'text-secondary' : 'text-red-500'
                    )}>
                      = {fila.saldo >= 0 ? '+' : ''}{fila.saldo.toFixed(2)} €
                    </span>
                  </div>

                  {fila.deletable ? (
                    <button
                      type="button"
                      onClick={() => fila.movimientoId && eliminar(fila.movimientoId)}
                      className="p-1.5 text-primary/20 hover:text-red-500 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={13} />
                    </button>
                  ) : (
                    <span className="text-[8px] text-primary/20 uppercase tracking-widest">
                      {fila.id.startsWith('cuota-') ? 'auto'
                        : fila.id.startsWith('pedido-') ? 'tienda'
                        : fila.id.startsWith('gasto-') ? 'gastos'
                        : 'coste'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Footer totals */}
          <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-muted/30 border-t border-secondary/10">
            <p className="col-span-8 lg:col-span-6 font-body text-[9px] tracking-widest uppercase text-primary/40">
              {filasConSaldo.length} movimiento{filasConSaldo.length !== 1 ? 's' : ''}
            </p>
            <p className="hidden lg:block col-span-1 font-display text-sm text-secondary">
              +{totalIngresos.toFixed(2)}
            </p>
            <p className="hidden lg:block col-span-1 font-display text-sm text-red-500">
              -{totalGastos.toFixed(2)}
            </p>
            <p className={cn(
              'col-span-4 lg:col-span-1 font-display text-sm text-right lg:text-left',
              saldoFinal >= 0 ? 'text-secondary' : 'text-red-500'
            )}>
              {saldoFinal >= 0 ? '+' : ''}{saldoFinal.toFixed(2)} €
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab 5: Antigüedad ─────────────────────────────────────────────────────────
function AntiguedadTab({ hermanos }: { hermanos: Hermano[] }) {
  const hoy = new Date();
  const calcAnios = (fecha: string) => {
    const d = fecha.length === 10 ? new Date(fecha + 'T00:00:00') : new Date(fecha);
    return Math.floor((hoy.getTime() - d.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
  };

  const filas = hermanos
    .filter((h) => h.estado === 'activo' && h.fecha_alta)
    .map((h) => ({ ...h, anios: calcAnios(h.fecha_alta), cuotasEst: calcAnios(h.fecha_alta) * CUOTA_ANUAL }))
    .sort((a, b) => b.anios - a.anios);

  if (filas.length === 0) {
    return <p className="font-body text-sm text-primary/35 italic py-10 text-center">No hay hermanos activos con fecha de alta registrada.</p>;
  }

  return (
    <div>
      <div className="border border-secondary/10 divide-y divide-secondary/8">
        <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2 bg-muted/30">
          {[
            { label: 'Hermano',          span: 'col-span-4' },
            { label: 'Fecha de alta',    span: 'col-span-2' },
            { label: 'Años en hermandad', span: 'col-span-3' },
            { label: 'Cuotas est.',      span: 'col-span-3' },
          ].map(({ label, span }) => (
            <p key={label} className={`font-body text-[9px] tracking-widest uppercase text-primary/40 ${span}`}>{label}</p>
          ))}
        </div>

        {filas.map((h) => (
          <div key={h.id}>
            {/* Mobile card */}
            <div className="md:hidden px-4 py-3 hover:bg-muted/20 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-serif text-sm text-primary">{h.apellidos}, {h.nombre}</p>
                  <p className="font-body text-[10px] text-primary/35 mt-0.5">
                    Alta: {new Date(h.fecha_alta + 'T00:00:00').toLocaleDateString('es-ES')}
                  </p>
                </div>
                <div className="flex flex-col items-end shrink-0 gap-0.5">
                  <div className="flex items-center gap-1">
                    <span className={`font-display text-lg ${h.anios >= 10 ? 'text-secondary' : 'text-primary'}`}>
                      {h.anios}
                    </span>
                    <span className="font-body text-[10px] text-primary/40">
                      año{h.anios !== 1 ? 's' : ''}
                    </span>
                    {h.anios >= 10 && (
                      <span className="px-1.5 py-0.5 bg-secondary/10 text-secondary text-[8px] tracking-widest uppercase border border-secondary/20">Veterano</span>
                    )}
                  </div>
                  <p className="font-body text-xs text-primary/70">
                    ~{h.cuotasEst} €
                    <span className="ml-1 text-[9px] text-primary/35">{h.anios} × {CUOTA_ANUAL} €/año</span>
                  </p>
                </div>
              </div>
            </div>
            {/* Desktop row */}
            <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-3 items-center hover:bg-muted/20 transition-colors">
              <div className="col-span-4">
                <p className="font-serif text-sm text-primary">{h.apellidos}, {h.nombre}</p>
              </div>
              <p className="col-span-2 font-body text-xs text-primary/55">
                {new Date(h.fecha_alta + 'T00:00:00').toLocaleDateString('es-ES')}
              </p>
              <div className="col-span-3 flex items-center gap-2">
                <span className={`font-display text-lg ${h.anios >= 10 ? 'text-secondary' : 'text-primary'}`}>
                  {h.anios}
                </span>
                <span className="font-body text-[10px] text-primary/40">
                  año{h.anios !== 1 ? 's' : ''}
                  {h.anios >= 10 && <span className="ml-1.5 px-1.5 py-0.5 bg-secondary/10 text-secondary text-[8px] tracking-widest uppercase border border-secondary/20">Veterano</span>}
                </span>
              </div>
              <p className="col-span-3 font-body text-xs text-primary/70">
                ~{h.cuotasEst} €
                <span className="block text-[9px] text-primary/35">{h.anios} × {CUOTA_ANUAL} €/año</span>
              </p>
            </div>
          </div>
        ))}
      </div>
      <p className="font-body text-[10px] text-primary/30 mt-3 text-right">
        {filas.length} hermano{filas.length !== 1 ? 's' : ''} activo{filas.length !== 1 ? 's' : ''} · cuotas estimadas (un pago por año)
      </p>
    </div>
  );
}

// ── Tab 6: Estadísticas ───────────────────────────────────────────────────────
function EstadisticasTab({
  hermanos,
  pedidos,
  gastosTotales,
}: {
  hermanos: Hermano[];
  pedidos: any[];
  gastosTotales: number;
}) {
  const hoy = new Date();
  const calcAnios = (fecha: string) => {
    const d = fecha.length === 10 ? new Date(fecha + 'T00:00:00') : new Date(fecha);
    return Math.floor((hoy.getTime() - d.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
  };

  const activos    = hermanos.filter((h) => h.estado === 'activo').length;
  const pendientes = hermanos.filter((h) => h.estado === 'pendiente_pago').length;
  const bajas      = hermanos.filter((h) => h.estado === 'baja').length;

  const pedidosVendidos    = pedidos.filter((p) => p.estado === 'pagado' || p.estado === 'entregado');
  const pedidosPendientesArr = pedidos.filter((p) => p.estado === 'pendiente');
  const recaudadoCuotas    = activos * CUOTA_ANUAL;
  const recaudadoTienda    = pedidosVendidos.reduce((acc: number, p: any) => acc + Number(p.total), 0);
  const costosProductos    = pedidosVendidos.reduce((acc: number, p: any) => acc + (esPalma(p) ? Number(p.total) : Number(p.total) * COSTE_TIENDA), 0);
  const tasaCobro          = hermanos.length > 0 ? Math.round((activos / hermanos.length) * 100) : 0;
  const cuotaNoRecaudada   = pendientes * CUOTA_ANUAL;
  const pedidosPendientesCount = pedidosPendientesArr.length;
  const pedidosPendientesTotal = pedidosPendientesArr.reduce((acc: number, p: any) => acc + Number(p.total), 0);
  const ticketMedio        = pedidosVendidos.length > 0 ? recaudadoTienda / pedidosVendidos.length : 0;
  const activosConFecha    = hermanos.filter((h) => h.estado === 'activo' && h.fecha_alta);
  const veteranos10        = activosConFecha.filter((h) => calcAnios(h.fecha_alta) >= 10).length;
  const antiguedadMedia    = activosConFecha.length > 0
    ? Math.round(activosConFecha.reduce((s, h) => s + calcAnios(h.fecha_alta), 0) / activosConFecha.length)
    : 0;

  // Chart data
  const barData = [
    { name: 'Cuotas',     valor: recaudadoCuotas,   tipo: 'ingreso' },
    { name: 'Tienda',     valor: recaudadoTienda,   tipo: 'ingreso' },
    { name: 'Coste prod.', valor: costosProductos,  tipo: 'gasto'   },
    { name: 'Gastos',     valor: gastosTotales,     tipo: 'gasto'   },
  ];
  const pieHermanos = [
    { name: 'Activos',    value: activos    },
    { name: 'Pendientes', value: pendientes },
    { name: 'Baja',       value: bajas      },
  ].filter((d) => d.value > 0);
  const PIE_COLORS = ['#4a7c59', '#d97706', '#dc2626'];

  return (
    <div className="space-y-8">
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <SummaryCard icon={CheckCircle2} label="Tasa de cobro" value={`${tasaCobro} %`}
          sub={`${activos} de ${hermanos.length} hermanos al día`} highlight={tasaCobro >= 80} />
        <SummaryCard icon={Clock} label="Cuota pendiente" value={`${cuotaNoRecaudada.toFixed(2)} €`}
          sub={`${pendientes} pendiente${pendientes !== 1 ? 's' : ''} × ${CUOTA_ANUAL} €`} danger={cuotaNoRecaudada > 0} />
        <SummaryCard icon={ShoppingBag} label="Pedidos sin cobrar" value={`${pedidosPendientesTotal.toFixed(2)} €`}
          sub={`${pedidosPendientesCount} pedido${pedidosPendientesCount !== 1 ? 's' : ''} pendiente${pedidosPendientesCount !== 1 ? 's' : ''}`} danger={pedidosPendientesCount > 0} />
        <SummaryCard icon={Euro} label="Ticket medio tienda"
          value={ticketMedio > 0 ? `${ticketMedio.toFixed(2)} €` : '—'} sub="Por pedido cobrado" />
        <SummaryCard icon={CalendarDays} label="Antigüedad media" value={`${antiguedadMedia} años`}
          sub={`Entre ${activosConFecha.length} hermanos activos`} />
        <SummaryCard icon={CalendarDays} label="Veteranos 10+ años" value={String(veteranos10)}
          sub={`${activosConFecha.length > 0 ? Math.round((veteranos10 / activosConFecha.length) * 100) : 0} % del total activo`}
          highlight={veteranos10 > 0} />
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Desglose financiero */}
        <div className="border border-secondary/15 p-5">
          <p className="font-body text-[9px] tracking-widest uppercase text-primary/40 mb-4">Desglose financiero (€)</p>
          <div className="h-48 md:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} width={45} />
                <Tooltip
                  formatter={(v) => [`${Number(v).toFixed(2)} €`]}
                  contentStyle={{ fontSize: 11, border: '1px solid #d1d5db', borderRadius: 0 }}
                />
                <Bar dataKey="valor" radius={0} maxBarSize={48}>
                  {barData.map((entry, i) => (
                    // index key acceptable: static list
                    <Cell key={i} fill={entry.tipo === 'ingreso' ? '#4a7c59' : '#dc2626'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-2 justify-center">
            <span className="flex items-center gap-1.5 font-body text-[9px] text-primary/50">
              <span className="size-2.5 bg-[#4a7c59] inline-block" /> Ingreso
            </span>
            <span className="flex items-center gap-1.5 font-body text-[9px] text-primary/50">
              <span className="size-2.5 bg-[#dc2626] inline-block" /> Gasto
            </span>
          </div>
        </div>

        {/* Distribución de hermanos */}
        <div className="border border-secondary/15 p-5">
          <p className="font-body text-[9px] tracking-widest uppercase text-primary/40 mb-4">Distribución de hermanos</p>
          {hermanos.length === 0 ? (
            <p className="text-center font-body text-sm text-primary/30 py-16">Sin datos</p>
          ) : (
            <div className="h-48 md:h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieHermanos}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    dataKey="value"
                    labelLine={false}
                  >
                    {pieHermanos.map((_, i) => (
                      // index key acceptable: static list
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => [Number(v), 'hermanos']}
                    contentStyle={{ fontSize: 11, border: '1px solid #d1d5db', borderRadius: 0 }}
                  />
                  <Legend
                    iconType="square"
                    iconSize={9}
                    formatter={(v) => <span style={{ fontSize: 12, color: '#6b7280' }}>{v}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function AdminCuentasPage() {
  const [hermanos, setHermanos] = useState<Hermano[]>([]);
  const [pedidos, setPedidos]   = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState<'cuotas' | 'tienda' | 'gastos' | 'balance' | 'antiguedad' | 'estadisticas'>('cuotas');
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

  const recaudadoTienda = pedidos
    .filter((p) => p.estado === 'pagado' || p.estado === 'entregado')
    .reduce((acc, p) => acc + Number(p.total), 0);

  const pedidosVendidos = pedidos.filter(
    (p) => p.estado === 'pagado' || p.estado === 'entregado'
  );
  const costosProductos = pedidosVendidos.reduce((acc, p) => acc + (esPalma(p) ? Number(p.total) : Number(p.total) * COSTE_TIENDA), 0);

  const totalGastosConPalmas = gastosTotales + costosProductos;
  const totalIngresos        = recaudadoCuotas + recaudadoTienda;
  const balance              = totalIngresos - totalGastosConPalmas;

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <SectionLabel>Administración</SectionLabel>
        <h1 className="font-display text-3xl md:text-4xl text-primary mt-1">Cuentas</h1>
        <p className="font-body text-sm text-primary/50 mt-1">
          Gestión financiera de la cofradía: cuotas, tienda y gastos
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={24} className="animate-spin text-secondary" />
        </div>
      ) : (
        <>
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
              sub="Cuotas + tienda"
              highlight
            />
            <SummaryCard
              icon={TrendingDown}
              label="Gastos"
              value={`${totalGastosConPalmas.toFixed(2)} €`}
              sub={`Manuales + coste ${pedidosVendidos.length} producto${pedidosVendidos.length !== 1 ? 's' : ''}`}
              danger={totalGastosConPalmas > 0}
            />
          </div>

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
          <div className="border-b border-secondary/15 mb-6 flex gap-0 overflow-x-auto">
            <TabButton active={tab === 'cuotas'} onClick={() => setTab('cuotas')}>
              <span className="flex items-center gap-2"><CheckCircle2 size={11} /> Cuotas</span>
            </TabButton>
            <TabButton active={tab === 'tienda'} onClick={() => setTab('tienda')}>
              <span className="flex items-center gap-2"><ShoppingBag size={11} /> Ingresos tienda</span>
            </TabButton>
            <TabButton active={tab === 'gastos'} onClick={() => setTab('gastos')}>
              <span className="flex items-center gap-2"><Euro size={11} /> Gastos</span>
            </TabButton>
            <TabButton active={tab === 'balance'} onClick={() => setTab('balance')}>
              <span className="flex items-center gap-2"><BookOpen size={11} /> Balance</span>
            </TabButton>
            <TabButton active={tab === 'antiguedad'} onClick={() => setTab('antiguedad')}>
              <span className="flex items-center gap-2"><CalendarDays size={11} /> Antigüedad</span>
            </TabButton>
            <TabButton active={tab === 'estadisticas'} onClick={() => setTab('estadisticas')}>
              <span className="flex items-center gap-2"><BarChart2 size={11} /> Estadísticas</span>
            </TabButton>
          </div>

          {tab === 'cuotas'       && <CuentasHermanosTab hermanos={hermanos} />}
          {tab === 'tienda'       && <IngresostiendaTab pedidos={pedidos} />}
          {tab === 'gastos'       && <GastosTiendaTab pedidosVendidos={pedidosVendidos} />}
          {tab === 'balance'      && <BalanceTab hermanos={hermanos} pedidos={pedidos} />}
          {tab === 'antiguedad'   && <AntiguedadTab hermanos={hermanos} />}
          {tab === 'estadisticas' && <EstadisticasTab hermanos={hermanos} pedidos={pedidos} gastosTotales={gastosTotales} />}
        </>
      )}
    </div>
  );
}
