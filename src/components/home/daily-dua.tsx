"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DUA_CATEGORIES } from "@/lib/constants";
import { GlassCard } from "@/components/shared/glass-card";
import { Button } from "@/components/ui/button";

export function DailyDua() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 60_000);

    return () => window.clearInterval(timer);
  }, []);

  const selected = useMemo(() => {
    const dayIndex = now.getDate() % DUA_CATEGORIES.length;
    const category = DUA_CATEGORIES[dayIndex];
    const dua = category.duas[0];

    return {
      categoryTitle: category.title,
      arabic: dua.arabic,
      translation: dua.translation,
    };
  }, [now]);

  return (
    <GlassCard>
      <p className="text-xs uppercase tracking-[0.18em] text-emerald-500">আজকের নির্বাচিত দু‘আ</p>
      <h3 className="mt-2 text-lg font-semibold sm:text-xl">{selected.categoryTitle}</h3>
      <p className="arabic-text mt-4 text-right text-2xl leading-relaxed text-amber-500 sm:text-[1.9rem]">{selected.arabic}</p>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{selected.translation}</p>
      <Button asChild variant="outline" className="mt-4 rounded-full border-emerald-400/30">
        <Link href="/duas">আরও দু‘আ দেখুন</Link>
      </Button>
    </GlassCard>
  );
}
