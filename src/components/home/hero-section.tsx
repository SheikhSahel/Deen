"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useIslamicSettings } from "@/hooks/use-islamic-settings";
import { Button } from "@/components/ui/button";

const calligraphy = ["نور", "رحمة", "سلام", "إيمان", "بركة", "صلاة"];

type HomeDates = {
  english: string;
  arabic: string;
  bengali: string;
};

const DHAKA_TIMEZONE = "Asia/Dhaka";

const DEFAULT_COORDS = {
  latitude: 23.8103,
  longitude: 90.4125,
};

const HIJRI_MONTHS_BN = [
  "মুহাররম",
  "সফর",
  "রবিউল আউয়াল",
  "রবিউস সানি",
  "জুমাদাল উলা",
  "জুমাদাস সানিয়া",
  "রজব",
  "শাবান",
  "রমজান",
  "শাওয়াল",
  "জিলকদ",
  "জিলহজ্জ",
];

const BONGABDO_MONTHS_BN = [
  "বৈশাখ",
  "জ্যৈষ্ঠ",
  "আষাঢ়",
  "শ্রাবণ",
  "ভাদ্র",
  "আশ্বিন",
  "কার্তিক",
  "অগ্রহায়ণ",
  "পৌষ",
  "মাঘ",
  "ফাল্গুন",
  "চৈত্র",
];

function isGregorianLeapYear(year: number) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function getDhakaDateParts(now: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: DHAKA_TIMEZONE,
  }).formatToParts(now);

  const year = Number(parts.find((part) => part.type === "year")?.value ?? "0");
  const month = Number(parts.find((part) => part.type === "month")?.value ?? "1");
  const day = Number(parts.find((part) => part.type === "day")?.value ?? "1");

  return { year, month, day };
}

function getBanglaDateFallback(now: Date) {
  const { year, month, day } = getDhakaDateParts(now);
  const banglaYearStartGregorian = month > 4 || (month === 4 && day >= 15) ? year : year - 1;
  const banglaYear = banglaYearStartGregorian - 593;

  const startUtc = Date.UTC(banglaYearStartGregorian, 3, 15);
  const targetUtc = Date.UTC(year, month - 1, day);
  let dayOfBanglaYear = Math.floor((targetUtc - startUtc) / (1000 * 60 * 60 * 24)) + 1;

  const monthLengths = [31, 31, 31, 31, 31, 30, 30, 30, 30, 30, isGregorianLeapYear(banglaYearStartGregorian + 1) ? 31 : 30, 30];

  let monthIndex = 0;
  while (monthIndex < 12 && dayOfBanglaYear > monthLengths[monthIndex]) {
    dayOfBanglaYear -= monthLengths[monthIndex];
    monthIndex += 1;
  }

  const weekday = new Intl.DateTimeFormat("bn-BD", {
    weekday: "long",
    timeZone: DHAKA_TIMEZONE,
  }).format(now);

  const monthName = BONGABDO_MONTHS_BN[Math.min(monthIndex, 11)];
  const dayBn = toBanglaNumber(dayOfBanglaYear);
  const yearBn = toBanglaNumber(banglaYear);

  return `${weekday}, ${dayBn}শে ${monthName} ${yearBn} বঙ্গাব্দ`;
}

function toBanglaNumber(value: number | string) {
  const numberValue = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("bn-BD", { useGrouping: false }).format(numberValue);
}

function toAsciiDigits(value: string) {
  const bnDigits = "০১২৩৪৫৬৭৮৯";
  return value.replace(/[০-৯]/g, (digit) => String(bnDigits.indexOf(digit)));
}

function parseLocalizedNumber(value: string) {
  const normalized = toAsciiDigits(value).replace(/[^0-9-]/g, "");
  return Number(normalized);
}

function formatDateSafe(now: Date, locale: string, fallbackLocale: string) {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: DHAKA_TIMEZONE,
  };

  try {
    return new Intl.DateTimeFormat(locale, options).format(now);
  } catch {
    return new Intl.DateTimeFormat(fallbackLocale, options).format(now);
  }
}

