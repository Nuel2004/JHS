import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore';
import { hermanoRepository } from '@/database/repositories';
import { Button } from '@/components/ui/button';
import { SectionLabel, GoldenDivider } from '@/components/landing/Helpers';
import { cn } from '@/lib/utils';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { m } from 'framer-motion';

// ── Definición de puestos con límite de huecos ──────────────────────────────
const PUESTOS: Record<string, { label: string; desc: string; max: number }> = {
  'Cruz de Guía': { label: 'Cruz de Guía',  desc: 'Abre el cortejo portando la cruz',              max: 1  },
  'Báculo':       { label: 'Báculo',         desc: 'Flanquea la cruz y el estandarte (6 en total)', max: 4  },
  'Palma Chica':  { label: 'Palma',          desc: 'Acompañamiento con palma procesional',           max: 40 },
  'Estandarte':   { label: 'Estandarte',     desc: 'Portador del estandarte de la hermandad',        max: 1  },
  'Palma Grande': { label: 'Palma Grande',   desc: 'Palma rizada artesanal, precede al paso',        max: 20 },
  'Costalero':    { label: 'Costalero',      desc: 'Portadores del paso bajo el faldón',             max: 15 },
  'Sin asignar':  { label: 'Sin preferencia',desc: 'La junta te asignará un puesto disponible',      max: Infinity },
};

// ── Esquema visual del cortejo (frente → fondo) ──────────────────────────────
type Elemento = { puesto: string; tag: string; destacado?: boolean };
type Fila =
  | { id: string; label: string; esPaso?: false; esVertical?: boolean; elementos: Elemento[] }
  | { id: string; label: string; esPaso: true; esVertical?: boolean; elementos: Elemento[] };

const FILAS: Fila[] = [
  {
    id: 'apertura',
    label: 'Apertura del cortejo',
    elementos: [
      { puesto: 'Báculo',       tag: 'Báculo'       },
      { puesto: 'Cruz de Guía', tag: 'Cruz de Guía', destacado: true },
      { puesto: 'Báculo',       tag: 'Báculo'       },
    ],
  },
  {
    id: 'palmas',
    label: 'Palmas',
    esVertical: true,
    elementos: Array(6).fill(null).map(() => ({ puesto: 'Palma Chica', tag: 'Palma' })),
  },
  {
    id: 'estandarte',
    label: 'Estandarte',
    elementos: [
      { puesto: 'Báculo',     tag: 'Báculo'    },
      { puesto: 'Estandarte', tag: 'Estandarte', destacado: true },
      { puesto: 'Báculo',     tag: 'Báculo'    },
    ],
  },
  {
    id: 'palmas-grandes',
    label: 'Palmas Grandes',
    esVertical: true,
    elementos: Array(6).fill(null).map(() => ({ puesto: 'Palma Grande', tag: 'P. Grande' })),
  },
  {
    id: 'paso',
    label: 'El Paso',
    esPaso: true,
    elementos: [{ puesto: 'Costalero', tag: 'Costalero' }],
  },
];

// Color por puesto para el esquema
const COLOR: Record<string, string> = {
  'Cruz de Guía': 'border-secondary bg-secondary/15 text-secondary',
  'Báculo':       'border-secondary/50 bg-secondary/5 text-secondary/70',
  'Palma Chica':  'border-amber-700/40 bg-amber-900/10 text-amber-400/80',
  'Estandarte':   'border-secondary bg-secondary/15 text-secondary',
  'Palma Grande': 'border-amber-600/60 bg-amber-900/20 text-amber-300/90',
  'Costalero':    'border-primary/40 bg-primary/10 text-primary/70',
};

const COLOR_SELECTED: Record<string, string> = {
  'Cruz de Guía': 'border-secondary bg-secondary/30 text-secondary ring-1 ring-secondary/60',
  'Báculo':       'border-secondary bg-secondary/20 text-secondary ring-1 ring-secondary/40',
  'Palma Chica':  'border-amber-500 bg-amber-900/25 text-amber-300 ring-1 ring-amber-500/50',
  'Estandarte':   'border-secondary bg-secondary/30 text-secondary ring-1 ring-secondary/60',
  'Palma Grande': 'border-amber-400 bg-amber-900/30 text-amber-200 ring-1 ring-amber-400/60',
  'Costalero':    'border-primary/60 bg-primary/20 text-primary ring-1 ring-primary/40',
};

