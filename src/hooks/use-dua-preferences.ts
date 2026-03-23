"use client";

import { useEffect, useMemo, useState } from "react";

const KEY = "noor-dua-preferences-v1";

type Stored = {
  favorites: string[];
  pinned: string[];
  context: string;
  transliteration: boolean;
};

const DEFAULTS: Stored = {
  favorites: [],
  pinned: [],
  context: "auto",
  transliteration: false,
};

export function useDuaPreferences() {
  const [state, setState] = useState<Stored>(DEFAULTS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<Stored>;
      setState({
        favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
        pinned: Array.isArray(parsed.pinned) ? parsed.pinned : [],
        context: typeof parsed.context === "string" ? parsed.context : "auto",
        transliteration: parsed.transliteration === true,
      });
    } catch {
      localStorage.removeItem(KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);

  const api = useMemo(
    () => ({
      ...state,
      isFavorite: (id: string) => state.favorites.includes(id),
      isPinned: (id: string) => state.pinned.includes(id),
      toggleFavorite: (id: string) =>
        setState((prev) => ({
          ...prev,
          favorites: prev.favorites.includes(id) ? prev.favorites.filter((x) => x !== id) : [...prev.favorites, id],
        })),
      togglePinned: (id: string) =>
        setState((prev) => ({
          ...prev,
          pinned: prev.pinned.includes(id) ? prev.pinned.filter((x) => x !== id) : [...prev.pinned, id],
        })),
      setContext: (context: string) => setState((prev) => ({ ...prev, context })),
      setTransliteration: (transliteration: boolean) => setState((prev) => ({ ...prev, transliteration })),
    }),
    [state],
  );

  return api;
}
