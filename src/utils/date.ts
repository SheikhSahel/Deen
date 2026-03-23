import { getHijriAdjustedParts, getRamadanWindows, type HijriSettings } from "@/lib/hijri-provider";

export function getRamadanCountdown() {
  return getRamadanCountdownBySettings({ country: "BD", moonSightingOffset: 0 });
}

export function getRamadanCountdownBySettings(settings: HijriSettings, now: Date = new Date()) {
  const current = getRamadanWindows(settings, now);

  if (now >= current.start && now <= current.end) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, completed: true, isDuring: true };
  }
  const distance = current.start.getTime() - now.getTime();
  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((distance / (1000 * 60)) % 60);
  const seconds = Math.floor((distance / 1000) % 60);

  const hijriNow = getHijriAdjustedParts(now, settings);
  const completed = hijriNow.month > 9;

  return { days, hours, minutes, seconds, completed, isDuring: false };
}
