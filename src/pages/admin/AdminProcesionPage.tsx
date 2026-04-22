import { useEffect, useState } from 'react';
import { hermanoRepository } from '@/database/repositories';
import type { Hermano } from '@/interfaces/Hermano';
import { SectionLabel } from '@/components/landing/Helpers';
import { toast } from 'react-hot-toast';
import { Loader2, Users, CheckCircle2, AlertCircle, ChevronDown, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Constantes ────────────────────────────────────────────────────────────────

export const PUESTOS = [
  { id: 'Cruz de Guía',  label: 'Cruz de Guía',  desc: 'Abre el cortejo',                  color: 'text-amber-700  border-amber-400/40  bg-amber-50'  },
  { id: 'Estandarte',    label: 'Estandarte',     desc: 'Portador del estandarte',          color: 'text-primary    border-primary/30    bg-primary/5' },
  { id: 'Ciriales',      label: 'Ciriales',       desc: 'Portador de cirios procesionales', color: 'text-yellow-700 border-yellow-400/40 bg-yellow-50' },
  { id: 'Palma Grande',  label: 'Palma Grande',   desc: 'Palma rizada artesanal',           color: 'text-secondary  border-secondary/40  bg-secondary/5'},
  { id: 'Palma Chica',   label: 'Palma Chica',    desc: 'Para niños y acompañamiento',      color: 'text-secondary  border-secondary/30  bg-secondary/5'},
  { id: 'Costalero',     label: 'Costalero',      desc: 'Portador del paso',                color: 'text-red-700    border-red-400/40    bg-red-50'    },
  { id: 'Sin asignar',   label: 'Sin preferencia',desc: 'Pendiente de asignación',          color: 'text-primary/40 border-secondary/15  bg-muted/40'  },
];

// ── Sub-componente: selector de puesto inline ─────────────────────────────────

interface SelectorPuestoProps {
  hermanoId: number;
  actual: string | null;
  onCambiado: (hermanoId: number, nuevo: string) => void;
}

function SelectorPuesto({ hermanoId, actual, onCambiado }: SelectorPuestoProps) {
  const [abierto, setAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const cambiar = async (nuevoPuesto: string) => {
    setAbierto(false);
    if (nuevoPuesto === actual) return;
    setGuardando(true);
    const { error } = await hermanoRepository.actualizarPreferencia(hermanoId, nuevoPuesto);
    if (error) toast.error(error);
    else {
      onCambiado(hermanoId, nuevoPuesto);
      toast.success('Puesto actualizado');
    }
    setGuardando(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setAbierto(!abierto)}
        disabled={guardando}
        className="flex items-center gap-1.5 px-2.5 py-1 border border-secondary/20 text-[9px] tracking-widest uppercase font-body text-primary/50 hover:border-secondary/50 hover:text-secondary transition-colors disabled:opacity-40"
      >
        {guardando
          ? <Loader2 size={10} className="animate-spin" />
          : <><RotateCcw size={9} />Reasignar<ChevronDown size={9} /></>
        }
      </button>

      {abierto && (
        <>
          {/* Overlay para cerrar */}
          <div className="fixed inset-0 z-10" onClick={() => setAbierto(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 bg-background border border-secondary/20 shadow-lg min-w-[160px] py-1">
            {PUESTOS.map((p) => (
              <button
                key={p.id}
                onClick={() => cambiar(p.id)}
                className={cn(
                  'w-full text-left px-3 py-2 font-body text-[10px] tracking-widest uppercase transition-colors hover:bg-muted/40',
                  p.id === actual ? 'text-secondary' : 'text-primary/60'
                )}
              >
                {p.id === actual && '✓ '}{p.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Sub-componente: fila de hermano ───────────────────────────────────────────

function FilaHermano({ h, onCambiado }: { h: Hermano; onCambiado: (id: number, puesto: string) => void }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/20 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="font-serif text-sm text-primary truncate">{h.apellidos}, {h.nombre}</p>
        <p className="font-body text-[10px] text-primary/35 truncate">{h.email}</p>
      </div>
      <SelectorPuesto
        hermanoId={h.id}
        actual={h.preferencia_paso}
        onCambiado={onCambiado}
      />
    </div>
  );
}

// ── Página principal ─────────────────────────────────────────────────────────

export default function AdminProcesionPage() {
  const [hermanos, setHermanos] = useState<Hermano[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hermanoRepository.obtenerTodos().then(({ data }) => {
      // Solo cofrades activos participan en la procesión
      const cofrades = (data ?? []).filter((h) => h.es_cofrade && h.estado === 'activo');
      setHermanos(cofrades);
      setLoading(false);
    });
  }, []);

  const onCambiado = (hermanoId: number, nuevoPuesto: string) => {
    setHermanos((prev) =>
      prev.map((h) => h.id === hermanoId ? { ...h, preferencia_paso: nuevoPuesto } : h)
    );
  };

  // Agrupar por puesto
  const porPuesto = PUESTOS.map((p) => ({
    ...p,
    hermanos: hermanos.filter((h) =>
      p.id === 'Sin asignar'
        ? !h.preferencia_paso || h.preferencia_paso === 'Sin asignar'
        : h.preferencia_paso === p.id
    ),
  }));

  const totalAsignados = hermanos.filter(
    (h) => h.preferencia_paso && h.preferencia_paso !== 'Sin asignar'
  ).length;
  const sinPreferencia = hermanos.length - totalAsignados;

  return (
    <div className="p-4 md:p-8">
      {/* Cabecera */}
      <div className="mb-8">
        <SectionLabel>Estación de Penitencia</SectionLabel>
        <h1 className="font-display text-3xl md:text-4xl text-primary mt-1">Gestión de puestos</h1>
        <p className="font-body text-sm text-primary/50 mt-1">
          Asigna y gestiona las posiciones de cada cofrade en la procesión
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 size={24} className="animate-spin text-secondary" />
        </div>
      ) : (
        <>
          {/* Tarjetas resumen */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
            <div className="border border-secondary/15 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-body text-[9px] tracking-widest uppercase text-primary/40">Total cofrades</p>
                <Users size={13} className="text-primary/25" />
              </div>
              <p className="font-display text-3xl text-primary">{hermanos.length}</p>
            </div>
            <div className="border border-secondary/40 bg-secondary/5 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-body text-[9px] tracking-widest uppercase text-primary/40">Asignados</p>
                <CheckCircle2 size={13} className="text-secondary" />
              </div>
              <p className="font-display text-3xl text-secondary">{totalAsignados}</p>
            </div>
            <div className={cn('border p-4 col-span-2 md:col-span-1', sinPreferencia > 0 ? 'border-amber-400/30 bg-amber-50/50' : 'border-secondary/15')}>
              <div className="flex items-center justify-between mb-2">
                <p className="font-body text-[9px] tracking-widest uppercase text-primary/40">Sin preferencia</p>
                <AlertCircle size={13} className={sinPreferencia > 0 ? 'text-amber-500' : 'text-primary/25'} />
              </div>
              <p className={cn('font-display text-3xl', sinPreferencia > 0 ? 'text-amber-600' : 'text-primary')}>
                {sinPreferencia}
              </p>
            </div>
          </div>

          {/* Grid de puestos */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {porPuesto.map((p) => (
              <div key={p.id} className="border border-secondary/10 flex flex-col">
                {/* Cabecera del puesto */}
                <div className="px-4 py-3 border-b border-secondary/10 flex items-center justify-between bg-muted/20">
                  <div>
                    <p className="font-serif text-sm text-primary">{p.label}</p>
                    <p className="font-body text-[10px] text-primary/40 mt-0.5">{p.desc}</p>
                  </div>
                  <span className={cn('ml-2 shrink-0 px-2 py-0.5 border text-[11px] font-display', p.color)}>
                    {p.hermanos.length}
                  </span>
                </div>

                {/* Lista de hermanos */}
                <div className="flex-1 divide-y divide-secondary/8">
                  {p.hermanos.length === 0 ? (
                    <p className="px-4 py-4 font-body text-[11px] text-primary/25 italic">
                      Ningún cofrade asignado
                    </p>
                  ) : (
                    p.hermanos.map((h) => (
                      <FilaHermano key={h.id} h={h} onCambiado={onCambiado} />
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>

          {hermanos.length === 0 && (
            <p className="text-center font-body text-sm text-primary/35 py-16 border border-dashed border-secondary/20">
              No hay hermanos cofrades activos registrados.
            </p>
          )}
        </>
      )}
    </div>
  );
}
