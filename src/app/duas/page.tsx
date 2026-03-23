"use client";

import { useMemo, useState } from "react";
import { Download, Pin, Search, Star } from "lucide-react";
import { DUA_CATEGORIES } from "@/lib/constants";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { GlassCard } from "@/components/shared/glass-card";
import { PageShell } from "@/components/shared/page-shell";
import { MotionReveal } from "@/components/motion/motion-section";
import { Button } from "@/components/ui/button";
import { useDuaPreferences } from "@/hooks/use-dua-preferences";
import { VerificationBadge } from "@/components/shared/verification-badge";
import type { StaticDua, StaticDuaCategory } from "@/lib/content-schema";

const CONTEXT_OPTIONS = [
  { value: "auto", label: "অটো" },
  { value: "travel", label: "ভ্রমণ" },
  { value: "illness", label: "অসুস্থতা" },
  { value: "exam", label: "পরীক্ষা" },
  { value: "debt", label: "ঋণ" },
  { value: "distress", label: "দুশ্চিন্তা" },
  { value: "prayer", label: "নামাজ" },
] as const;

function matchesContext(categoryTitle: string, context: string) {
  const title = categoryTitle.toLowerCase();
  if (context === "auto") {
    // Auto mode should show the full dua collection.
    return true;
  }
  if (context === "travel") return title.includes("ভ্রমণ") || title.includes("বাড়ি") || title.includes("বাজার");
  if (context === "illness") return title.includes("রোগ") || title.includes("সুস্থতা");
  if (context === "exam") return title.includes("জ্ঞান") || title.includes("রব্বানা");
  if (context === "debt") return title.includes("ঋণ") || title.includes("জীবিকা");
  if (context === "distress") return title.includes("দুশ্চিন্তা") || title.includes("হিফাজত");
  if (context === "prayer") return title.includes("নামাজ") || title.includes("মসজিদ") || title.includes("ওযু");
  return true;
}

export default function DuasPage() {
  const prefs = useDuaPreferences();
  const [query, setQuery] = useState("");

  const filteredCategories = useMemo(() => {
    const q = query.trim().toLowerCase();

    return DUA_CATEGORIES.filter((category: StaticDuaCategory) => {
      if (!matchesContext(category.title, prefs.context)) return false;
      if (!q) return true;

      return (
        category.title.toLowerCase().includes(q) ||
        category.duas.some(
          (dua: StaticDua) => dua.arabic.toLowerCase().includes(q) || dua.translation.toLowerCase().includes(q),
        )
      );
    });
  }, [query, prefs.context]);

  const pinnedCards = useMemo(() => {
    const all: Array<{ id: string; category: string; arabic: string; translation: string; transliteration?: string }> = [];
    DUA_CATEGORIES.forEach((category: StaticDuaCategory) => {
      category.duas.forEach((dua: StaticDua, index: number) => {
        const id = `${category.title}-${index}`;
        if (prefs.isPinned(id)) {
          all.push({ id, category: category.title, arabic: dua.arabic, translation: dua.translation, transliteration: dua.transliteration });
        }
      });
    });
    return all;
  }, [prefs]);

  const downloadOfflinePack = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      categories: DUA_CATEGORIES,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "noor-dua-offline-pack.json";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <PageShell
      id="duas-title"
      title="দু‘আসমূহ"
      subtitle="দৈনন্দিন জীবনের জন্য সাজানো হৃদয়স্পর্শী দু‘আসমূহ পড়ুন।"
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <VerificationBadge label="যাচাইকৃত সংকলন" />
        <label className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/20 px-3 py-2 text-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="দু‘আ খুঁজুন..."
            className="bg-transparent outline-none"
          />
        </label>
        <select
          className="rounded-lg border border-emerald-400/20 bg-background px-3 py-2 text-sm"
          value={prefs.context}
          onChange={(event) => prefs.setContext(event.target.value)}
          aria-label="কনটেক্সট ভিত্তিক সাজেশন"
        >
          {CONTEXT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Button
          variant={prefs.transliteration ? "default" : "outline"}
          className="rounded-lg"
          onClick={() => prefs.setTransliteration(!prefs.transliteration)}
        >
          উচ্চারণ {prefs.transliteration ? "চালু" : "বন্ধ"}
        </Button>
        <Button variant="outline" className="rounded-lg" onClick={downloadOfflinePack}>
          <Download className="mr-1 h-4 w-4" /> অফলাইন প্যাক
        </Button>
      </div>

      {pinnedCards.length > 0 ? (
        <GlassCard className="mb-4">
          <h3 className="text-base font-semibold">পিন করা দু‘আ</h3>
          <div className="mt-3 space-y-2">
            {pinnedCards.map((card) => (
              <div key={card.id} className="rounded-lg border border-emerald-400/20 p-3">
                <p className="text-xs text-emerald-600">{card.category}</p>
                <p className="arabic-text mt-1 text-right text-xl text-amber-500">{card.arabic}</p>
                <p className="mt-1 text-sm text-muted-foreground">{prefs.transliteration ? card.transliteration ?? "উচ্চারণ অনুপলব্ধ" : card.translation}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      ) : null}

      <MotionReveal>
        <Accordion type="single" collapsible className="w-full space-y-2.5 sm:space-y-3">
          {filteredCategories.map((category, index) => (
            <AccordionItem key={category.title} value={`item-${index}`} className="border-none">
              <GlassCard>
                <AccordionTrigger className="text-base sm:text-lg hover:no-underline">
                  <span className="inline-flex items-center gap-2">
                    {category.title}
                    <VerificationBadge className="py-0.5" />
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 sm:space-y-4">
                    {category.duas.map((dua: StaticDua, duaIndex: number) => (
                      <div key={`${category.title}-${duaIndex}`} className="rounded-xl border border-emerald-400/20 p-4">
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Button
                              variant={prefs.isFavorite(`${category.title}-${duaIndex}`) ? "default" : "outline"}
                              size="sm"
                              className="h-8 rounded-full"
                              onClick={() => prefs.toggleFavorite(`${category.title}-${duaIndex}`)}
                            >
                              <Star className="mr-1 h-3.5 w-3.5" /> ফেভারিট
                            </Button>
                            <Button
                              variant={prefs.isPinned(`${category.title}-${duaIndex}`) ? "default" : "outline"}
                              size="sm"
                              className="h-8 rounded-full"
                              onClick={() => prefs.togglePinned(`${category.title}-${duaIndex}`)}
                            >
                              <Pin className="mr-1 h-3.5 w-3.5" /> পিন
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">সূত্র: {dua.source?.book ?? "হিসনুল মুসলিম / সহিহ সংকলন"}</p>
                        </div>
                        <p className="arabic-text text-right text-[1.65rem] text-amber-500 sm:text-2xl">{dua.arabic}</p>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {prefs.transliteration ? dua.transliteration ?? "উচ্চারণ অনুপলব্ধ" : dua.translation}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">যাচাই: {dua.source?.grade ?? "সহিহ/হাসান উৎস ভিত্তিক"}</p>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </GlassCard>
            </AccordionItem>
          ))}
        </Accordion>
      </MotionReveal>
    </PageShell>
  );
}
