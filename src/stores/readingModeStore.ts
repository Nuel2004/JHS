import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ReadingModeState {
  isReadingMode: boolean;
  toggleReadingMode: () => void;
}

/** Persists reading mode preference to localStorage under 'jhs-reading-mode-v1'. */
export const useReadingModeStore = create<ReadingModeState>()(
  persist(
    (set) => ({
      isReadingMode: false,
      toggleReadingMode: () => set((s) => ({ isReadingMode: !s.isReadingMode })),
    }),
    {
      name: 'jhs-reading-mode-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ isReadingMode: state.isReadingMode }),
    }
  )
);
