import { PrayerTimings } from "@/types/islamic";

export type DailyPrayerKey = "Fajr" | "Dhuhr" | "Asr" | "Maghrib" | "Isha";

export const PRAYER_ORDER: DailyPrayerKey[] = [
  "Fajr",
  "Dhuhr",
  "Asr",
  "Maghrib",
  "Isha",
];

export function sanitizePrayerTime(time: string) {
  return time.slice(0, 5);
}

function parseToMinutes(time: string) {
  const [hours, minutes] = sanitizePrayerTime(time).split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes: number) {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = String(Math.floor(normalized / 60)).padStart(2, "0");
  const minutes = String(normalized % 60).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function addMinutes(time: string, delta: number) {
  return minutesToTime(parseToMinutes(time) + delta);
}

export interface PrayerWindow {
  key: string;
  label: string;
  start: string;
  end: string;
}

export function formatPrayerTime12Hour(time: string) {
  const [hours, minutes] = sanitizePrayerTime(time).split(":").map(Number);
  const date = new Date(2026, 0, 1, hours, minutes, 0, 0);

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function getPrayerLabel(prayer: DailyPrayerKey, isFriday = false) {
  if (prayer === "Dhuhr" && isFriday) {
    return "জুম'আ";
  }

  const labels: Record<DailyPrayerKey, string> = {
    Fajr: "ফজর",
    Dhuhr: "যোহর",
    Asr: "আসর",
    Maghrib: "মাগরিব",
    Isha: "এশা",
  };

  return labels[prayer];
}

export function isFridayPrayerDay(weekdayEnglish?: string) {
  return weekdayEnglish?.toLowerCase() === "friday";
}

export function getPrayerWindows(timings: PrayerTimings, isFriday = false): PrayerWindow[] {
  const fajr = sanitizePrayerTime(timings.Fajr);
  const dhuhr = sanitizePrayerTime(timings.Dhuhr);
  const asr = sanitizePrayerTime(timings.Asr);
  const maghrib = sanitizePrayerTime(timings.Maghrib);
  const isha = sanitizePrayerTime(timings.Isha);

  return [
    { key: "Fajr", label: getPrayerLabel("Fajr"), start: fajr, end: addMinutes(dhuhr, -1) },
    { key: "Dhuhr", label: getPrayerLabel("Dhuhr", isFriday), start: dhuhr, end: addMinutes(asr, -1) },
    { key: "Asr", label: getPrayerLabel("Asr"), start: asr, end: addMinutes(maghrib, -1) },
    { key: "Maghrib", label: getPrayerLabel("Maghrib"), start: maghrib, end: addMinutes(isha, -1) },
    { key: "Isha", label: getPrayerLabel("Isha"), start: isha, end: addMinutes(fajr, -1) },
  ];
}

export function getNaflPrayerWindows(timings: PrayerTimings): PrayerWindow[] {
  const sunrise = timings.Sunrise ? sanitizePrayerTime(timings.Sunrise) : addMinutes(timings.Fajr, 75);

  return [
    {
      key: "Tahajjud",
      label: "তাহাজ্জুদ",
      start: addMinutes(timings.Isha, 90),
      end: addMinutes(timings.Fajr, -20),
    },
    {
      key: "Ishraq",
      label: "ইশরাক",
      start: addMinutes(sunrise, 15),
      end: addMinutes(timings.Dhuhr, -90),
    },
    {
      key: "Chasht",
      label: "চাশত",
      start: addMinutes(sunrise, 45),
      end: addMinutes(timings.Dhuhr, -20),
    },
    {
      key: "Awwabin",
      label: "আউয়াবীন",
      start: addMinutes(timings.Maghrib, 5),
      end: addMinutes(timings.Isha, -5),
    },
  ];
}

export function getForbiddenPrayerWindows(timings: PrayerTimings): PrayerWindow[] {
  const sunrise = timings.Sunrise ? sanitizePrayerTime(timings.Sunrise) : addMinutes(timings.Fajr, 75);

  return [
    {
      key: "Sunrise",
      label: "সূর্যোদয়কালীন",
      start: sunrise,
      end: addMinutes(sunrise, 20),
    },
    {
      key: "Zenith",
      label: "দুপুর (যাওয়াল)",
      start: addMinutes(timings.Dhuhr, -10),
      end: addMinutes(timings.Dhuhr, 5),
    },
    {
      key: "Sunset",
      label: "সূর্যাস্তকালীন",
      start: addMinutes(timings.Maghrib, -15),
      end: addMinutes(timings.Maghrib, 5),
    },
  ];
}

export function getNextPrayer(timings: PrayerTimings, isFriday = false): DailyPrayerKey {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const prayerWindows = getPrayerWindows(timings, isFriday);

  // Keep showing the active prayer until the end of its window.
  for (const window of prayerWindows) {
    const startMinutes = parseToMinutes(window.start);
    const endMinutes = parseToMinutes(window.end);

    const isInWindow =
      startMinutes <= endMinutes
        ? currentMinutes >= startMinutes && currentMinutes <= endMinutes
        : currentMinutes >= startMinutes || currentMinutes <= endMinutes;

    if (isInWindow) {
      return window.key as DailyPrayerKey;
    }
  }

  for (const prayer of PRAYER_ORDER) {
    const prayerMinutes = parseToMinutes(timings[prayer]);
    if (prayerMinutes > currentMinutes) {
      return prayer;
    }
  }

  return "Fajr";
}
