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
