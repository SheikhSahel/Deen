"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface TasbihState {
  count: number;
  increment: () => void;
  reset: () => void;
}

export const useTasbihStore = create<TasbihState>()(
  persist(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
      reset: () => set({ count: 0 }),
    }),
    {
      name: "noor-tasbih",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
