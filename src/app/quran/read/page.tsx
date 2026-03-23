"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/shared/glass-card";
import { fetchSurahs } from "@/lib/api";
import { SurahItem } from "@/types/islamic";
import { toast } from "sonner";
import { PageShell } from "@/components/shared/page-shell";
import { MotionReveal, MotionStagger } from "@/components/motion/motion-section";
import { DataPageSkeleton, EmptyStateCard } from "@/components/shared/async-state";
import { getRevelationTypeBn, getSurahNameBn } from "@/lib/quran-bn";
import { Button } from "@/components/ui/button";
import { Pause, Play } from "lucide-react";

type RecitationFormat = "surah" | "juz" | "topic";

const FORMAT_OPTIONS: Array<{ value: RecitationFormat; label: string }> = [
  { value: "surah", label: "সুরা" },
  { value: "juz", label: "পারা" },
  { value: "topic", label: "বিষয়ভিত্তিক" },
];

const JUZ_SURAH_RANGES: Array<{ juz: number; start: number; end: number }> = [
  { juz: 1, start: 1, end: 2 },
  { juz: 2, start: 2, end: 2 },
  { juz: 3, start: 2, end: 3 },
  { juz: 4, start: 3, end: 4 },
  { juz: 5, start: 4, end: 5 },
  { juz: 6, start: 5, end: 6 },
  { juz: 7, start: 6, end: 7 },
  { juz: 8, start: 7, end: 8 },
  { juz: 9, start: 8, end: 9 },
  { juz: 10, start: 9, end: 11 },
  { juz: 11, start: 11, end: 12 },
  { juz: 12, start: 12, end: 14 },
  { juz: 13, start: 15, end: 16 },
  { juz: 14, start: 16, end: 17 },
  { juz: 15, start: 17, end: 18 },
  { juz: 16, start: 18, end: 20 },
  { juz: 17, start: 21, end: 22 },
  { juz: 18, start: 23, end: 25 },
  { juz: 19, start: 25, end: 27 },
  { juz: 20, start: 27, end: 29 },
  { juz: 21, start: 29, end: 33 },
  { juz: 22, start: 33, end: 36 },
  { juz: 23, start: 36, end: 39 },
  { juz: 24, start: 39, end: 41 },
  { juz: 25, start: 41, end: 45 },
  { juz: 26, start: 46, end: 51 },
  { juz: 27, start: 51, end: 57 },
  { juz: 28, start: 58, end: 66 },
  { juz: 29, start: 67, end: 77 },
  { juz: 30, start: 78, end: 114 },
];

const TOPIC_GROUPS: Array<{ id: string; label: string; surahNumbers: number[] }> = [
  { id: "iman", label: "ঈমান ও তাওহীদ", surahNumbers: [1, 2, 3, 6, 112] },
  { id: "ibadah", label: "ইবাদত ও নৈতিকতা", surahNumbers: [17, 23, 31, 55, 67] },
  { id: "stories", label: "নবীদের কাহিনি", surahNumbers: [10, 11, 12, 19, 21, 28] },
  { id: "family", label: "পরিবার ও সমাজ", surahNumbers: [4, 24, 33, 49, 65] },
  { id: "akhirah", label: "আখিরাত ও হিসাব", surahNumbers: [56, 75, 78, 81, 99, 101] },
];

function getSurahAudioUrls(surahNumber: number) {
  const paddedSurah = String(surahNumber).padStart(3, "0");
  return [
    `https://server8.mp3quran.net/afs/${paddedSurah}.mp3`,
    `https://server11.mp3quran.net/afs/${paddedSurah}.mp3`,
  ];
}

function toBanglaNumber(value: number) {
  return new Intl.NumberFormat("bn-BD").format(value);
}

