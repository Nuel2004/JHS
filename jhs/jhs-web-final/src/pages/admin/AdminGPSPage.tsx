import { useEffect, useState, useCallback } from 'react';
import { procesionRepository } from '@/database/repositories';
import { useProcesionStore } from '@/stores/procesionStore';
import { useAuthStore } from '@/stores/authStore';
import { SectionLabel } from '@/components/landing/Helpers';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import { MapPin, Play, Square, Navigation, Loader2, Radio } from 'lucide-react';

export default function AdminGPSPage() {
  const { sessionHermano } = useAuthStore();
  const { estado, setEstado, updateGPS } = useProcesionStore();
  const hermano = sessionHermano!.hermano;

  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [gpsActivo, setGpsActivo] = useState(false);

  // Cargar estado inicial
  useEffect(() => {
    procesionRepository.obtenerEstado().then(({ data }) => {
      if (data) setEstado(data);
      setLoading(false);
    });
  }, []);

  const activarProcesion = async () => {
    setEnviando(true);
    const { error } = await procesionRepository.activar(hermano.id);
    if (error) toast.error(error);
    else {
      setEstado({ ...estado!, activa: true });
      toast.success('Procesión activada');
    }
    setEnviando(false);
  };

  const desactivarProcesion = async () => {
    setEnviando(true);
    // Detener GPS del navegador si está activo
    if (watchId !== null) { navigator.geolocation.clearWatch(watchId); setWatchId(null); setGpsActivo(false); }
    const { error } = await procesionRepository.desactivar();
    if (error) toast.error(error);
    else {
      setEstado({ ...estado!, activa: false, latitud_actual: null, longitud_actual: null });
      toast.success('Procesión desactivada');
    }
    setEnviando(false);
  };

  const iniciarGPS = () => {
    if (!navigator.geolocation) { toast.error('Tu dispositivo no soporta GPS'); return; }
    const id = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        updateGPS(lat, lng);
        await procesionRepository.actualizarGPS(lat, lng);
      },
      (err) => toast.error(`Error GPS: ${err.message}`),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
    setWatchId(id);
    setGpsActivo(true);
    toast.success('GPS activado — enviando posición');
  };

  const detenerGPS = () => {
    if (watchId !== null) { navigator.geolocation.clearWatch(watchId); setWatchId(null); }
    setGpsActivo(false);
    toast('GPS detenido');
  };

  return (
    <div className="p-8 max-w-2xl">
      <SectionLabel>Control en tiempo real</SectionLabel>
      <h1 className="font-display text-4xl text-primary mt-1 mb-6">GPS Procesión</h1>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-secondary" /></div>
      ) : (
        <>
          {/* Estado actual */}
          <Card className={`rounded-none shadow-none border mb-6 ${estado?.activa ? 'border-secondary/40 bg-secondary/5' : 'border-secondary/15'}`}>
            <CardContent className="pt-5 pb-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${estado?.activa ? 'bg-secondary animate-pulse' : 'bg-primary/20'}`} />
                <div>
                  <p className="font-serif text-sm text-primary font-medium">
                    {estado?.activa ? 'Procesión en marcha' : 'Procesión inactiva'}
                  </p>
                  {estado?.activa && estado.latitud_actual && (
                    <p className="font-body text-[10px] text-primary/40 mt-0.5">
                      {estado.latitud_actual.toFixed(5)}, {estado.longitud_actual?.toFixed(5)}
                    </p>
                  )}
                </div>
              </div>
              <Radio size={18} className={estado?.activa ? 'text-secondary' : 'text-primary/20'} />
            </CardContent>
          </Card>

          {/* Controles procesión */}
          <div className="space-y-4">
            <p className="font-serif text-[10px] tracking-widest uppercase text-primary/35">Control de procesión</p>
            <div className="flex gap-3">
              <Button onClick={activarProcesion} disabled={enviando || !!estado?.activa}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none font-serif text-[10px] tracking-widest uppercase px-6 py-5 gap-2">
                {enviando ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
                Activar procesión
              </Button>
              <Button onClick={desactivarProcesion} disabled={enviando || !estado?.activa} variant="outline"
                className="border-red-400/40 text-red-500 hover:bg-red-50 rounded-none font-serif text-[10px] tracking-widest uppercase px-6 py-5 gap-2">
                <Square size={12} /> Finalizar
              </Button>
            </div>
          </div>

          {/* Controles GPS */}
          {estado?.activa && (
            <div className="mt-6 space-y-4 pt-6 border-t border-secondary/10">
              <p className="font-serif text-[10px] tracking-widest uppercase text-primary/35">
                GPS de tu dispositivo
              </p>
              <p className="font-body text-xs text-primary/50">
                Activa el GPS para enviar tu posición en tiempo real. Mantén esta pantalla abierta.
              </p>
              <div className="flex gap-3">
                <Button onClick={iniciarGPS} disabled={gpsActivo}
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-none font-serif text-[10px] tracking-widest uppercase px-6 py-5 gap-2">
                  <Navigation size={12} /> {gpsActivo ? 'Enviando posición…' : 'Activar GPS'}
                </Button>
                {gpsActivo && (
                  <Button onClick={detenerGPS} variant="outline"
                    className="border-secondary/30 rounded-none font-serif text-[10px] tracking-widest uppercase px-6 py-5">
                    Detener GPS
                  </Button>
                )}
              </div>
              {gpsActivo && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                  <p className="font-body text-[11px] text-secondary">Transmitiendo ubicación en tiempo real</p>
                </div>
              )}
            </div>
          )}

          {/* Info */}
          <div className="mt-8 pt-6 border-t border-secondary/10">
            <p className="font-body text-xs text-primary/35 italic">
              Al activar la procesión, los usuarios de la web podrán ver el paso en tiempo real
              en el mapa de la sección GPS. Solo el administrador activo puede actualizar la posición.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
