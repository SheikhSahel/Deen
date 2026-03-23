"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { fetchSurahDetails } from "@/lib/api";
import { SectionHeader } from "@/components/shared/section-header";
import { GlassCard } from "@/components/shared/glass-card";
import { LoadingGrid } from "@/components/shared/loading-grid";
import { Button } from "@/components/ui/button";
import { SurahDetailItem } from "@/types/islamic";
import { getRevelationTypeBn, getSurahNameBn } from "@/lib/quran-bn";

function getSurahAudioUrls(surahNumber: number) {
  const paddedSurah = String(surahNumber).padStart(3, "0");
  return [
    `https://server8.mp3quran.net/afs/${paddedSurah}.mp3`,
    `https://server11.mp3quran.net/afs/${paddedSurah}.mp3`,
  ];
}

export default function SurahDetailsPage() {
  const params = useParams<{ surahId: string }>();
  const [surahData, setSurahData] = useState<SurahDetailItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioSourceIndex, setAudioSourceIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetchSurahDetails(params.surahId);
        setSurahData(response.data);
      } catch {
        toast.error("সূরার বিস্তারিত লোড করা যায়নি।");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [params.surahId]);

  const arabic = surahData?.find((item) => item.edition.identifier === "quran-uthmani");
  const translation =
    surahData?.find((item) => item.edition.identifier === "bn.bengali") ??
    surahData?.find((item) => item.edition.identifier === "en.asad");

  const surahAudioUrls = useMemo(() => {
    if (!arabic) return null;
    return getSurahAudioUrls(arabic.number);
  }, [arabic]);

  const surahAudioUrl = surahAudioUrls?.[audioSourceIndex] ?? null;

  const verses = useMemo(() => {
    if (!arabic || !translation) return [];

    return arabic.ayahs.map((ayah, index) => ({
      number: ayah.numberInSurah,
      arabicText: ayah.text,
      translationText: translation.ayahs[index]?.text ?? "",
    }));
  }, [arabic, translation]);

  useEffect(() => {
    setAudioSourceIndex(0);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [params.surahId]);

  const handleToggleAudio = async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch {
      toast.error("এই মুহূর্তে সূরার অডিও চালানো যাচ্ছে না।");
    }
  };

  const handleAudioError = async () => {
    if (!surahAudioUrls) return;

    const nextIndex = audioSourceIndex + 1;
    if (nextIndex >= surahAudioUrls.length) {
      setIsPlaying(false);
      toast.error("সূরার অডিও এখন উপলব্ধ নয়। পরে আবার চেষ্টা করুন।");
      return;
    }

    setAudioSourceIndex(nextIndex);

    if (audioRef.current) {
      audioRef.current.load();
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <SectionHeader title="সূরার বিস্তারিত" subtitle="কনটেন্ট লোড হচ্ছে..." />
        <LoadingGrid />
      </div>
    );
  }

  if (!arabic || !translation) {
    return (
      <GlassCard>
        <p className="text-sm text-muted-foreground">সূরার কনটেন্ট এখন পাওয়া যাচ্ছে না।</p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title={`${getSurahNameBn(arabic.number, arabic.englishName)} (${arabic.name})`}
        subtitle={`${arabic.numberOfAyahs} আয়াত • ${getRevelationTypeBn(arabic.revelationType)}`}
      />

      {surahAudioUrl ? (
        <GlassCard>
          <p className="text-sm text-muted-foreground">সূরার অডিও তিলাওয়াত (আলাফাসি)</p>
          <div className="mt-3 flex items-center gap-3">
            <Button onClick={() => void handleToggleAudio()} className="rounded-full bg-emerald-600 hover:bg-emerald-700">
              {isPlaying ? "সূরা থামান" : "সূরা চালান"}
            </Button>
          </div>
          <audio
            ref={audioRef}
            preload="none"
            onEnded={() => setIsPlaying(false)}
            onPause={() => setIsPlaying(false)}
            onError={() => void handleAudioError()}
          >
            <source src={surahAudioUrl} type="audio/mpeg" />
          </audio>
        </GlassCard>
      ) : null}

      <div className="space-y-4">
        {verses.map((verse) => (
          <GlassCard key={verse.number}>
            <p className="text-xs text-emerald-500">আয়াত {verse.number}</p>
            <p className="arabic-text mt-3 text-right text-2xl leading-loose text-amber-500">{verse.arabicText}</p>
            <p className="mt-3 text-sm text-muted-foreground">{verse.translationText}</p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
