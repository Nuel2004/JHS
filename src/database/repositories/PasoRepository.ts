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
