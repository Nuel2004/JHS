# GPS Tres Pasos — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extender el sistema GPS para rastrear tres pasos simultáneamente (Paso de Cristo, Paso de la Virgen, Cruz de Guía) durante la procesión, con un panel de admin por paso y tres marcadores en tiempo real en el mapa público.

**Architecture:** Nueva tabla `pasos_gps` con 3 filas fijas (una por paso). Un nuevo repositorio `SupabasePasoRepository` sigue el patrón exacto de `SupabaseProcesionRepository`. El admin GPS page muestra 3 tarjetas independientes; GpsSection muestra 3 marcadores de colores distintos via Realtime.

**Tech Stack:** React 19 + TypeScript, Supabase (PostgreSQL + Realtime), Leaflet, Zustand, Tailwind CSS, shadcn/ui

---

## Archivos afectados

| Acción | Archivo |
|--------|---------|
| SQL en Supabase Dashboard | Crear tabla `pasos_gps` |
| Crear | `src/interfaces/Paso.ts` |
| Crear | `src/database/repositories/PasoRepository.ts` |
| Crear | `src/database/supabase/SupabasePasoRepository.ts` |
| Modificar | `src/database/repositories/index.ts` |
| Modificar | `src/stores/procesionStore.ts` |
| Reescribir | `src/pages/admin/AdminGPSPage.tsx` |
| Reescribir | `src/components/landing/GpsSection.tsx` |

---

## Task 1: SQL — Crear tabla `pasos_gps`

**Files:**
- SQL a ejecutar en: Supabase Dashboard → SQL Editor

- [ ] **Step 1: Ejecutar la migración en Supabase**

Ve a Supabase Dashboard → SQL Editor y ejecuta:

```sql
CREATE TABLE pasos_gps (
  id                   INT PRIMARY KEY,
  nombre               VARCHAR(100) NOT NULL,
  color                VARCHAR(7)   NOT NULL,
  activa               BOOLEAN      DEFAULT false,
  latitud_actual       DECIMAL(10,7),
  longitud_actual      DECIMAL(10,7),
  ultima_actualizacion TIMESTAMPTZ,
  admin_id             INT REFERENCES hermanos(id)
);

ALTER TABLE pasos_gps REPLICA IDENTITY FULL;

INSERT INTO pasos_gps (id, nombre, color) VALUES
  (1, 'Paso de Cristo',    '#ef4444'),
  (2, 'Paso de la Virgen', '#3b82f6'),
  (3, 'Cruz de Guía',      '#f59e0b');

ALTER TABLE pasos_gps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lectura publica" ON pasos_gps FOR SELECT USING (true);
CREATE POLICY "solo admins"     ON pasos_gps FOR UPDATE USING (es_admin());
```

- [ ] **Step 2: Añadir la tabla a la publicación de Realtime**

En el mismo SQL Editor, ejecuta:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE pasos_gps;
```

Esto permite que `postgres_changes` funcione (igual que `procesion_estado`).

- [ ] **Step 3: Verificar**

En Supabase Dashboard → Table Editor → `pasos_gps` confirma que hay 3 filas:
- id=1, nombre="Paso de Cristo", color="#ef4444", activa=false
- id=2, nombre="Paso de la Virgen", color="#3b82f6", activa=false
- id=3, nombre="Cruz de Guía", color="#f59e0b", activa=false

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "sql: crear tabla pasos_gps con 3 filas y RLS"
```

(No hay archivos locales que cambiar en este task — el commit documenta que la migración se aplicó)

---

## Task 2: Interfaz TypeScript `Paso`

**Files:**
- Create: `src/interfaces/Paso.ts`

- [ ] **Step 1: Crear el archivo**

```typescript
// src/interfaces/Paso.ts
export interface Paso {
  id: number;
  nombre: string;
  color: string;
  activa: boolean;
  latitud_actual: number | null;
  longitud_actual: number | null;
  ultima_actualizacion: string | null;
  admin_id: number | null;
}
```

- [ ] **Step 2: Verificar que TypeScript compila**

```bash
npx tsc --noEmit
```

Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/interfaces/Paso.ts
git commit -m "feat: interfaz Paso"
```

---

## Task 3: Interfaz del repositorio `PasoRepository`

**Files:**
- Create: `src/database/repositories/PasoRepository.ts`

- [ ] **Step 1: Crear el archivo**

```typescript
// src/database/repositories/PasoRepository.ts
import type { Paso } from '../../interfaces/Paso';

