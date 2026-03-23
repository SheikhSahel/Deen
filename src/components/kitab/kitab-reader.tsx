"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/shared/glass-card";
import { cn } from "@/lib/utils";
import type { KitabBook } from "@/lib/kitab-data";

type KitabReaderProps = {
  book: KitabBook;
};

export function KitabReader({ book }: KitabReaderProps) {
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const activeChapter = book.chapters[activeChapterIndex];

  const goToPrevious = () => {
    setActiveChapterIndex((prev) => Math.max(prev - 1, 0));
  };

  const goToNext = () => {
    setActiveChapterIndex((prev) => Math.min(prev + 1, book.chapters.length - 1));
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <GlassCard className="h-fit space-y-3">
        <h2 className="text-base font-semibold">অধ্যায় তালিকা</h2>
        <div className="space-y-2">
          {book.chapters.map((chapter, index) => (
            <button
              key={chapter.id}
              type="button"
              onClick={() => setActiveChapterIndex(index)}
              className={cn(
                "w-full rounded-lg border px-3 py-2 text-left text-sm transition",
                index === activeChapterIndex
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-600"
                  : "border-emerald-400/20 hover:border-emerald-400/40",
              )}
            >
              {chapter.title}
            </button>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-emerald-500">{activeChapter.title}</h2>
          <p className="text-xs text-muted-foreground">
            অধ্যায় {activeChapterIndex + 1}/{book.chapters.length}
          </p>
        </div>

        <div className="space-y-4 text-base leading-8 text-foreground/90">
          {activeChapter.content.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            variant="outline"
            onClick={goToPrevious}
            disabled={activeChapterIndex === 0}
            className="rounded-full"
          >
            আগের অধ্যায়
          </Button>
          <Button
            onClick={goToNext}
            disabled={activeChapterIndex === book.chapters.length - 1}
            className="rounded-full bg-emerald-700 hover:bg-emerald-800"
          >
            পরের অধ্যায়
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}
