import { useAuthStore } from '@/stores/authStore';
import { Link } from 'react-router-dom';
import { GoldenDivider, SectionLabel } from '@/components/landing/Helpers';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, AlertCircle, MapPin, ShoppingBag, Cross, ChevronRight, User } from 'lucide-react';
import { cn } from '@/lib/utils';

function EstadoBadge({ estado, esCofrade }: { estado: string; esCofrade: boolean }) {
  if (estado === 'activo' && esCofrade) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] tracking-widest uppercase font-body border border-secondary/40 text-secondary bg-secondary/5">
        <CheckCircle2 size={11} /> Hermano Cofrade Activo
      </span>
    );
  }
  if (estado === 'pendiente_pago') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] tracking-widest uppercase font-body border border-amber-400/50 text-amber-600 bg-amber-50">
        <Clock size={11} /> Pendiente de pago
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] tracking-widest uppercase font-body border border-red-400/40 text-red-500 bg-red-50">
      <AlertCircle size={11} /> {estado}
    </span>
  );
}

const ACCESOS = [
  {
    to: '/mi/puesto',
    icon: Cross,
    title: 'Mi puesto en procesión',
    desc: 'Elige qué portarás en la estación de penitencia',
    cofrade: true,
  },
  {
    to: '/mi/cuotas',
    icon: CheckCircle2,
    title: 'Mis cuotas',
    desc: 'Estado de tu cuota anual y métodos de pago',
    cofrade: false,
  },
  {
    to: '/tienda',
    icon: ShoppingBag,
    title: 'Tienda',
    desc: 'Palmas, medallas y materiales oficiales',
    cofrade: false,
  },
  {
    to: '/procesion',
    icon: MapPin,
    title: 'GPS en vivo',
    desc: 'Sigue el paso en tiempo real durante la procesión',
    cofrade: true,
  },
];

export default function DashboardPage() {
  const { sessionHermano, isCofrade } = useAuthStore();
  const hermano = sessionHermano!.hermano;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 md:py-14">

      {/* Cabecera */}
      <div className="mb-8 md:mb-10">
        <SectionLabel>Mi área</SectionLabel>
        <h1 className="font-display text-3xl md:text-4xl text-primary mt-1">
          Bienvenido, {hermano.nombre}
        </h1>
        <p className="font-body text-sm text-primary/45 mt-1">{hermano.apellidos}</p>
        <div className="mt-4">
          <EstadoBadge estado={hermano.estado} esCofrade={hermano.es_cofrade} />
        </div>
        <GoldenDivider className="justify-start mt-6" />
      </div>

      {/* Aviso cuota pendiente */}
      {hermano.estado === 'pendiente_pago' && (
        <div className="mb-8 border border-amber-400/30 bg-amber-50/60 p-4 md:p-5 flex items-start gap-4">
          <AlertCircle className="text-amber-500 mt-0.5 shrink-0" size={18} />
          <div className="flex-1 min-w-0">
            <p className="font-serif text-sm text-primary font-medium">Cuota pendiente</p>
            <p className="font-body text-xs text-primary/60 mt-0.5 leading-relaxed">
              Abona tu cuota anual de <strong>10 €</strong> para activarte como Hermano Cofrade
              y desbloquear todas las funciones.
            </p>
            <Link to="/mi/cuotas">
              <Button
                size="sm"
                className="mt-3 bg-primary text-primary-foreground rounded-none font-body text-[10px] tracking-widest uppercase hover:bg-primary/90"
              >
                Pagar cuota
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Grid de accesos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        {ACCESOS.map(({ to, icon: Icon, title, desc, cofrade }) => {
          const bloqueado = cofrade && !isCofrade;
          return (
            <Link
              key={to}
              to={bloqueado ? '#' : to}
              className={cn('no-underline group block', bloqueado && 'pointer-events-none opacity-35')}
            >
              <div className="border border-secondary/15 p-5 h-full flex items-center gap-4 group-hover:border-secondary/40 group-hover:bg-secondary/4 transition-all">
                {/* Icono */}
                <div className="w-10 h-10 shrink-0 flex items-center justify-center border border-secondary/25 text-secondary group-hover:bg-secondary/8 transition-colors">
                  <Icon size={16} />
                </div>
                {/* Texto */}
                <div className="flex-1 min-w-0">
                  <p className="font-display text-sm text-primary">{title}</p>
                  <p className="font-body text-[11px] text-primary/45 mt-0.5 leading-snug">{desc}</p>
                </div>
                {/* Flecha */}
                <ChevronRight size={14} className="shrink-0 text-primary/20 group-hover:text-secondary transition-colors" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Datos personales */}
      <div className="mt-10 md:mt-12 pt-7 border-t border-secondary/10">
        <div className="flex items-center gap-2 mb-5">
          <User size={12} className="text-primary/30" />
          <p className="font-body text-[10px] tracking-widest uppercase text-primary/35">Tus datos</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: 'Email', value: hermano.email },
            { label: 'Teléfono', value: hermano.telefono },
            { label: 'Alta', value: new Date(hermano.fecha_alta).toLocaleDateString('es-ES') },
            { label: 'Dirección', value: hermano.direccion },
            { label: 'Bautizado', value: hermano.bautizado ? 'Sí' : 'No' },
            { label: 'Cofrade', value: hermano.es_cofrade ? 'Sí' : 'No' },
          ].map(({ label, value }) => (
            <div key={label} className="min-w-0">
              <span className="block font-body text-[9px] uppercase tracking-widest text-primary/30 mb-0.5">{label}</span>
              <span className="font-body text-xs text-primary/60 truncate block">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