export interface PasoRepository {
  /** Devuelve los 3 pasos ordenados por id */
  obtenerTodos(): Promise<{ data?: Paso[]; error?: string }>;

  /** Activa el paso — solo admin */
  activar(id: number, adminId: number): Promise<{ error?: string }>;

  /** Desactiva el paso y borra coordenadas — solo admin */
  desactivar(id: number): Promise<{ error?: string }>;

  /** Actualiza coordenadas GPS — solo admin */
  actualizarGPS(id: number, lat: number, lng: number): Promise<{ error?: string }>;

  /** Suscribe a cambios en cualquier fila de pasos_gps */
  suscribirRealtime(onCambio: (paso: Paso) => void): () => void;
}
```

- [ ] **Step 2: Verificar compilación**

```bash
npx tsc --noEmit
```

Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/database/repositories/PasoRepository.ts
git commit -m "feat: interfaz PasoRepository"
```

---

## Task 4: Implementación Supabase `SupabasePasoRepository`

**Files:**
- Create: `src/database/supabase/SupabasePasoRepository.ts`

- [ ] **Step 1: Crear el archivo**

```typescript
// src/database/supabase/SupabasePasoRepository.ts
import { supabaseClient } from './Client';
import type { PasoRepository } from '../repositories/PasoRepository';
import type { Paso } from '../../interfaces/Paso';

export class SupabasePasoRepository implements PasoRepository {

  async obtenerTodos(): Promise<{ data?: Paso[]; error?: string }> {
    try {
      const { data, error } = await supabaseClient
        .from('pasos_gps').select('*').order('id');
      if (error) throw error;
      return { data };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  async activar(id: number, adminId: number): Promise<{ error?: string }> {
    const { error } = await supabaseClient
      .from('pasos_gps')
      .update({ activa: true, admin_id: adminId, ultima_actualizacion: new Date().toISOString() })
      .eq('id', id);
    return { error: error?.message };
  }

  async desactivar(id: number): Promise<{ error?: string }> {
    const { error } = await supabaseClient
      .from('pasos_gps')
      .update({ activa: false, latitud_actual: null, longitud_actual: null })
      .eq('id', id);
    return { error: error?.message };
  }

  async actualizarGPS(id: number, lat: number, lng: number): Promise<{ error?: string }> {
    const { error } = await supabaseClient
      .from('pasos_gps')
      .update({
        latitud_actual: lat,
        longitud_actual: lng,
        ultima_actualizacion: new Date().toISOString(),
      })
      .eq('id', id);
    return { error: error?.message };
  }

  suscribirRealtime(onCambio: (paso: Paso) => void): () => void {
    const channel = supabaseClient
      .channel('pasos-gps')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'pasos_gps' },
        (payload) => onCambio(payload.new as Paso)
      )
      .subscribe();

    return () => { supabaseClient.removeChannel(channel); };
  }
}
```

Nota: `suscribirRealtime` escucha cambios en **cualquier fila** de `pasos_gps` (sin filtro por id). El callback recibe el paso actualizado y el consumidor decide qué hacer con él.

- [ ] **Step 2: Verificar compilación**

```bash
npx tsc --noEmit
```

Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/database/supabase/SupabasePasoRepository.ts
git commit -m "feat: SupabasePasoRepository"
```

---

## Task 5: Registrar repositorio en el índice

**Files:**
- Modify: `src/database/repositories/index.ts`

Estado actual del archivo:
```typescript
import { SupabaseHermanoRepository } from '../supabase/SupabaseHermanoRepository';
import { SupabaseNoticiaRepository } from '../supabase/SupabaseNoticiaRepository';
import { SupabaseProductoRepository } from '../supabase/SupabaseProductoRepository';
import { SupabaseProcesionRepository } from '../supabase/SupabaseProcesionRepository';

export const hermanoRepository = new SupabaseHermanoRepository();
export const noticiaRepository = new SupabaseNoticiaRepository();
export const productoRepository = new SupabaseProductoRepository();
export const procesionRepository = new SupabaseProcesionRepository();

