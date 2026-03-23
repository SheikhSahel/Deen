"use client";

import { useEffect, useState } from "react";

const KEY = "noor-islamic-settings-v1";

type Settings = {
  country: "BD" | "SA";
  moonSightingOffset: number;
};

const DEFAULTS: Settings = {
  country: "BD",
  moonSightingOffset: 0,
};

export function useIslamicSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<Settings>;
      setSettings({
        country: parsed.country === "SA" ? "SA" : "BD",
        moonSightingOffset: Number.isFinite(parsed.moonSightingOffset) ? Number(parsed.moonSightingOffset) : 0,
      });
    } catch {
      localStorage.removeItem(KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(settings));
  }, [settings]);

  return {
    settings,
    setCountry: (country: "BD" | "SA") => setSettings((prev) => ({ ...prev, country })),
    setMoonSightingOffset: (moonSightingOffset: number) => setSettings((prev) => ({ ...prev, moonSightingOffset })),
  };
}
