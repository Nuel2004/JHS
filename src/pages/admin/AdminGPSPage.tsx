// src/pages/admin/AdminGPSPage.tsx
import { useEffect, useRef, useState } from 'react';
import { pasoRepository } from '@/database/repositories';
import { useProcesionStore } from '@/stores/procesionStore';
import { useAuthStore } from '@/stores/authStore';
import { SectionLabel } from '@/components/landing/Helpers';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { Navigation, Loader2, Radio, Square } from 'lucide-react';
import type { Paso } from '@/interfaces/Paso';

interface PasoCardProps {
  paso: Paso;
  hermanoId: number;
}

function PasoCard({ paso, hermanoId }: PasoCardProps) {
  const { updatePaso } = useProcesionStore();
  const [enviando, setEnviando] = useState(false);
  const watchId = useRef<number | null>(null);
  const [gpsActivo, setGpsActivo] = useState(false);

  useEffect(() => {
    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, []);

  const activar = async () => {
    setEnviando(true);
    const { error } = await pasoRepository.activar(paso.id, hermanoId);
    if (error) toast.error(error);
    else {
      updatePaso({ ...paso, activa: true });
      toast.success(`${paso.nombre} activado`);
    }
    setEnviando(false);
  };

  const desactivar = async () => {
    setEnviando(true);
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
      setGpsActivo(false);
    }
    const { error } = await pasoRepository.desactivar(paso.id);
    if (error) toast.error(error);
    else {
      updatePaso({ ...paso, activa: false, latitud_actual: null, longitud_actual: null });
      toast.success(`${paso.nombre} desactivado`);
    }
    setEnviando(false);
  };

  const iniciarGPS = () => {
    if (!navigator.geolocation) { toast.error('Tu dispositivo no soporta GPS'); return; }
    const pasoId = paso.id; // capturar fuera del callback para evitar closure stale
    const id = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        await pasoRepository.actualizarGPS(pasoId, lat, lng);
      },
      (err) => toast.error(`Error GPS: ${err.message}`),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
    watchId.current = id;
    setGpsActivo(true);
    toast.success('GPS activado — enviando posición');
  };

  const detenerGPS = () => {
    if (watchId.current !== null) { navigator.geolocation.clearWatch(watchId.current); watchId.current = null; }
    setGpsActivo(false);
    toast('GPS detenido');
  };

  return (
    <Card className={`rounded-none shadow-none border ${paso.activa ? 'border-secondary/40 bg-secondary/5' : 'border-secondary/15'}`}>
      <CardContent className="pt-5 pb-5">

        {/* Cabecera */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              style={{ background: paso.color }}
              className={`w-2.5 h-2.5 rounded-full ${paso.activa ? 'animate-pulse' : 'opacity-30'}`}
            />
            <div>
              <p className="font-serif text-sm text-primary font-medium">{paso.nombre}</p>
              {paso.activa && paso.latitud_actual != null ? (
                <p className="font-body text-[10px] text-primary/40 mt-0.5">
                  {paso.latitud_actual.toFixed(5)}, {paso.longitud_actual?.toFixed(5)}
                </p>
              ) : (
                <p className="font-body text-[10px] text-primary/30 mt-0.5">Sin señal</p>
              )}
            </div>
          </div>
          <Radio size={18} className={paso.activa ? 'text-secondary' : 'text-primary/20'} />
        </div>

        {/* Activar / Desactivar */}
        <div className="flex gap-3 mb-4">
          <Button
            onClick={activar}
            disabled={enviando || paso.activa}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none font-serif text-[10px] tracking-widest uppercase p-4 gap-2"
          >
            {enviando && <Loader2 size={12} className="animate-spin" />}
            Activar
          </Button>
          <Button
            onClick={desactivar}
            disabled={enviando || !paso.activa}
            variant="outline"
            className="border-red-400/40 text-red-500 hover:bg-red-50 rounded-none font-serif text-[10px] tracking-widest uppercase p-4 gap-2"
          >
            <Square size={12} /> Finalizar
          </Button>
        </div>

        {/* Controles GPS (solo si el paso está activo) */}
        {paso.activa && (
          <div className="space-y-3 pt-3 border-t border-secondary/10">
            <div className="flex gap-3">
              <Button
                onClick={iniciarGPS}
                disabled={gpsActivo}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-none font-serif text-[10px] tracking-widest uppercase p-4 gap-2"
              >
                <Navigation size={12} />
                {gpsActivo ? 'Enviando…' : 'Activar GPS'}
              </Button>
              {gpsActivo && (
                <Button
                  onClick={detenerGPS}
                  variant="outline"
                  className="border-secondary/30 rounded-none font-serif text-[10px] tracking-widest uppercase p-4"
                >
                  Detener GPS
                </Button>
              )}
            </div>
            {gpsActivo && (
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-secondary animate-pulse" />
                <p className="font-body text-[11px] text-secondary">Transmitiendo en tiempo real</p>
              </div>
            )}
          </div>
        )}

      </CardContent>
    </Card>
  );
}

export default function AdminGPSPage() {
  const { sessionHermano } = useAuthStore();
  const { pasos, setPasos, updatePaso } = useProcesionStore();
  const hermano = sessionHermano!.hermano;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    pasoRepository.obtenerTodos().then(({ data }) => {
      if (data) setPasos(data);
      setLoading(false);
    });
    const unsub = pasoRepository.suscribirRealtime(updatePaso);
    return unsub;
  }, [setPasos, updatePaso]);

  return (
    <div className="p-8 max-w-2xl">
      <SectionLabel>Control en tiempo real</SectionLabel>
      <h1 className="font-display text-4xl text-primary mt-1 mb-6">GPS Procesión</h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={24} className="animate-spin text-secondary" />
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {pasos.map((paso) => (
              <PasoCard key={paso.id} paso={paso} hermanoId={hermano.id} />
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-secondary/10">
            <p className="font-body text-xs text-primary/35 italic">
              Cada paso es controlado por su responsable desde este panel. Activa el paso
              y luego el GPS para transmitir la posición en tiempo real.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
