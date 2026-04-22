import { useEffect, useState } from 'react';
import { supabaseClient } from '@/database/supabase/Client';
import { SectionLabel } from '@/components/landing/Helpers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CheckCircle2, Clock, Euro, MapPin, Loader2 } from 'lucide-react';

interface StatsAdmin {
  total_hermanos: number;
  activos: number;
  pendientes_pago: number;
  recaudado_total: number;
  procesion_activa: boolean;
}

function StatCard({ icon: Icon, label, value, sub }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string;
}) {
  return (
    <Card className="border-secondary/15 rounded-none shadow-none">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <p className="font-body text-[10px] tracking-widest uppercase text-primary/40">{label}</p>
        <Icon size={14} className="text-secondary" />
      </CardHeader>
      <CardContent>
        <p className="font-display text-3xl text-primary">{value}</p>
        {sub && <p className="font-body text-[11px] text-primary/40 mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<StatsAdmin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabaseClient.rpc('stats_admin').then(({ data, error }) => {
      if (!error && data) setStats(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <SectionLabel>Panel de Control</SectionLabel>
        <h1 className="font-display text-4xl text-primary mt-1">Dashboard</h1>
        <p className="font-body text-sm text-primary/50 mt-1">
          {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={24} className="animate-spin text-secondary" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <StatCard icon={Users} label="Total hermanos" value={stats?.total_hermanos ?? 0} />
            <StatCard icon={CheckCircle2} label="Activos" value={stats?.activos ?? 0} sub="Cofrades al día" />
            <StatCard icon={Clock} label="Pendientes de pago" value={stats?.pendientes_pago ?? 0} sub="Sin activar" />
            <StatCard icon={Euro} label="Recaudado total" value={`${(stats?.recaudado_total ?? 0).toFixed(2)} €`} sub="Cuotas completadas" />
            <StatCard
              icon={MapPin}
              label="GPS Procesión"
              value={stats?.procesion_activa ? 'Activo' : 'Inactivo'}
              sub={stats?.procesion_activa ? 'En marcha ahora' : 'Sin procesión activa'}
            />
          </div>

          {/* Accesos rápidos */}
          <div className="mt-8 pt-6 border-t border-secondary/10">
            <p className="font-serif text-[10px] tracking-widest uppercase text-primary/35 mb-4">Accesos rápidos</p>
            <div className="flex flex-wrap gap-3">
              {[
                { label: 'Ver hermanos', href: '/admin/hermanos' },
                { label: 'Crear noticia', href: '/admin/noticias' },
                { label: 'Gestionar GPS', href: '/admin/gps' },
                { label: 'Ver pedidos', href: '/admin/tienda' },
              ].map(({ label, href }) => (
                <a key={href} href={href}
                  className="px-4 py-2 border border-secondary/30 font-serif text-[10px] tracking-widest uppercase
                             text-secondary hover:bg-secondary/10 transition-colors no-underline">
                  {label}
                </a>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
