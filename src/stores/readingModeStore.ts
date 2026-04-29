import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ReadingModeState {
  isReadingMode: boolean;
  toggleReadingMode: () => void;
}

export const useReadingModeStore = create<ReadingModeState>()(
  persist(
    (set) => ({
      isReadingMode: false,
      toggleReadingMode: () => set((s) => ({ isReadingMode: !s.isReadingMode })),
    }),
    {
      name: 'jhs-reading-mode',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