export type { RegistroDatos, Genero } from './HermanoRepository';
```

- [ ] **Step 1: Añadir import y export del pasoRepository**

El archivo final debe quedar así:

```typescript
// src/database/repositories/index.ts
import { SupabaseHermanoRepository } from '../supabase/SupabaseHermanoRepository';
import { SupabaseNoticiaRepository } from '../supabase/SupabaseNoticiaRepository';
import { SupabaseProductoRepository } from '../supabase/SupabaseProductoRepository';
import { SupabaseProcesionRepository } from '../supabase/SupabaseProcesionRepository';
import { SupabasePasoRepository } from '../supabase/SupabasePasoRepository';

// Instancias únicas — patrón Vesto
export const hermanoRepository = new SupabaseHermanoRepository();
export const noticiaRepository = new SupabaseNoticiaRepository();
export const productoRepository = new SupabaseProductoRepository();
export const procesionRepository = new SupabaseProcesionRepository();
export const pasoRepository = new SupabasePasoRepository();

// Re-exportamos tipos
export type { RegistroDatos, Genero } from './HermanoRepository';
```

- [ ] **Step 2: Verificar compilación**

```bash
npx tsc --noEmit
```

Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/database/repositories/index.ts
git commit -m "feat: registrar pasoRepository en el índice"
```

---

## Task 6: Extender `procesionStore` con estado de pasos

**Files:**
- Modify: `src/stores/procesionStore.ts`

Estado actual del archivo:
```typescript
import { create } from 'zustand';
import type { ProcesionEstado, RecorridoPunto } from '../interfaces/Procesion';

interface ProcesionState {
  estado: ProcesionEstado | null;
  recorrido: RecorridoPunto[];
  isSubscribed: boolean;

  setEstado: (estado: ProcesionEstado) => void;
  setRecorrido: (puntos: RecorridoPunto[]) => void;
  setSubscribed: (v: boolean) => void;
  updateGPS: (lat: number, lng: number) => void;
}

export const useProcesionStore = create<ProcesionState>()((set) => ({
  estado: null,
  recorrido: [],
  isSubscribed: false,

  setEstado: (estado) => set({ estado }),
  setRecorrido: (recorrido) => set({ recorrido }),
  setSubscribed: (isSubscribed) => set({ isSubscribed }),

  updateGPS: (lat, lng) =>
    set((state) => ({
      estado: state.estado
        ? { ...state.estado, latitud_actual: lat, longitud_actual: lng, ultima_actualizacion: new Date().toISOString() }
        : null,
    })),
}));
```

- [ ] **Step 1: Reemplazar el contenido del archivo**

```typescript
// src/stores/procesionStore.ts
import { create } from 'zustand';
import type { ProcesionEstado, RecorridoPunto } from '../interfaces/Procesion';
import type { Paso } from '../interfaces/Paso';

interface ProcesionState {
  estado: ProcesionEstado | null;
  recorrido: RecorridoPunto[];
  isSubscribed: boolean;
  pasos: Paso[];
  isPasosSubscribed: boolean;

  setEstado: (estado: ProcesionEstado) => void;
  setRecorrido: (puntos: RecorridoPunto[]) => void;
  setSubscribed: (v: boolean) => void;
  updateGPS: (lat: number, lng: number) => void;
  setPasos: (pasos: Paso[]) => void;
  updatePaso: (paso: Paso) => void;
  setPasosSubscribed: (v: boolean) => void;
}

export const useProcesionStore = create<ProcesionState>()((set) => ({
  estado: null,
  recorrido: [],
  isSubscribed: false,
  pasos: [],
  isPasosSubscribed: false,

  setEstado: (estado) => set({ estado }),
  setRecorrido: (recorrido) => set({ recorrido }),
  setSubscribed: (isSubscribed) => set({ isSubscribed }),

  updateGPS: (lat, lng) =>
    set((state) => ({
      estado: state.estado
        ? { ...state.estado, latitud_actual: lat, longitud_actual: lng, ultima_actualizacion: new Date().toISOString() }
        : null,
    })),

  setPasos: (pasos) => set({ pasos }),
  updatePaso: (paso) =>
    set((state) => ({
      pasos: state.pasos.map((p) => (p.id === paso.id ? paso : p)),
    })),
  setPasosSubscribed: (isPasosSubscribed) => set({ isPasosSubscribed }),
}));
```

- [ ] **Step 2: Verificar compilación**

