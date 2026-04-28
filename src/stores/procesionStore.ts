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
