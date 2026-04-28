# GPS Tracking para tres pasos — Diseño

**Fecha:** 2026-04-28
**Proyecto:** JHS (Cofradía Jesús Hombre Salvador, Montijo)

## Objetivo

Añadir seguimiento GPS en tiempo real para tres pasos durante la procesión: **Paso de Cristo**, **Paso de la Virgen** y **Cruz de Guía**. Cada paso es controlado por un admin distinto desde su propio dispositivo móvil. El público ve los tres marcadores simultáneamente en el mapa de la web.

## Contexto

El proyecto ya tiene GPS para un único paso a través de la tabla `procesion_estado` y `SupabaseProcesionRepository`. Esta implementación sigue exactamente el mismo patrón, extendido a tres pasos independientes.

---

## 1. Base de datos

### Nueva tabla `pasos_gps`

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

Las 3 filas son fijas: nunca se insertan ni se borran, solo se actualizan. `REPLICA IDENTITY FULL` habilita Supabase Realtime en la tabla.

---

## 2. Interfaz TypeScript

**Archivo:** `src/interfaces/Paso.ts`

```typescript
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

---

## 3. Repositorio

**Archivos:**
- `src/database/repositories/PasoRepository.ts` — interfaz abstracta
- `src/database/supabase/SupabasePasoRepository.ts` — implementación
- Exportado desde `src/database/repositories/index.ts`

```typescript
interface PasoRepository {
  obtenerTodos(): Promise<{ data?: Paso[]; error?: string }>
  activar(id: number, adminId: number): Promise<{ error?: string }>
  desactivar(id: number): Promise<{ error?: string }>
  actualizarGPS(id: number, lat: number, lng: number): Promise<{ error?: string }>
  suscribirRealtime(cb: (paso: Paso) => void): () => void
}
```

`suscribirRealtime` escucha cambios en cualquier fila de `pasos_gps` (patrón idéntico a `SupabaseProcesionRepository`).

---

## 4. Estado global

Se extiende `src/stores/procesionStore.ts` con:

```typescript
pasos: Paso[]
isPasosSubscribed: boolean

setPasos: (pasos: Paso[]) => void
updatePaso: (paso: Paso) => void       // reemplaza la fila por id
setPasosSubscribed: (val: boolean) => void
```

`updatePaso` localiza el paso por `id` y lo reemplaza en el array, evitando re-renders innecesarios en los otros dos marcadores.

---

## 5. Panel Admin GPS (`AdminGPSPage.tsx`)

La página muestra 3 tarjetas, una por paso. Cada tarjeta contiene:

- Nombre y color del paso
- Estado: **activo** (con coordenadas y timestamp) o **sin señal**
- Botón **"Activar GPS"**: llama a `activar(id, adminId)` e inicia `watchPosition()` para ese paso
- Botón **"Desactivar GPS"**: llama a `desactivar(id)` y detiene el `watchPosition`
- Cada tick de `watchPosition` llama a `actualizarGPS(id, lat, lng)`

La lógica de `watchPosition` existente se parametriza por `id` de paso. Cualquier admin puede activar cualquier tarjeta; en la práctica cada uno activa la suya.

---

## 6. Relación con `procesion_estado`

La tabla `procesion_estado` **no se modifica ni se elimina**. Sigue usando su campo `activa` para mostrar u ocultar la sección GPS en la landing page. Las coordenadas GPS de `procesion_estado` dejan de usarse (pasan a `pasos_gps`). El campo `activa` de `procesion_estado` actúa como interruptor general de la sección; los campos `activa` de `pasos_gps` controlan la visibilidad de cada marcador individualmente.

---

## 7. Mapa público (`GpsSection.tsx`)

- Sustituye la suscripción a `procesion_estado` por suscripción a `pasos_gps`
- 3 marcadores Leaflet, cada uno con el color del campo `color` de la BD
- Animación de pulso en cada marcador (reutiliza el CSS existente)
- Leyenda debajo del mapa: nombre, estado ("En marcha" / "Sin señal") para cada paso
- Si `activa = false`, el marcador se oculta y la leyenda muestra "Sin señal"

---

## Flujo de datos

```
Admin (móvil) → watchPosition → actualizarGPS(id, lat, lng)
                                      ↓
                              Supabase: UPDATE pasos_gps SET latitud_actual=...
                                      ↓
                         Realtime broadcast a todos los clientes
                                      ↓
              GpsSection.suscribirRealtime → updatePaso(paso) en Zustand
                                      ↓
                         Leaflet mueve el marcador del paso correspondiente
```

---

## Archivos afectados

| Acción | Archivo |
|--------|---------|
| Crear | `src/interfaces/Paso.ts` |
| Crear | `src/database/repositories/PasoRepository.ts` |
| Crear | `src/database/supabase/SupabasePasoRepository.ts` |
| Modificar | `src/database/repositories/index.ts` |
| Modificar | `src/stores/procesionStore.ts` |
| Modificar | `src/pages/admin/AdminGPSPage.tsx` |
| Modificar | `src/components/landing/GpsSection.tsx` |
| SQL en Supabase | Crear tabla `pasos_gps` con filas iniciales y RLS |