```bash
npx tsc --noEmit
```

Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/stores/procesionStore.ts
git commit -m "feat: extender procesionStore con estado de pasos"
```

---

## Task 7: Reescribir `AdminGPSPage.tsx`

**Files:**
- Rewrite: `src/pages/admin/AdminGPSPage.tsx`

La página ahora carga los 3 pasos y renderiza un `PasoCard` por cada uno. Cada `PasoCard` gestiona su propio `watchPosition` de forma independiente.

- [ ] **Step 1: Reemplazar el contenido completo del archivo**

```typescript
// src/pages/admin/AdminGPSPage.tsx
import { useEffect, useState } from 'react';
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
  const [watchId, setWatchId] = useState<number | null>(null);
  const [gpsActivo, setGpsActivo] = useState(false);

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
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
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
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none font-serif text-[10px] tracking-widest uppercase px-4 py-4 gap-2"
          >
            {enviando && <Loader2 size={12} className="animate-spin" />}
            Activar
          </Button>
          <Button
            onClick={desactivar}
            disabled={enviando || !paso.activa}
            variant="outline"
            className="border-red-400/40 text-red-500 hover:bg-red-50 rounded-none font-serif text-[10px] tracking-widest uppercase px-4 py-4 gap-2"
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
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-none font-serif text-[10px] tracking-widest uppercase px-4 py-4 gap-2"
              >
                <Navigation size={12} />
                {gpsActivo ? 'Enviando…' : 'Activar GPS'}
              </Button>
              {gpsActivo && (
                <Button
                  onClick={detenerGPS}
                  variant="outline"
                  className="border-secondary/30 rounded-none font-serif text-[10px] tracking-widest uppercase px-4 py-4"
                >
                  Detener GPS
                </Button>
              )}
            </div>
            {gpsActivo && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
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
  const { pasos, setPasos } = useProcesionStore();
  const hermano = sessionHermano!.hermano;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    pasoRepository.obtenerTodos().then(({ data }) => {
      if (data) setPasos(data);
      setLoading(false);
    });
  }, []);

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
```

- [ ] **Step 2: Verificar compilación**

```bash
npx tsc --noEmit
```

Expected: sin errores.

- [ ] **Step 3: Arrancar dev server y verificar visualmente**

```bash
npm run dev
```

Navegar a `/admin/gps`. Verificar:
- Se ven 3 tarjetas: Paso de Cristo, Paso de la Virgen, Cruz de Guía
- Cada tarjeta muestra "Sin señal" y botón "Activar" habilitado
- Al hacer clic en "Activar" de una tarjeta, el indicador de color pulsa y aparecen los botones GPS
- "Activar GPS" inicia el watchPosition del navegador (el navegador pedirá permiso de ubicación)
- Al hacer clic en "Finalizar", la tarjeta vuelve a "Sin señal"

- [ ] **Step 4: Commit**

```bash
git add src/pages/admin/AdminGPSPage.tsx
git commit -m "feat: AdminGPSPage con 3 tarjetas GPS independientes"
```

---

## Task 8: Reescribir `GpsSection.tsx`

**Files:**
- Rewrite: `src/components/landing/GpsSection.tsx`

- [ ] **Step 1: Reemplazar el contenido completo del archivo**

```typescript
// src/components/landing/GpsSection.tsx
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { procesionRepository, pasoRepository } from "@/database/repositories";
import type { ProcesionEstado } from "@/interfaces/Procesion";
import type { Paso } from "@/interfaces/Paso";
import { SectionLabel } from "./Helpers";

// Coordenadas del recorrido en Montijo, Badajoz
const RECORRIDO = [
    { nombre: "Parroquia de San Gregorio Ostiense", lat: 38.9090075, lng: -6.6082457, tipo: "inicio" as const },
    { nombre: "C/ Sagunto",                         lat: 38.9096338, lng: -6.6089159, tipo: "parada" as const },
    { nombre: "C/ Antonio Machado",                 lat: 38.9093000, lng: -6.6100000, tipo: "parada" as const },
    { nombre: "Plaza Alfonso XIII",                 lat: 38.9090000, lng: -6.6112000, tipo: "parada" as const },
    { nombre: "C/ Arcos",                           lat: 38.9088365, lng: -6.6124696, tipo: "parada" as const },
    { nombre: "Plaza Cipriano G. Piñero",           lat: 38.9087967, lng: -6.6149455, tipo: "parada" as const },
    { nombre: "Plaza Luis Braille",                 lat: 38.9087300, lng: -6.6154500, tipo: "parada" as const },
    { nombre: "C/ Campoamor",                       lat: 38.9086619, lng: -6.6159917, tipo: "parada" as const },
    { nombre: "Plaza de España",                    lat: 38.9083789, lng: -6.6165235, tipo: "paso_obligado" as const },
    { nombre: "C/ Castelar",                        lat: 38.9089640, lng: -6.6165978, tipo: "parada" as const },
    { nombre: "Avda. Emperatriz Eugenia",           lat: 38.9095490, lng: -6.6166721, tipo: "parada" as const },
    { nombre: "Campo de la Iglesia",                lat: 38.9098481, lng: -6.6171320, tipo: "parada" as const },
    { nombre: "Parroquia de San Pedro Apóstol",     lat: 38.9099719, lng: -6.6172782, tipo: "fin" as const },
];

