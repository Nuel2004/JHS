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
        ? {
            ...state.estado,
            latitud_actual: lat,
            longitud_actual: lng,
            ultima_actualizacion: new Date().toISOString(),
          }
        : null,
    })),
}));