function getBanglaBongabdoDate(now: Date) {
  try {
    const parts = new Intl.DateTimeFormat("bn-BD-u-ca-beng", {
      weekday: "long",
      day: "numeric",
      month: "numeric",
      year: "numeric",
      timeZone: DHAKA_TIMEZONE,
    }).formatToParts(now);

    const weekday = parts.find((part) => part.type === "weekday")?.value ?? "";
    const dayRaw = parts.find((part) => part.type === "day")?.value ?? "";
    const monthRaw = parts.find((part) => part.type === "month")?.value ?? "";
    const year = parts.find((part) => part.type === "year")?.value ?? "";

    const normalizedDay = parseLocalizedNumber(dayRaw);
    const normalizedMonth = parseLocalizedNumber(monthRaw);
    const normalizedYear = parseLocalizedNumber(year);

    if (normalizedYear >= 1700) {
      return getBanglaDateFallback(now);
    }

    const day = Number.isNaN(normalizedDay) ? dayRaw : toBanglaNumber(normalizedDay);
    const month = Number.isNaN(normalizedMonth)
      ? monthRaw
      : BONGABDO_MONTHS_BN[Math.min(Math.max(normalizedMonth, 1), 12) - 1];
    const dayWithSuffix = day.endsWith("শে") ? day : `${day}শে`;

    return `${weekday}, ${dayWithSuffix} ${month} ${year} বঙ্গাব্দ`;
  } catch {
    return formatDateSafe(now, "bn-BD", "en-GB");
  }
}

function getLocalHomeDates(now: Date, moonSightingOffset: number = 0): HomeDates {
  return {
    english: formatDateSafe(now, "en-GB", "en-US"),
    arabic: getHijriDateBn(now, DHAKA_TIMEZONE, moonSightingOffset),
    bengali: getBanglaBongabdoDate(now),
  };
}

function getHijriDateBn(now: Date, timeZone = DHAKA_TIMEZONE, adjustmentDays = 0) {
  try {
    const adjusted = new Date(now);
    if (adjustmentDays !== 0) {
      adjusted.setDate(adjusted.getDate() + adjustmentDays);
    }

    const parts = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
      timeZone,
    }).formatToParts(adjusted);

    const day = Number(parts.find((part) => part.type === "day")?.value ?? "1");
    const month = Number(parts.find((part) => part.type === "month")?.value ?? "1");
    const year = Number(parts.find((part) => part.type === "year")?.value ?? "1447");
    const monthName = HIJRI_MONTHS_BN[Math.min(Math.max(month, 1), 12) - 1];

    return `${toBanglaNumber(day)} ${monthName} ${toBanglaNumber(year)} হিজরি`;
  } catch {
    return "-- হিজরি";
  }
}

function getHijriDateFromApi(hijri?: {
  date?: string;
  month?: { number?: number };
  year?: string;
}) {
  if (!hijri) return null;

  const day = Number(hijri.date?.split("-")?.[0] ?? "");
  const month = Number(hijri.month?.number ?? "");
  const year = Number(hijri.year ?? "");

  if (Number.isNaN(day) || Number.isNaN(month) || Number.isNaN(year)) return null;

  const monthName = HIJRI_MONTHS_BN[Math.min(Math.max(month, 1), 12) - 1];
  return `${toBanglaNumber(day)} ${monthName} ${toBanglaNumber(year)} হিজরি`;
}

