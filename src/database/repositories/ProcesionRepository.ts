import type { ProcesionEstado, RecorridoPunto } from '../../interfaces/Procesion';

export interface ProcesionRepository {
  /** Obtiene el estado actual de la procesión */
  obtenerEstado(): Promise<{ data?: ProcesionEstado; error?: string }>;

  /** Obtiene los puntos del recorrido activos */
  obtenerRecorrido(): Promise<{ data?: RecorridoPunto[]; error?: string }>;

  /** Activa la procesión GPS — solo admin */
  activar(adminId: number): Promise<{ error?: string }>;

  /** Desactiva la procesión — solo admin */
  desactivar(): Promise<{ error?: string }>;

  /** Actualiza coordenadas GPS — solo admin */
  actualizarGPS(lat: number, lng: number): Promise<{ error?: string }>;

  /** Suscribe a cambios en tiempo real de procesion_estado */
  suscribirRealtime(
    onCambio: (estado: ProcesionEstado) => void
  ): () => void; // devuelve función de limpieza
}
