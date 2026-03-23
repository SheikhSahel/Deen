"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/shared/glass-card";
import { fetchHadithByCollection, fetchHadithCollections } from "@/lib/api";
import { HadithCollection, HadithItem } from "@/types/islamic";
import { toast } from "sonner";
import { PageShell } from "@/components/shared/page-shell";
import { MotionReveal, MotionStagger } from "@/components/motion/motion-section";
import { DataPageSkeleton, EmptyStateCard } from "@/components/shared/async-state";
import { VerificationBadge } from "@/components/shared/verification-badge";

const HADITH_TRANSLATION_CACHE_KEY = "noor-hadith-translation-cache-v1";
const HADITH_TRANSLATION_CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7;

const HADITH_COLLECTION_NAMES_BN: Record<string, string> = {
  abudawud: "আবু দাউদ",
  abudaud: "আবু দাউদ",
  abudawood: "আবু দাউদ",
  sunanabudawud: "আবু দাউদ",
  ahmad: "আহমদ",
  bukhari: "বুখারি",
  darimi: "দারিমি",
  ibnmajah: "ইবনু মাজাহ",
  ibnumajah: "ইবনু মাজাহ",
  ibnemajah: "ইবনু মাজাহ",
  malik: "মালিক",
  muslim: "মুসলিম",
  nasai: "নাসাঈ",
  tirmidhi: "তিরমিযি",
  tirmizi: "তিরমিযি",
  tirmidzi: "তিরমিযি",
};

