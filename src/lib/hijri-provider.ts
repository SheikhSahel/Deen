export type MoonSightingCountry = "BD" | "SA";

export type HijriSettings = {
  country: MoonSightingCountry;
  moonSightingOffset: number;
};

type HijriDateParts = {
  day: number;
  month: number;
  year: number;
};

type RamadanWindow = {
  start: Date;
  end: Date;
};

type RamadanWindowCacheEntry = {
  expiresAt: number;
  window: RamadanWindow;
};

const RAMADAN_WINDOW_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const ramadanWindowCache = new Map<string, RamadanWindowCacheEntry>();

function getCountryTimeZone(country: MoonSightingCountry) {
  return country === "SA" ? "Asia/Riyadh" : "Asia/Dhaka";
}

function getDateKeyInTimeZone(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone,
  }).format(date);
}

function getRamadanCacheKey(settings: HijriSettings, referenceDate: Date) {
  const timeZone = getCountryTimeZone(settings.country);
  const dateKey = getDateKeyInTimeZone(referenceDate, timeZone);
  return `${settings.country}:${settings.moonSightingOffset}:${dateKey}`;
}

export function getHijriAdjustedParts(date: Date, settings: HijriSettings): HijriDateParts {
  const adjusted = new Date(date);
  adjusted.setDate(adjusted.getDate() + settings.moonSightingOffset);

  const parts = new Intl.DateTimeFormat("en-US-u-ca-islamic", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    timeZone: getCountryTimeZone(settings.country),
  }).formatToParts(adjusted);

  const day = Number(parts.find((part) => part.type === "day")?.value ?? "0");
  const month = Number(parts.find((part) => part.type === "month")?.value ?? "0");
  const year = Number(parts.find((part) => part.type === "year")?.value ?? "0");

  return { day, month, year };
}

export function getHijriAdjustedDate(date: Date, settings: HijriSettings) {
  const adjusted = new Date(date);
  adjusted.setDate(adjusted.getDate() + settings.moonSightingOffset);

  const formatter = new Intl.DateTimeFormat("en-TN-u-ca-islamic", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: getCountryTimeZone(settings.country),
  });

  return formatter.format(adjusted);
}

export function getRamadanWindows(settings: HijriSettings, referenceDate: Date = new Date()) {
  const cacheKey = getRamadanCacheKey(settings, referenceDate);
  const cached = ramadanWindowCache.get(cacheKey);
  const nowMs = Date.now();

  if (cached && cached.expiresAt > nowMs) {
    return {
      start: new Date(cached.window.start),
      end: new Date(cached.window.end),
    };
  }

  if (cached) {
    ramadanWindowCache.delete(cacheKey);
  }

  const isRamadanToday = getHijriAdjustedParts(referenceDate, settings).month === 9;

  const searchStart = new Date(referenceDate);
  searchStart.setDate(searchStart.getDate() - 370);

  const ramadanStarts: Date[] = [];

  for (let i = 0; i <= 740; i += 1) {
    const probe = new Date(Date.UTC(
      searchStart.getUTCFullYear(),
      searchStart.getUTCMonth(),
      searchStart.getUTCDate() + i,
      12,
      0,
      0,
    ));

    const parts = getHijriAdjustedParts(probe, settings);
    if (parts.month === 9 && parts.day === 1) {
      const start = new Date(probe.getUTCFullYear(), probe.getUTCMonth(), probe.getUTCDate(), 0, 0, 0, 0);
      const lastFound = ramadanStarts[ramadanStarts.length - 1];
      if (!lastFound || lastFound.getTime() !== start.getTime()) {
        ramadanStarts.push(start);
      }
    }
  }

  const referenceTime = referenceDate.getTime();
  const currentOrPrevious = [...ramadanStarts].reverse().find((date) => date.getTime() <= referenceTime) ?? ramadanStarts[0];
  const next = ramadanStarts.find((date) => date.getTime() > referenceTime) ?? currentOrPrevious;

  const start = isRamadanToday ? currentOrPrevious : next;
  const end = new Date(start);
  end.setDate(end.getDate() + 29);
  end.setHours(23, 59, 59, 999);

  const window = {
    start,
    end,
  };

  ramadanWindowCache.set(cacheKey, {
    expiresAt: nowMs + RAMADAN_WINDOW_CACHE_TTL_MS,
    window: {
      start: new Date(window.start),
      end: new Date(window.end),
    },
  });

  return window;
}
