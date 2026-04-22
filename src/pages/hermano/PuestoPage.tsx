import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore';
import { hermanoRepository } from '@/database/repositories';
import { Button } from '@/components/ui/button';
import { SectionLabel, GoldenDivider } from '@/components/landing/Helpers';
import { cn } from '@/lib/utils';
import { CheckCircle2, Loader2 } from 'lucide-react';

const PUESTOS = [
  { id: 'Palma Grande', label: 'Palma Grande', desc: 'Palma rizada artesanal para adultos' },
  { id: 'Palma Chica', label: 'Palma Chica', desc: 'Para niños y acompañamiento' },
  { id: 'Cruz de Guía', label: 'Cruz de Guía', desc: 'Portador de la cruz que abre el cortejo' },
  { id: 'Ciriales', label: 'Ciriales', desc: 'Portador de cirios procesionales' },
  { id: 'Estandarte', label: 'Estandarte', desc: 'Portador del estandarte de la hermandad' },
  { id: 'Costalero', label: 'Costalero', desc: 'Portador del paso bajo el faldón' },
  { id: 'Sin asignar', label: 'Sin preferencia', desc: 'La junta te asignará un puesto disponible' },
];

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

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <SectionLabel>Estación de Penitencia</SectionLabel>
      <h1 className="font-display text-4xl text-primary mt-1 mb-2">Mi puesto</h1>
      <p className="font-body text-sm text-primary/55 mb-2">
        Indica tu preferencia para la procesión. La junta directiva confirmará la asignación final.
      </p>
      <GoldenDivider className="justify-start" />

      <div className="mt-6 space-y-3">
        {PUESTOS.map((p) => (
          <button
            key={p.id}
            onClick={() => setSeleccion(p.id)}
            className={cn(
              'w-full text-left px-5 py-4 border transition-all flex items-center justify-between gap-4',
              seleccion === p.id
                ? 'border-secondary bg-secondary/5 text-primary'
                : 'border-secondary/20 hover:border-secondary/40 text-primary/70'
            )}
          >
            <div>
              <p className="font-serif text-sm">{p.label}</p>
              <p className="font-body text-[11px] text-primary/45 mt-0.5">{p.desc}</p>
            </div>
            {seleccion === p.id && <CheckCircle2 size={16} className="text-secondary shrink-0" />}
          </button>
        ))}
      </div>

      <div className="mt-8 flex gap-3">
        <Button
          onClick={handleGuardar}
          disabled={loading || !seleccion}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none font-serif text-[10px] tracking-widest uppercase px-8 py-5"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : 'Guardar preferencia'}
        </Button>
      </div>

      {hermano.preferencia_paso && (
        <p className="mt-4 font-body text-[11px] text-primary/40">
          Preferencia actual: <span className="text-secondary">{hermano.preferencia_paso}</span>
        </p>
      )}
    </div>
  );
}