export function HeroSection() {
  const { coordinates } = useGeolocation();
  const { settings } = useIslamicSettings();
  const [clientTimeZone, setClientTimeZone] = useState(DHAKA_TIMEZONE);
  // Initialize with a safe default for server rendering
  const [dates, setDates] = useState<HomeDates>(() => 
    getLocalHomeDates(new Date(2026, 0, 1), 0)
  );

  useEffect(() => {
    // Update to actual computed values on client
    setDates(getLocalHomeDates(new Date(), settings.moonSightingOffset));
    
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz) setClientTimeZone(tz);
  }, [settings.moonSightingOffset]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    setDates(getLocalHomeDates(new Date(), settings.moonSightingOffset));

    const scheduleMidnightRefresh = () => {
      const now = new Date();
      const nextMidnight = new Date(now);
      nextMidnight.setHours(24, 0, 0, 0);

      const delay = nextMidnight.getTime() - now.getTime();
      timeoutId = setTimeout(() => {
        const refreshedNow = new Date();
        setDates((prev) => ({
          ...prev,
          english: formatDateSafe(refreshedNow, "en-GB", "en-US"),
          arabic: getHijriDateBn(refreshedNow, DHAKA_TIMEZONE, settings.moonSightingOffset),
          bengali: getBanglaBongabdoDate(refreshedNow),
        }));

        scheduleMidnightRefresh();
      }, delay);
    };

    scheduleMidnightRefresh();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [settings.moonSightingOffset]);

  useEffect(() => {
    let isMounted = true;

    const updateHijriFromLocation = async () => {
      const now = new Date();
      const targetCoordinates = coordinates ?? DEFAULT_COORDS;
      const adjustmentDays = settings.moonSightingOffset;

      try {
        const response = await fetch(
          `/api/prayer-times?latitude=${targetCoordinates.latitude}&longitude=${targetCoordinates.longitude}`,
          { cache: "no-store" },
        );
        const payload = await response.json();
        const hijriFromApi = getHijriDateFromApi(payload?.data?.date?.hijri);

        if (!isMounted) return;

        setDates((prev) => ({
          ...prev,
          arabic:
            clientTimeZone.startsWith("Asia/")
              ? getHijriDateBn(now, clientTimeZone, adjustmentDays)
              : hijriFromApi ?? getHijriDateBn(now, clientTimeZone, 0),
        }));
      } catch {
        if (!isMounted) return;
        setDates((prev) => ({
          ...prev,
          arabic: getHijriDateBn(now, clientTimeZone, adjustmentDays),
        }));
      }
    };

    void updateHijriFromLocation();
    const intervalId = setInterval(() => {
      void updateHijriFromLocation();
    }, 1000 * 60 * 10);

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [coordinates, clientTimeZone, settings.moonSightingOffset]);

  return (
    <section className="relative overflow-hidden rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-emerald-600/15 via-background to-amber-500/10 p-5 sm:p-7 md:p-10 lg:p-12">
      <div className="pointer-events-none absolute inset-0 -z-0">
        {calligraphy.map((word, index) => (
          <motion.span
            key={word}
            aria-hidden="true"
            className="arabic-text absolute text-3xl text-emerald-300/20 sm:text-4xl md:text-6xl"
            style={{ top: `${8 + index * 13}%`, left: `${3 + (index % 3) * 31}%` }}
            animate={{ y: [0, -8, 0], opacity: [0.15, 0.32, 0.15] }}
            transition={{ duration: 8 + index * 0.7, repeat: Infinity, ease: "easeInOut" }}
          >
            {word}
          </motion.span>
        ))}
      </div>

      <div className="relative z-10 max-w-3xl space-y-4 sm:space-y-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-amber-500 sm:text-xs">নূর প্ল্যাটফর্ম</p>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl md:leading-[1.1]">
          নূর – পূর্ণাঙ্গ ইসলামিক প্ল্যাটফর্ম
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base md:text-lg">
          নামাজের সময়সূচি, কুরআন, হাদিস, দু‘আ এবং দৈনন্দিন আধ্যাত্মিকতার জন্য আধুনিক ইসলামিক অভিজ্ঞতা।
        </p>

        <div className="grid gap-2 sm:grid-cols-3">
          <div className="order-1 rounded-xl border border-emerald-400/20 bg-white/10 px-3 py-2 backdrop-blur-xl">
            <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-600/80">English</p>
            <p suppressHydrationWarning className="mt-1 text-xs text-foreground/90 sm:text-sm">{dates.english}</p>
          </div>
          <div className="order-3 rounded-xl border border-emerald-400/20 bg-white/10 px-3 py-2 backdrop-blur-xl sm:order-2">
            <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-600/80">বাংলা</p>
            <p suppressHydrationWarning className="arabic-text mt-1 text-xs leading-relaxed text-foreground/90 sm:text-sm">
              {dates.bengali}
            </p>
          </div>
          <div className="order-2 rounded-xl border border-emerald-400/20 bg-white/10 px-3 py-2 backdrop-blur-xl sm:order-3">
            <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-600/80">Arabic (Hijri)</p>
            <p
              suppressHydrationWarning
              lang="ar-SA"
              className="arabic-text mt-1 w-full text-left text-sm leading-relaxed text-amber-500 sm:text-base"
            >
              {dates.arabic}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 sm:gap-3">
          <Button asChild className="h-10 rounded-full bg-emerald-700 px-5 text-white hover:bg-emerald-800 sm:h-11 sm:px-6">
            <Link href="/prayer-times">নামাজের সময় দেখুন</Link>
          </Button>
          <Button asChild variant="outline" className="h-10 rounded-full border-amber-500/40 px-5 sm:h-11 sm:px-6">
            <Link href="/quran" prefetch={false}>কুরআন পড়ুন</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
