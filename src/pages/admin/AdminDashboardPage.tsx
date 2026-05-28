import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabaseClient } from '@/database/supabase/Client';
import { SectionLabel } from '@/components/landing/Helpers';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Users, CheckCircle2, Clock, Euro, MapPin, Loader2, X, ZoomIn, FileText } from 'lucide-react';
import { cn, formatEur } from '@/lib/utils';

interface StatsAdmin {
  total_hermanos: number;
  activos: number;
  pendientes_pago: number;
  recaudado_total: number;
  procesion_activa: boolean;
}

interface HermanoBautismo {
  id: number;
  nombre: string;
  apellidos: string;
  estado: string;
  foto_bautismo_url: string;
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
  const [stats, setStats]                         = useState<StatsAdmin | null>(null);
  const [loading, setLoading]                     = useState(true);
  const [fotosPendientes, setFotosPendientes]     = useState<HermanoBautismo[]>([]);
  const [fotoAmpliada, setFotoAmpliada]           = useState<HermanoBautismo | null>(null);
  const [fechaHoy]                                = useState(() => new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));

  useEffect(() => {
    Promise.all([
      supabaseClient.rpc('stats_admin'),
      supabaseClient
        .from('hermanos')
        .select('id, nombre, apellidos, estado, foto_bautismo_url')
        .eq('bautizado', true)
        .not('foto_bautismo_url', 'is', null)
        .order('fecha_alta', { ascending: false }),
    ]).then(([statsRes, fotosRes]) => {
      if (!statsRes.error && statsRes.data) setStats(statsRes.data);
      if (!fotosRes.error && fotosRes.data)  setFotosPendientes(fotosRes.data as HermanoBautismo[]);
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="mb-6 md:mb-8">
        <SectionLabel>Panel de Control</SectionLabel>
        <h1 className="font-display text-4xl text-primary mt-1">Dashboard</h1>
        <p className="font-body text-sm text-primary/50 mt-1" suppressHydrationWarning>
          {fechaHoy}
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
            <StatCard icon={Euro} label="Recaudado total" value={`${formatEur(stats?.recaudado_total ?? 0)} €`} sub="Cuotas completadas" />
            <StatCard
              icon={MapPin}
              label="GPS Procesión"
              value={stats?.procesion_activa ? 'Activo' : 'Inactivo'}
              sub={stats?.procesion_activa ? 'En marcha ahora' : 'Sin procesión activa'}
            />
          </div>

          {/* Verificación de bautismo */}
          <div className="mt-8 pt-6 border-t border-secondary/10">
            <div className="flex items-baseline gap-3 mb-4">
              <p className="font-serif text-[10px] tracking-widest uppercase text-primary/35">
                Verificación de bautismo
              </p>
              {fotosPendientes.length > 0 && (
                <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 font-body text-[9px] tracking-widest uppercase">
                  {fotosPendientes.length} pendiente{fotosPendientes.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {fotosPendientes.length === 0 ? (
              <p className="font-body text-sm text-primary/35 italic">
                No hay documentación de bautismo pendiente de revisar.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {fotosPendientes.map((h) => {
                  const esPDF = h.foto_bautismo_url.toLowerCase().endsWith('.pdf');
                  return (
                    <button
                      type="button"
                      key={h.id}
                      className="border border-secondary/15 overflow-hidden group cursor-pointer text-left w-full"
                      onClick={() => setFotoAmpliada(h)}
                    >
                      {/* Miniatura */}
                      <div className="relative aspect-[4/3] bg-muted/30 flex items-center justify-center overflow-hidden">
                        {esPDF ? (
                          <div className="flex flex-col items-center gap-1 text-primary/30">
                            <FileText size={28} />
                            <span className="font-body text-[9px] uppercase tracking-widest">PDF</span>
                          </div>
                        ) : (
                          <img
                            src={h.foto_bautismo_url}
                            alt={`Fe de bautismo de ${h.nombre}`}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <ZoomIn size={18} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>

                      {/* Info */}
                      <div className="px-2.5 py-2">
                        <p className="font-serif text-xs text-primary truncate">
                          {h.apellidos}, {h.nombre}
                        </p>
                        <span className={cn(
                          'font-body text-[9px] tracking-widest uppercase',
                          h.estado === 'activo'         ? 'text-secondary' :
                          h.estado === 'pendiente_pago' ? 'text-amber-600' : 'text-red-400'
                        )}>
                          {h.estado === 'activo' ? 'Activo' : h.estado === 'pendiente_pago' ? 'Pendiente' : 'Baja'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
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
                <Link key={href} to={href}
                  className="px-4 py-2 border border-secondary/30 font-serif text-[10px] tracking-widest uppercase
                             text-secondary hover:bg-secondary/10 transition-colors no-underline">
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Lightbox foto bautismo */}
          {fotoAmpliada && (
            <div
              role="button"
              tabIndex={0}
              aria-label="Cerrar lightbox"
              className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
              onClick={() => setFotoAmpliada(null)}
              onKeyDown={(e) => e.key === 'Escape' && setFotoAmpliada(null)}
            >
              <div
                className="relative max-w-2xl w-full bg-white"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-secondary/10">
                  <div>
                    <p className="font-serif text-sm text-primary">
                      {fotoAmpliada.apellidos}, {fotoAmpliada.nombre}
                    </p>
                    <p className="font-body text-[10px] text-primary/40 uppercase tracking-widest">
                      Fe de bautismo
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={fotoAmpliada.foto_bautismo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-body text-[9px] tracking-widest uppercase text-secondary border border-secondary/30 px-2 py-1 hover:bg-secondary/5 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Abrir original
                    </a>
                    <button
                      type="button"
                      onClick={() => setFotoAmpliada(null)}
                      className="text-primary/30 hover:text-primary transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {/* Imagen o PDF */}
                {fotoAmpliada.foto_bautismo_url.toLowerCase().endsWith('.pdf') ? (
                  <div className="flex flex-col items-center gap-3 py-12 text-primary/30">
                    <FileText size={40} />
                    <p className="font-body text-sm">Archivo PDF, usa "Abrir original" para verlo</p>
                  </div>
                ) : (
                  <img
                    src={fotoAmpliada.foto_bautismo_url}
                    alt={`Fe de bautismo de ${fotoAmpliada.nombre}`}
                    className="w-full max-h-[70vh] object-contain"
                  />
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