const ROUTE_POSITIONS: [number, number][] = RECORRIDO.map(p => [p.lat, p.lng]);
const MAP_CENTER: [number, number] = [38.9091, -6.6128];

type TipoPunto = (typeof RECORRIDO)[number]["tipo"];

function circleIcon(color: string, size: number, glowColor?: string) {
    return L.divIcon({
        className: "",
        html: `<div style="
            width:${size}px;height:${size}px;
            background:${color};border-radius:50%;
            border:2px solid white;
            box-shadow:${glowColor ? `0 0 8px ${glowColor}` : "0 1px 4px rgba(0,0,0,0.45)"}
        "></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -(size / 2 + 4)],
    });
}

const ICON_MAP: Record<TipoPunto, L.DivIcon> = {
    inicio:        circleIcon("#b45309", 14),
    fin:           circleIcon("#1e1b4b", 14),
    parada:        circleIcon("#c8a951", 9),
    paso_obligado: circleIcon("#c8a951", 12, "#c8a95180"),
};

function pasoIcon(color: string): L.DivIcon {
    return L.divIcon({
        className: "",
        html: `
            <div style="position:relative;width:28px;height:28px;display:flex;align-items:center;justify-content:center">
                <div style="position:absolute;inset:0;background:${color};border-radius:50%;opacity:0.3;animation:jhs-ping 1.4s cubic-bezier(0,0,0.2,1) infinite"></div>
                <div style="width:16px;height:16px;background:${color};border-radius:50%;border:2.5px solid white;box-shadow:0 0 10px ${color}aa"></div>
            </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14],
    });
}