export default function QuranReadPage() {
  const [surahs, setSurahs] = useState<SurahItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [format, setFormat] = useState<RecitationFormat>("surah");
  const [selectedJuz, setSelectedJuz] = useState(1);
  const [selectedTopicId, setSelectedTopicId] = useState(TOPIC_GROUPS[0].id);
  const [isFullQuranPlaying, setIsFullQuranPlaying] = useState(false);
  const [isPlaybackPaused, setIsPlaybackPaused] = useState(false);
  const [queueIndex, setQueueIndex] = useState(0);
  const [audioSourceIndex, setAudioSourceIndex] = useState(0);
  const [estimatedAyah, setEstimatedAyah] = useState(1);
  const fullQuranAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetchSurahs();
        setSurahs(response.data);
      } catch {
        toast.error("সূরা তালিকা লোড করা যায়নি।");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const filteredSurahs = useMemo(() => {
    const query = search.toLowerCase();
    return surahs.filter(
      (surah) =>
        getSurahNameBn(surah.number, surah.englishName).toLowerCase().includes(query) ||
        surah.englishName.toLowerCase().includes(query) ||
        surah.name.includes(search) ||
        String(surah.number).includes(query),
    );
  }, [search, surahs]);

  const currentTopic = useMemo(() => {
    return TOPIC_GROUPS.find((topic) => topic.id === selectedTopicId) ?? TOPIC_GROUPS[0];
  }, [selectedTopicId]);

  const formatSurahs = useMemo(() => {
    if (format === "surah") return filteredSurahs;

    if (format === "juz") {
      const range = JUZ_SURAH_RANGES.find((item) => item.juz === selectedJuz) ?? JUZ_SURAH_RANGES[0];
      const inJuz = surahs.filter((surah) => surah.number >= range.start && surah.number <= range.end);
      if (!search.trim()) return inJuz;
      const query = search.toLowerCase();
      return inJuz.filter(
        (surah) =>
          getSurahNameBn(surah.number, surah.englishName).toLowerCase().includes(query) ||
          surah.englishName.toLowerCase().includes(query) ||
          surah.name.includes(search) ||
          String(surah.number).includes(query),
      );
    }

    const topicSet = new Set(currentTopic.surahNumbers);
    const inTopic = surahs.filter((surah) => topicSet.has(surah.number));
    if (!search.trim()) return inTopic;
    const query = search.toLowerCase();
    return inTopic.filter(
      (surah) =>
        getSurahNameBn(surah.number, surah.englishName).toLowerCase().includes(query) ||
        surah.englishName.toLowerCase().includes(query) ||
        surah.name.includes(search) ||
        String(surah.number).includes(query),
    );
  }, [currentTopic.surahNumbers, filteredSurahs, format, search, selectedJuz, surahs]);

  const playbackQueue = useMemo(() => {
    if (format === "surah") {
      return formatSurahs.map((surah) => surah.number);
    }

    if (format === "juz") {
      const range = JUZ_SURAH_RANGES.find((item) => item.juz === selectedJuz) ?? JUZ_SURAH_RANGES[0];
      const queue: number[] = [];
      for (let number = range.start; number <= range.end; number += 1) {
        queue.push(number);
      }
      return queue;
    }

    return [...currentTopic.surahNumbers].sort((a, b) => a - b);
  }, [currentTopic.surahNumbers, format, formatSurahs, selectedJuz]);

  const currentSurah = playbackQueue[queueIndex] ?? 1;
  const currentAudioUrl = getSurahAudioUrls(currentSurah)[audioSourceIndex];
  const currentSurahItem = surahs.find((surah) => surah.number === currentSurah);

  useEffect(() => {
    if (queueIndex <= playbackQueue.length - 1) return;
    setQueueIndex(0);
  }, [playbackQueue.length, queueIndex]);

  useEffect(() => {
    if (!isFullQuranPlaying || !fullQuranAudioRef.current) return;

    const playCurrent = async () => {
      fullQuranAudioRef.current?.load();
      try {
        await fullQuranAudioRef.current?.play();
        setIsPlaybackPaused(false);
      } catch {
        toast.error("অডিও চালু করতে ব্রাউজারের Play বাটনে ক্লিক করুন।");
        setIsFullQuranPlaying(false);
      }
    };

    void playCurrent();
  }, [audioSourceIndex, currentAudioUrl, isFullQuranPlaying]);

  useEffect(() => {
    if (!isFullQuranPlaying) return;
    setQueueIndex(0);
    setAudioSourceIndex(0);
    setEstimatedAyah(1);
    setIsPlaybackPaused(false);
  }, [format, isFullQuranPlaying, selectedJuz, selectedTopicId]);

  const handleToggleFullQuran = () => {
    if (!fullQuranAudioRef.current) return;

    if (isFullQuranPlaying) {
      fullQuranAudioRef.current.pause();
      setIsFullQuranPlaying(false);
      setIsPlaybackPaused(false);
      setEstimatedAyah(1);
      return;
    }

    if (playbackQueue.length === 0) {
      toast.error("এই ফরম্যাটে কোনো সূরা পাওয়া যায়নি।");
      return;
    }

    setQueueIndex(0);
    setAudioSourceIndex(0);
    setIsFullQuranPlaying(true);
    setIsPlaybackPaused(false);
  };

  const handleMiniPlayerPlayPause = async () => {
    if (!fullQuranAudioRef.current || !isFullQuranPlaying) return;

    if (fullQuranAudioRef.current.paused) {
      try {
        await fullQuranAudioRef.current.play();
        setIsPlaybackPaused(false);
      } catch {
        toast.error("অডিও চালু করতে ব্রাউজারের Play বাটনে ক্লিক করুন।");
      }
      return;
    }

    fullQuranAudioRef.current.pause();
    setIsPlaybackPaused(true);
  };

  const handleAudioTimeUpdate = () => {
    if (!fullQuranAudioRef.current || !currentSurahItem) return;

    const { currentTime, duration } = fullQuranAudioRef.current;
    if (!Number.isFinite(duration) || duration <= 0) {
      setEstimatedAyah(1);
      return;
    }

    const progress = Math.min(Math.max(currentTime / duration, 0), 1);
    const ayah = Math.max(1, Math.min(currentSurahItem.numberOfAyahs, Math.floor(progress * currentSurahItem.numberOfAyahs) + 1));
    setEstimatedAyah(ayah);
  };

  const handleFullQuranEnded = () => {
    if (queueIndex >= playbackQueue.length - 1) {
      setIsFullQuranPlaying(false);
      setIsPlaybackPaused(false);
      setEstimatedAyah(1);
      toast.success("আলহামদুলিল্লাহ, নির্বাচিত তিলাওয়াত প্লেলিস্ট সম্পন্ন হয়েছে।");
      return;
    }

    setQueueIndex((prev) => prev + 1);
    setAudioSourceIndex(0);
    setEstimatedAyah(1);
  };

  const handleFullQuranError = () => {
    const urls = getSurahAudioUrls(currentSurah);
    const nextSource = audioSourceIndex + 1;

    if (nextSource < urls.length) {
      setAudioSourceIndex(nextSource);
      return;
    }

    if (queueIndex < playbackQueue.length - 1) {
      setQueueIndex((prev) => prev + 1);
      setAudioSourceIndex(0);
      setEstimatedAyah(1);
      return;
    }

    setIsFullQuranPlaying(false);
    setIsPlaybackPaused(false);
    toast.error("এই মুহূর্তে পুরো কুরআন প্লেব্যাক চালানো যাচ্ছে না।");
  };

  return (
    <PageShell
      id="quran-read-title"
      title="কুরআন পড়ুন"
      subtitle="সুন্দর আরবি তিলাওয়াত, অনুবাদ ও আয়াতসহ কুরআন পড়ুন এবং অনুসন্ধান করুন।"
      actions={
        <div className="flex w-full flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            {FORMAT_OPTIONS.map((option) => (
              <Button
                key={option.value}
                type="button"
                variant={format === option.value ? "default" : "outline"}
                className="rounded-full"
                onClick={() => {
                  setFormat(option.value);
                  setIsFullQuranPlaying(false);
                }}
              >
                {option.label}
              </Button>
            ))}
          </div>

          {format === "juz" ? (
            <div className="flex flex-wrap gap-2">
              {JUZ_SURAH_RANGES.map((juz) => (
                <Button
                  key={juz.juz}
                  type="button"
                  size="sm"
                  variant={selectedJuz === juz.juz ? "default" : "outline"}
                  className="rounded-full"
                  onClick={() => {
                    setSelectedJuz(juz.juz);
                    setIsFullQuranPlaying(false);
                  }}
                >
                  পারা {toBanglaNumber(juz.juz)}
                </Button>
              ))}
            </div>
          ) : null}

          {format === "topic" ? (
            <div className="flex flex-wrap gap-2">
              {TOPIC_GROUPS.map((topic) => (
                <Button
                  key={topic.id}
                  type="button"
                  size="sm"
                  variant={selectedTopicId === topic.id ? "default" : "outline"}
                  className="rounded-full"
                  onClick={() => {
                    setSelectedTopicId(topic.id);
                    setIsFullQuranPlaying(false);
                  }}
                >
                  {topic.label}
                </Button>
              ))}
            </div>
          ) : null}

          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="সূরার নাম বা নম্বর দিয়ে খুঁজুন"
            aria-label="সূরা অনুসন্ধান"
            className="h-11 w-full max-w-md border-emerald-400/30 bg-white/20"
          />
          <Button onClick={handleToggleFullQuran} className="h-11 rounded-full bg-emerald-700 hover:bg-emerald-800">
            {isFullQuranPlaying
              ? `প্লেব্যাক বন্ধ করুন (সূরা ${currentSurah})`
              : format === "surah"
                ? "কুরআন তিলাওয়াত শুরু করুন"
                : "নির্বাচিত সূরা তিলাওয়াত শুরু করুন"}
          </Button>
        </div>
        </div>
      }
    >
      {isFullQuranPlaying ? (
        <GlassCard className="mb-4 flex items-center justify-between gap-3 border-emerald-400/30 bg-emerald-500/10 p-3 sm:p-4">
          <div>
            <p className="text-sm font-semibold">
              এখন তিলাওয়াত হচ্ছে: {getSurahNameBn(currentSurah, currentSurahItem?.englishName ?? `Surah ${currentSurah}`)}
            </p>
            <p className="text-xs text-muted-foreground">
              আনুমানিক আয়াত: {estimatedAyah}/{currentSurahItem?.numberOfAyahs ?? "-"}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            onClick={() => void handleMiniPlayerPlayPause()}
            aria-label={isPlaybackPaused ? "প্লে করুন" : "পজ করুন"}
          >
            {isPlaybackPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </Button>
        </GlassCard>
      ) : null}

      {loading ? (
        <DataPageSkeleton />
      ) : formatSurahs.length === 0 ? (
        <EmptyStateCard
          icon="search"
          title="কোনো সূরা পাওয়া যায়নি"
          description="আপনার খোঁজের সাথে মেলেনি। সূরার নম্বর বা ভিন্ন বানান ব্যবহার করে দেখুন।"
        />
      ) : (
        <MotionStagger className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {formatSurahs.map((surah) => (
            <MotionReveal key={surah.number}>
              <Link href={`/quran/${surah.number}`} prefetch={false}>
                <GlassCard className="interactive-lift h-full hover:border-emerald-500">
                  <p className="text-xs text-muted-foreground">সূরা {surah.number}</p>
                  <p className="mt-2 text-base font-semibold sm:text-lg">{getSurahNameBn(surah.number, surah.englishName)}</p>
                  <p className="arabic-text mt-2 text-right text-[1.65rem] text-amber-500 sm:text-2xl">{surah.name}</p>
                  <p className="mt-2 text-xs text-emerald-500">{surah.numberOfAyahs} আয়াত • {getRevelationTypeBn(surah.revelationType)}</p>
                </GlassCard>
              </Link>
            </MotionReveal>
          ))}
        </MotionStagger>
      )}

      <audio
        ref={fullQuranAudioRef}
        src={currentAudioUrl}
        preload="none"
        onPlay={() => setIsPlaybackPaused(false)}
        onPause={() => setIsPlaybackPaused(true)}
        onLoadedMetadata={() => setEstimatedAyah(1)}
        onTimeUpdate={handleAudioTimeUpdate}
        onEnded={handleFullQuranEnded}
        onError={handleFullQuranError}
      />
    </PageShell>
  );
}