function normalizeCollectionId(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getCollectionLabel(id: string, fallback: string) {
  const normalized = normalizeCollectionId(id);
  return HADITH_COLLECTION_NAMES_BN[normalized] ?? fallback;
}

interface CachedHadithTranslation {
  translatedText: string;
  cachedAt: number;
}

type HadithTranslationCache = Record<string, CachedHadithTranslation>;

function getCacheKey(collectionId: string, hadithNumber: number, sourceText: string) {
  return `${collectionId}:${hadithNumber}:${sourceText.slice(0, 48)}`;
}

function readTranslationCache(): HadithTranslationCache {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(HADITH_TRANSLATION_CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as HadithTranslationCache;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeTranslationCache(cache: HadithTranslationCache) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(HADITH_TRANSLATION_CACHE_KEY, JSON.stringify(cache));
  } catch {
    return;
  }
}

export default function HadithPage() {
  const [collections, setCollections] = useState<HadithCollection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState("bukhari");
  const [hadiths, setHadiths] = useState<HadithItem[]>([]);
  const [banglaTranslations, setBanglaTranslations] = useState<Record<number, string>>({});
  const [translating, setTranslating] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCollections = async () => {
      try {
        const response = await fetchHadithCollections();
        setCollections(response);
      } catch {
        toast.error("হাদিসের কালেকশন লোড করা যায়নি।");
      }
    };

    void loadCollections();
  }, []);

  useEffect(() => {
    const loadHadiths = async () => {
      try {
        setLoading(true);
        const response = await fetchHadithByCollection(selectedCollection, page);
        setHadiths(response.data.hadiths);
        setBanglaTranslations({});
      } catch {
        toast.error("হাদিস লোড করা যায়নি।");
      } finally {
        setLoading(false);
      }
    };

    void loadHadiths();
  }, [page, selectedCollection]);

  useEffect(() => {
    const translateHadiths = async () => {
      if (!hadiths.length) return;

      const now = Date.now();
      const cache = readTranslationCache();

      const cachedTranslations: Record<number, string> = {};
      const pendingHadiths: HadithItem[] = [];

      for (const hadith of hadiths) {
        const cacheKey = getCacheKey(selectedCollection, hadith.number, hadith.id);
        const cachedItem = cache[cacheKey];

        if (cachedItem && now - cachedItem.cachedAt < HADITH_TRANSLATION_CACHE_TTL_MS) {
          cachedTranslations[hadith.number] = cachedItem.translatedText;
        } else {
          pendingHadiths.push(hadith);
        }
      }

      if (Object.keys(cachedTranslations).length > 0) {
        setBanglaTranslations((prev) => ({ ...prev, ...cachedTranslations }));
      }

      if (!pendingHadiths.length) {
        setTranslating(false);
        return;
      }

      setTranslating(true);
      try {
        const translatedEntries = await Promise.all(
          pendingHadiths.map(async (hadith) => {
            try {
              const response = await fetch("/api/translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: hadith.id, source: "id", target: "bn" }),
              });

              if (!response.ok) {
                return [hadith.number, hadith.id] as const;
              }

              const data = (await response.json()) as { translatedText?: string };
              return [hadith.number, data.translatedText?.trim() || hadith.id] as const;
            } catch {
              return [hadith.number, hadith.id] as const;
            }
          }),
        );

        const freshTranslations = Object.fromEntries(translatedEntries);

        const updatedCache: HadithTranslationCache = { ...cache };
        for (const hadith of pendingHadiths) {
          const cacheKey = getCacheKey(selectedCollection, hadith.number, hadith.id);
          const translatedText = freshTranslations[hadith.number] || hadith.id;
          updatedCache[cacheKey] = {
            translatedText,
            cachedAt: now,
          };
        }
        writeTranslationCache(updatedCache);

        setBanglaTranslations((prev) => ({ ...prev, ...freshTranslations }));
      } finally {
        setTranslating(false);
      }
    };

    void translateHadiths();
  }, [hadiths, selectedCollection]);

  return (
    <PageShell
      id="hadith-title"
      title="হাদিস"
      subtitle="ফিল্টার করে সহীহ হাদিস পড়ুন এবং রাসূল ﷺ এর শিক্ষায় নিজেকে সমৃদ্ধ করুন।"
      actions={
        <div className="flex flex-wrap items-center gap-2.5">
          <VerificationBadge label="যাচাইকৃত হাদিস উৎস" />
          {collections.map((collection) => (
            <Button
              key={collection.id}
              variant={selectedCollection === collection.id ? "default" : "outline"}
              className={selectedCollection === collection.id ? "rounded-full bg-emerald-600 hover:bg-emerald-700" : "rounded-full"}
              onClick={() => {
                setSelectedCollection(collection.id);
                setPage(1);
              }}
            >
              {getCollectionLabel(collection.id, collection.name)}
            </Button>
          ))}
        </div>
      }
    >
      {loading ? (
        <DataPageSkeleton count={3} />
      ) : hadiths.length === 0 ? (
        <EmptyStateCard
          title="কোনো বর্ণনা পাওয়া যায়নি"
          description="এই রেঞ্জে হাদিস পাওয়া যাচ্ছে না। অন্য পৃষ্ঠা বা কালেকশন নির্বাচন করুন।"
        />
      ) : (
        <MotionStagger className="space-y-3 sm:space-y-4">
          {hadiths.map((hadith) => (
            <MotionReveal key={hadith.number}>
              <GlassCard>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground">সূত্র: {getCollectionLabel(selectedCollection, selectedCollection)}</p>
                  <VerificationBadge className="py-0.5" />
                </div>
                <p className="text-xs text-emerald-500">হাদিস #{hadith.number}</p>
                <p className="arabic-text mt-3 text-right text-[1.65rem] leading-loose text-amber-500 sm:text-2xl">{hadith.arab}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.12em] text-emerald-600/90">বাংলা অনুবাদ</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {banglaTranslations[hadith.number] ?? (translating ? "হাদিস অনুবাদ করা হচ্ছে..." : hadith.id)}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">গ্রেডিং নোট: সাধারণভাবে সহিহ সংকলনভিত্তিক; নির্দিষ্ট ফিকহি আলোচনায় আলেমের সাথে যাচাই করুন।</p>
              </GlassCard>
            </MotionReveal>
          ))}
        </MotionStagger>
      )}

      <div className="flex gap-2.5">
        <Button variant="outline" className="rounded-full" disabled={page === 1} onClick={() => setPage((prev) => prev - 1)}>
          আগের পৃষ্ঠা
        </Button>
        <Button onClick={() => setPage((prev) => prev + 1)} className="rounded-full bg-emerald-600 hover:bg-emerald-700">
          পরের পৃষ্ঠা
        </Button>
      </div>
    </PageShell>
  );
}
