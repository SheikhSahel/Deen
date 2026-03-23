"use client";

import { useEffect, useMemo, useState } from "react";

const KEY = "noor-prayer-planner-v1";

export type PrayerKey = "Fajr" | "Dhuhr" | "Asr" | "Maghrib" | "Isha";

type State = {
  missedToday: PrayerKey[];
  reminderEnabled: boolean;
};

const DEFAULTS: State = {
  missedToday: [],
  reminderEnabled: false,
};

export function usePrayerPlanner() {
  const [state, setState] = useState<State>(DEFAULTS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<State>;
      setState({
        missedToday: Array.isArray(parsed.missedToday) ? (parsed.missedToday as PrayerKey[]) : [],
        reminderEnabled: parsed.reminderEnabled === true,
      });
    } catch {
      localStorage.removeItem(KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);

  const recoveryPlan = useMemo(() => {
    if (!state.missedToday.length) return "আজকের সালাতসমূহ পূর্ণ হয়েছে, আলহামদুলিল্লাহ।";
    return `ধীরে ধীরে কাযা পরিকল্পনা: প্রতিটি ফরজ নামাজের পরে ১টি কাযা পড়ুন (${state.missedToday.join(", ")}).`;
  }, [state.missedToday]);

  return {
    ...state,
    toggleMissed: (prayer: PrayerKey) =>
      setState((prev) => ({
        ...prev,
        missedToday: prev.missedToday.includes(prayer)
          ? prev.missedToday.filter((p) => p !== prayer)
          : [...prev.missedToday, prayer],
      })),
    toggleReminder: () => setState((prev) => ({ ...prev, reminderEnabled: !prev.reminderEnabled })),
    recoveryPlan,
  };
}
