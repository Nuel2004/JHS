import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { SessionHermano, Hermano } from '../interfaces/Hermano';

/**
 * Estado global de autenticación de la Hermandad JHS.
 * Sigue el mismo patrón que Vesto (authStore) adaptado a hermanos/admin.
 */
interface AuthState {
  /** Sesión activa: usuario de Auth + perfil de hermano */
  sessionHermano: SessionHermano | null;
  /** Si hay sesión activa */
  isAuthenticated: boolean;
  /** Si el hermano tiene rol admin */
  isAdmin: boolean;
  /** Si el hermano tiene estado 'activo' (pagó la cuota) */
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

      clearSession: () =>
        set({
          sessionHermano: null,
          isAuthenticated: false,
          isAdmin: false,
          isCofrade: false,
        }),

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
      name: 'jhs-auth-v1',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        sessionHermano: state.sessionHermano,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
        isCofrade: state.isCofrade,
      }),
    }
  )
);
