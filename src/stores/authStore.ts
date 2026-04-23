import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { SessionHermano, Hermano } from '../interfaces/Hermano';

const AUTH_KEY = 'jhs-auth-v1';
export const REMEMBER_KEY = 'jhs-remember-me';

// Escribe en localStorage si "recordar sesión" está activo, en sessionStorage si no.
const adaptiveStorage = {
  getItem: (name: string): string | null => {
    const remembered = localStorage.getItem(REMEMBER_KEY) === 'true';
    return remembered ? localStorage.getItem(name) : sessionStorage.getItem(name);
  },
  setItem: (name: string, value: string): void => {
    const remembered = localStorage.getItem(REMEMBER_KEY) === 'true';
    if (remembered) {
      localStorage.setItem(name, value);
      sessionStorage.removeItem(name);
    } else {
      sessionStorage.setItem(name, value);
      localStorage.removeItem(name);
    }
  },
  removeItem: (name: string): void => {
    localStorage.removeItem(name);
    sessionStorage.removeItem(name);
  },
};

interface AuthState {
  sessionHermano: SessionHermano | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCofrade: boolean;

  setSession: (session: SessionHermano) => void;
  clearSession: () => void;
  updateHermano: (updates: Partial<Hermano>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      sessionHermano: null,
      isAuthenticated: false,
      isAdmin: false,
      isCofrade: false,

      setSession: (session) =>
        set({
          sessionHermano: session,
          isAuthenticated: true,
          isAdmin: session.hermano.rol === 'admin',
          isCofrade: session.hermano.es_cofrade && session.hermano.estado === 'activo',
        }),

      clearSession: () => {
        // Borra el flag y ambos storages antes de resetear el estado
        localStorage.removeItem(REMEMBER_KEY);
        localStorage.removeItem(AUTH_KEY);
        sessionStorage.removeItem(AUTH_KEY);
        set({
          sessionHermano: null,
          isAuthenticated: false,
          isAdmin: false,
          isCofrade: false,
        });
      },

      updateHermano: (updates) =>
        set((state) => ({
          sessionHermano: state.sessionHermano
            ? {
                ...state.sessionHermano,
                hermano: { ...state.sessionHermano.hermano, ...updates },
              }
            : null,
        })),
    }),
    {
      name: AUTH_KEY,
      storage: createJSONStorage(() => adaptiveStorage),
      partialize: (state) => ({
        sessionHermano: state.sessionHermano,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
        isCofrade: state.isCofrade,
      }),
    }
  )
);