export function GpsSection() {
    const [estado, setEstado] = useState<ProcesionEstado | null>(null);
    const [pasos, setPasos] = useState<Paso[]>([]);

    useEffect(() => {
        procesionRepository.obtenerEstado().then(({ data }) => {
            if (data) setEstado(data);
        });
        const unsubProcesion = procesionRepository.suscribirRealtime(setEstado);

        pasoRepository.obtenerTodos().then(({ data }) => {
            if (data) setPasos(data);
        });
        const unsubPasos = pasoRepository.suscribirRealtime((updatedPaso) => {
            setPasos((prev) => prev.map((p) => (p.id === updatedPaso.id ? updatedPaso : p)));
        });

        return () => {
            unsubProcesion();
            unsubPasos();
        };
    }, []);

    const pasosConGPS = pasos.filter(
        (p) => p.activa && p.latitud_actual != null && p.longitud_actual != null
    );
    const algunActivo = pasos.some((p) => p.activa);

    return (
        <section id="procesion" className="py-20 border-y border-secondary/20 bg-primary">
            <style>{`@keyframes jhs-ping{75%,100%{transform:scale(2.2);opacity:0}}`}</style>

            <div className="max-w-5xl mx-auto px-6 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                {/* Columna izquierda: texto */}
                <div>
                    <SectionLabel className="text-secondary [&>div]:bg-secondary">
                        Estación de Penitencia
                    </SectionLabel>
                    <h2 className="font-display text-3xl md:text-4xl text-primary-foreground mb-6 leading-tight">
                        Sigue los pasos<br />
                        <span className="text-secondary">desde cualquier lugar</span>
                    </h2>
                    <p className="font-body text-lg leading-[1.9] text-primary-foreground/80 mb-6">
                        Posición en tiempo real durante la procesión. El recorrido parte de la
                        Parroquia de San Gregorio Ostiense y finaliza en la Parroquia de San
                        Pedro Apóstol, pasando por las principales calles de Montijo.
                    </p>

                    {/* Estado general */}
                    <div className="flex items-center gap-2 mb-8">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${algunActivo ? "bg-secondary animate-pulse" : "bg-primary-foreground/25"}`} />
                        <span className="font-serif text-[10px] tracking-[0.2em] uppercase text-primary-foreground/50">
                            {algunActivo ? "Procesión en marcha" : "Procesión no iniciada"}
                        </span>
                    </div>

                    {/* Leyenda del recorrido */}
                    <div className="space-y-2.5 mb-6">
                        {[
                            { color: "#b45309", label: "Salida — San Gregorio Ostiense" },
                            { color: "#c8a951", label: "Paradas del recorrido" },
                            { color: "#1e1b4b", label: "Llegada — San Pedro Apóstol" },
                        ].map(({ color, label }) => (
                            <div key={label} className="flex items-center gap-2.5">
                                <div style={{ background: color }} className="w-2.5 h-2.5 rounded-full flex-shrink-0" />
                                <span className="font-body text-xs text-primary-foreground/50">{label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Estado de los tres pasos */}
                    {pasos.length > 0 && (
                        <div className="space-y-2.5 pt-4 border-t border-secondary/15">
                            {pasos.map((paso) => (
                                <div key={paso.id} className="flex items-center gap-2.5">
                                    <div
                                        style={{ background: paso.color }}
                                        className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${paso.activa ? "animate-pulse" : "opacity-30"}`}
                                    />
                                    <span className="font-body text-xs">
                                        <span className={paso.activa ? "text-primary-foreground/80" : "text-primary-foreground/30"}>
                                            {paso.nombre}
                                        </span>
                                        {paso.activa
                                            ? <span className="text-primary-foreground/50"> — en marcha</span>
                                            : <span className="text-primary-foreground/25"> — sin señal</span>
                                        }
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Columna derecha: mapa */}
                <div className="h-[420px] rounded-lg overflow-hidden border border-secondary/30 shadow-lg">
                    <MapContainer
                        center={MAP_CENTER}
                        zoom={15}
                        style={{ height: "100%", width: "100%" }}
                        scrollWheelZoom={false}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {/* Línea del recorrido */}
                        <Polyline
                            positions={ROUTE_POSITIONS}
                            pathOptions={{ color: "#c8a951", weight: 3, opacity: 0.65, dashArray: "8 5" }}
                        />

                        {/* Marcadores de paradas */}
                        {RECORRIDO.map((punto, i) => (
                            <Marker key={i} position={[punto.lat, punto.lng]} icon={ICON_MAP[punto.tipo]}>
                                <Popup>
                                    <span style={{ fontWeight: 600, fontSize: 13 }}>{punto.nombre}</span>
                                </Popup>
                            </Marker>
                        ))}

                        {/* Marcadores en tiempo real de los tres pasos */}
                        {pasosConGPS.map((paso) => (
                            <Marker
                                key={paso.id}
                                position={[paso.latitud_actual!, paso.longitud_actual!]}
                                icon={pasoIcon(paso.color)}
                            >
                                <Popup>
                                    <span style={{ fontWeight: 600, fontSize: 13 }}>{paso.nombre}</span>
                                    <br />
                                    <span style={{ fontSize: 11, color: "#666" }}>Posición en tiempo real</span>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
            </div>
        </section>
    );
}
```

- [ ] **Step 2: Verificar compilación**

```bash
npx tsc --noEmit
```

Expected: sin errores.

- [ ] **Step 3: Verificar visualmente en la landing page**

Con `npm run dev` corriendo, navegar a `/` y verificar:
- La sección GPS muestra "Procesión no iniciada" (todos los pasos sin señal)
- Los 3 pasos aparecen en la leyenda: Paso de Cristo, Paso de la Virgen, Cruz de Guía, todos con "sin señal"
- El mapa carga correctamente con el recorrido y los marcadores de paradas
- En otra pestaña, ir a `/admin/gps`, activar un paso y activar GPS → el marcador de ese paso aparece en el mapa de la landing en tiempo real, con el color correcto

- [ ] **Step 4: Commit final**

```bash
git add src/components/landing/GpsSection.tsx
git commit -m "feat: GpsSection con tres marcadores GPS en tiempo real"
```
