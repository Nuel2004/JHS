import { useAuthStore } from '@/stores/authStore';
import { SectionLabel, GoldenDivider } from '@/components/landing/Helpers';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Clock, CreditCard, Home } from 'lucide-react';

export default function CuotasPage() {
  const { sessionHermano } = useAuthStore();
  const hermano = sessionHermano!.hermano;
  const activo = hermano.estado === 'activo';
  const anioActual = new Date().getFullYear();

  const handlePagarStripe = () => {
    // TODO: redirigir a Stripe Checkout con la session_url
    alert('Integración Stripe pendiente — conecta tu clave en el backend');
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <SectionLabel>Gestión económica</SectionLabel>
      <h1 className="font-display text-4xl text-primary mt-1 mb-2">Mis cuotas</h1>
      <p className="font-body text-sm text-primary/55 mb-2">
        La cuota anual de hermandad es de <span className="text-primary font-medium">10 €</span>.
        Su pago te activa como Hermano Cofrade durante todo el año litúrgico.
      </p>
      <GoldenDivider className="justify-start" />

      {/* Estado cuota actual */}
      <Card className={`mt-8 rounded-none shadow-none border ${activo ? 'border-secondary/30 bg-secondary/5' : 'border-amber-400/30 bg-amber-50/50'}`}>
        <CardContent className="pt-5 pb-5 flex items-center gap-4">
          {activo
            ? <CheckCircle2 className="text-secondary shrink-0" size={22} />
            : <Clock className="text-amber-500 shrink-0" size={22} />
          }
          <div>
            <p className="font-serif text-sm text-primary font-medium">
              {activo ? `Cuota ${anioActual} — Pagada` : `Cuota ${anioActual} — Pendiente`}
            </p>
            <p className="font-body text-xs text-primary/50 mt-0.5">
              {activo
                ? 'Estás activo como Hermano Cofrade. ¡Gracias!'
                : 'Abona tu cuota para activarte y participar en la procesión.'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Métodos de pago */}
      {!activo && (
        <div className="mt-6 space-y-3">
          <p className="font-serif text-[10px] tracking-widest uppercase text-primary/40">Cómo pagar</p>

          <button
            onClick={handlePagarStripe}
            className="w-full text-left px-5 py-4 border border-secondary/20 hover:border-secondary/50
                       hover:bg-secondary/5 transition-all flex items-center gap-4"
          >
            <CreditCard size={18} className="text-secondary shrink-0" />
            <div>
              <p className="font-serif text-sm text-primary">Pago online con tarjeta</p>
              <p className="font-body text-[11px] text-primary/45">Procesado de forma segura mediante Stripe</p>
            </div>
          </button>

          <button className="w-full text-left px-5 py-4 border border-secondary/20 hover:border-secondary/50
                             hover:bg-secondary/5 transition-all flex items-center gap-4">
            <Home size={18} className="text-secondary shrink-0" />
            <div>
              <p className="font-serif text-sm text-primary">Pago en domicilio</p>
              <p className="font-body text-[11px] text-primary/45">Un representante de la hermandad pasará a cobrarte</p>
            </div>
          </button>
        </div>
      )}

      {/* Info adicional */}
      <div className="mt-10 pt-6 border-t border-secondary/10">
        <p className="font-serif text-[10px] tracking-widest uppercase text-primary/30 mb-3">Información</p>
        <ul className="font-body text-xs text-primary/55 space-y-2 list-none p-0">
          <li>— La cuota anual es de 10 € por hermano</li>
          <li>— El pago activa tu cuenta como Hermano Cofrade</li>
          <li>— Puedes elegir tu puesto en la procesión una vez activado</li>
          <li>— Para dudas: <a href="mailto:hermandad@jhsmontijo.es" className="text-secondary">hermandad@jhsmontijo.es</a></li>
        </ul>
      </div>
    </div>
  );
}