// ── Componente ────────────────────────────────────────────────────────────────
export default function PuestoPage() {
  const { sessionHermano, updateHermano } = useAuthStore();
  const hermano = sessionHermano!.hermano;
  const [seleccion, setSeleccion] = useState(hermano.preferencia_paso ?? '');
  const [loading, setLoading] = useState(false);

  const handleGuardar = async () => {
    if (!seleccion) { toast.error('Selecciona una opción'); return; }
    setLoading(true);
    const { error } = await hermanoRepository.actualizarPreferencia(hermano.id, seleccion);
    if (error) { toast.error(error); }
    else {
      updateHermano({ preferencia_paso: seleccion });
      toast.success('Preferencia guardada');
    }
    setLoading(false);
  };

  const puestoSeleccionado = seleccion ? PUESTOS[seleccion] : null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <SectionLabel>Procesión</SectionLabel>
      <h1 className="font-display text-4xl text-primary mt-1 mb-2">Mi puesto</h1>
      <p className="font-body text-sm text-primary/55 mb-2">
        Selecciona tu preferencia en el esquema del cortejo. La junta directiva confirmará la asignación final.
      </p>
      <GoldenDivider className="justify-start" />

      {/* ── Esquema visual interactivo ───────────────────────────────────── */}
      <m.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-8 border border-secondary/15 p-5 space-y-1"
      >
        {/* Indicador de dirección */}
        <div className="flex items-center gap-2 mb-4">
          <span className="font-body text-[9px] tracking-[0.4em] uppercase text-secondary/60">Dirección de marcha</span>
          <div className="flex-1 h-px bg-secondary/15" />
          <span className="text-secondary/40 text-xs">↓</span>
        </div>

        {FILAS.map((fila, fi) => (
          <div key={fila.id}>
            {/* Etiqueta de sección */}
            <p className="font-body text-[9px] tracking-[0.3em] uppercase text-primary/25 mb-1 mt-3 first:mt-0">
              {fila.label}
            </p>

            {fila.esPaso ? (
              /* Bloque del Paso ───────────────────────────────────────── */
              <button
                type="button"
                onClick={() => setSeleccion('Costalero')}
                className={cn(
                  'w-full transition-all duration-200 border-2 px-4 py-5 flex flex-col items-center gap-2',
                  seleccion === 'Costalero'
                    ? 'border-primary/60 bg-primary/20 ring-1 ring-primary/40'
                    : 'border-primary/20 hover:border-primary/40 bg-primary/5'
                )}
              >
                <span className="font-body text-[9px] tracking-[0.35em] uppercase text-primary/40">El Paso</span>
                <div className="w-full h-10 border border-secondary/20 bg-secondary/5 flex items-center justify-center">
                  <span className="font-display text-secondary/60 text-sm tracking-widest">✦  JHS  ✦</span>
                </div>
                <div className="flex gap-2 flex-wrap justify-center">
                  {Array(6).fill(null).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'w-6 h-6 border text-[9px] flex items-center justify-center font-body',
                        seleccion === 'Costalero'
                          ? 'border-primary/60 bg-primary/25 text-primary/70'
                          : 'border-primary/20 bg-primary/10 text-primary/30'
                      )}
                    >
                      C
                    </div>
                  ))}
                </div>
                <span className="font-body text-[10px] text-primary/35">Costalero · máx. {PUESTOS['Costalero'].max}</span>
              </button>

            ) : fila.esVertical ? (
              /* Fila de palmas — 2 columnas, mismo alto que báculos ──────── */
              <div className="grid grid-cols-2 gap-1 w-fit mx-auto">
                {fila.elementos.map((el, ei) => {
                  const isSelected = seleccion === el.puesto;
                  return (
                    <button
                      key={`${fila.id}-${ei}`}
                      type="button"
                      onClick={() => setSeleccion(el.puesto)}
                      className={cn(
                        'transition-all duration-200 border flex items-center justify-center',
                        'w-10 h-10 sm:w-9 sm:h-9',
                        isSelected
                          ? (COLOR_SELECTED[el.puesto] ?? 'border-secondary bg-secondary/20 text-secondary ring-1 ring-secondary/40')
                          : (COLOR[el.puesto] ?? 'border-secondary/20 text-primary/60')
                      )}
                    >
                      <span className="font-body text-[7px] tracking-[0.05em] uppercase">
                        {el.tag}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Fila estándar ─────────────────────────────────────────── */
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {fila.elementos.map((el, ei) => {
                  const isSelected = seleccion === el.puesto;
                  return (
                    <button
                      key={`${fila.id}-${ei}`}
                      type="button"
                      onClick={() => setSeleccion(el.puesto)}
                      className={cn(
                        'transition-all duration-200 border px-3 py-2 text-center min-w-[4.5rem]',
                        el.destacado ? 'px-5 py-3' : '',
                        isSelected
                          ? (COLOR_SELECTED[el.puesto] ?? 'border-secondary bg-secondary/20 text-secondary ring-1 ring-secondary/40')
                          : (COLOR[el.puesto] ?? 'border-secondary/20 text-primary/60')
                      )}
                    >
                      <span className={cn(
                        'block font-body leading-tight',
                        el.destacado ? 'text-[10px]' : 'text-[9px]',
                        'tracking-[0.15em] uppercase'
                      )}>
                        {el.tag}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Separador entre secciones */}
            {fi < FILAS.length - 1 && (
              <div className="flex justify-center mt-2">
                <div className="w-px h-4 bg-secondary/15" />
              </div>
            )}
          </div>
        ))}
      </m.div>

      {/* ── Detalle del puesto seleccionado ─────────────────────────────── */}
      {puestoSeleccionado && (
        <m.div
          key={seleccion}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-4 border border-secondary/25 bg-secondary/4 px-5 py-4 flex items-start justify-between gap-4"
        >
          <div>
            <p className="font-serif text-secondary text-sm">{puestoSeleccionado.label}</p>
            <p className="font-body text-[11px] text-primary/50 mt-0.5">{puestoSeleccionado.desc}</p>
          </div>
          <div className="text-right shrink-0">
            {puestoSeleccionado.max !== Infinity && (
              <p className="font-body text-[10px] text-primary/35">
                Huecos: <span className="text-secondary/70">{puestoSeleccionado.max}</span>
              </p>
            )}
            <CheckCircle2 size={16} className="text-secondary mt-1 ml-auto" />
          </div>
        </m.div>
      )}

      {/* ── Lista alternativa para puestos sin icono en el esquema ───────── */}
      <div className="mt-6 border-t border-secondary/10 pt-6">
        <p className="font-body text-[9px] tracking-[0.35em] uppercase text-primary/30 mb-3">
          O selecciona de la lista
        </p>
        <div className="space-y-2">
          {Object.entries(PUESTOS).map(([id, p]) => (
            <button
              key={id}
              type="button"
              onClick={() => setSeleccion(id)}
              className={cn(
                'w-full text-left px-5 py-3 border transition-all flex items-center justify-between gap-4',
                seleccion === id
                  ? 'border-secondary bg-secondary/5 text-primary'
                  : 'border-secondary/15 hover:border-secondary/35 text-primary/60'
              )}
            >
              <div>
                <p className="font-serif text-sm">{p.label}</p>
                <p className="font-body text-[10px] text-primary/40 mt-0.5">
                  {p.desc}
                  {p.max !== Infinity && (
                    <span className="ml-2 text-secondary/60">· máx. {p.max}</span>
                  )}
                </p>
              </div>
              {seleccion === id && <CheckCircle2 size={15} className="text-secondary shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      {/* ── Guardar ──────────────────────────────────────────────────────── */}
      <div className="mt-8 flex items-center gap-4">
        <Button
          onClick={handleGuardar}
          disabled={loading || !seleccion}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none font-serif text-[10px] tracking-widest uppercase px-8 py-5"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : 'Guardar preferencia'}
        </Button>

        {hermano.preferencia_paso && (
          <p className="font-body text-[11px] text-primary/35">
            Actual: <span className="text-secondary">{PUESTOS[hermano.preferencia_paso]?.label ?? hermano.preferencia_paso}</span>
          </p>
        )}
      </div>
    </div>
  );
}