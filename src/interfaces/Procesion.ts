export type TipoPunto = 'inicio' | 'parada' | 'paso_obligado' | 'fin';

export interface RecorridoPunto {
  id: number;
  nombre: string;
  descripcion: string | null;
  latitud: number;
  longitud: number;
  orden: number;
  tipo: TipoPunto;
  activo: boolean;
}

export interface ProcesionEstado {
  id: number;
  activa: boolean;
  latitud_actual: number | null;
  longitud_actual: number | null;
  ultima_actualizacion: string | null;
  admin_id: number | null;
  anno: number;
}
