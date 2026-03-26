"use client";

import { useEffect, useState } from "react";
import { DAILY_QUOTES } from "@/lib/constants";
import { GlassCard } from "@/components/shared/glass-card";

function getQuoteOfTheDay(date: Date = new Date()) {
  const day = date.getDate();
  return DAILY_QUOTES[day % DAILY_QUOTES.length];
}

export function DailyQuote() {
  // Use a fixed date for server rendering to avoid hydration mismatch
  // This will be updated to the actual current date on client
  const [quote, setQuote] = useState(() => getQuoteOfTheDay(new Date(2026, 0, 1)));

  useEffect(() => {
    setQuote(getQuoteOfTheDay());

    const scheduleMidnightRefresh = () => {
      const now = new Date();
      const nextMidnight = new Date(now);
      nextMidnight.setHours(24, 0, 0, 0);

      const delay = nextMidnight.getTime() - now.getTime();
      const timeoutId = setTimeout(() => {
        setQuote(getQuoteOfTheDay());
        scheduleMidnightRefresh();
      }, delay);

      return () => clearTimeout(timeoutId);
    };

    return scheduleMidnightRefresh();
  }, []);

  return (
    <GlassCard>
      <h3 className="text-lg font-semibold sm:text-xl">দৈনিক ইসলামিক বাণী</h3>
      <p className="arabic-text mt-4 text-right text-2xl leading-relaxed text-amber-500 sm:text-[1.9rem]">{quote.arabic}</p>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{quote.translation}</p>
      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-emerald-500">{quote.source}</p>
    </GlassCard>
  );
}
