"use client";

import Link from "next/link";
import Hls from "hls.js";
import { useEffect, useMemo, useRef, useState } from "react";
import { Book, BookOpen, Building2, CircleHelp, GraduationCap, Hand, Map } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { ChecklistPlanner } from "@/components/shared/checklist-planner";
import { PageShell } from "@/components/shared/page-shell";
import { MotionReveal, MotionStagger } from "@/components/motion/motion-section";

const MAKKAH_TIMEZONE = "Asia/Riyadh";
const LIVE_STREAMS = [
  {
    id: "quran-tv",
    label: "কুরআন টিভি লাইভ",
    hlsUrl: "https://win.holol.com/live/quran/playlist.m3u8",
  },
  {
    id: "sunnah-tv",
    label: "সুন্নাহ টিভি লাইভ",
    hlsUrl: "https://win.holol.com/live/sunnah/playlist.m3u8",
  },
] as const;

const SECTION_CARDS = [
  {
    id: "books",
    label: "হজ্ব-উমরা বই",
    icon: Book,
    href: "/hajj-umrah/books",
  },
  {
    id: "hajj-visual",
    label: "সচিত্র হজ্ব",
    icon: Map,
    href: "/hajj-umrah/hajj-visual",
  },
  {
    id: "umrah-visual",
    label: "সচিত্র উমরা",
    icon: Map,
    href: "/hajj-umrah/umrah-visual",
  },
  {
    id: "dua",
    label: "দু'আ",
    icon: Hand,
    href: "/hajj-umrah/dua",
  },
  {
    id: "masail",
    label: "মাসাইল",
    icon: CircleHelp,
    href: "/hajj-umrah/masail",
  },
  {
    id: "kitab",
    label: "কিতাব",
    icon: BookOpen,
    href: "/hajj-umrah/kitab",
  },
  {
    id: "training",
    label: "হজ্ব প্রশিক্ষণ",
    icon: GraduationCap,
    href: "/hajj-umrah/training",
  },
  {
    id: "agency",
    label: "হজ্ব এজেন্সি",
    icon: Building2,
    href: "/hajj-umrah/agency",
  },
];

export default function HajjUmrahPage() {
  const [dhakaTime, setDhakaTime] = useState<string>("--:--");
  const [makkaTime, setMakkaTime] = useState<string>("--:--");
  const [selectedStreamId, setSelectedStreamId] = useState<(typeof LIVE_STREAMS)[number]["id"]>("quran-tv");
  const [streamError, setStreamError] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const selectedStream = useMemo(
    () => LIVE_STREAMS.find((stream) => stream.id === selectedStreamId) ?? LIVE_STREAMS[0],
    [selectedStreamId],
  );

  useEffect(() => {
    const updateTime = () => {
      const dhakaFormatter = new Intl.DateTimeFormat("bn-BD", {
        timeZone: "Asia/Dhaka",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      const makkaFormatter = new Intl.DateTimeFormat("bn-BD", {
        timeZone: MAKKAH_TIMEZONE,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      const now = new Date();
      setDhakaTime(dhakaFormatter.format(now));
      setMakkaTime(makkaFormatter.format(now));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setStreamError("");

    let hls: Hls | null = null;
    const handleVideoError = () => {
      setStreamError("লাইভ ভিডিও এই মুহূর্তে চালু করা যাচ্ছে না। কুরআন/সুন্নাহ সোর্স পরিবর্তন করে আবার চেষ্টা করুন।");
    };

    video.addEventListener("error", handleVideoError);

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = selectedStream.hlsUrl;
      void video.play().catch(() => {
        // Ignore autoplay restrictions; user can press play manually.
      });
    } else if (Hls.isSupported()) {
      hls = new Hls({ lowLatencyMode: true });
      hls.loadSource(selectedStream.hlsUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          handleVideoError();
        }
      });
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        void video.play().catch(() => {
          // Ignore autoplay restrictions; user can press play manually.
        });
      });
    } else {
      setStreamError("আপনার ব্রাউজারে লাইভ HLS স্ট্রিম সমর্থিত নয়।");
    }

    return () => {
      video.removeEventListener("error", handleVideoError);
      if (hls) {
        hls.destroy();
      }
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, [selectedStream]);

  return (
    <PageShell
      id="hajj-title"
      title="হজ্ব ও উমরা"
      subtitle="হজ্ব এবং উমরা সম্পর্কে সম্পূর্ণ তথ্য, প্রশিক্ষণ এবং গাইডেন্স।"
    >
      {/* Time Display */}
      <div className="mb-8 rounded-xl border border-emerald-400/20 bg-gradient-to-r from-emerald-500/5 to-blue-500/5 px-6 py-4">
        <p className="space-x-4 text-center text-lg font-semibold">
          <span>ঢাকা: {dhakaTime}</span>
          <span>|</span>
          <span>মক্কা: {makkaTime}</span>
        </p>
      </div>

      <div className="mb-8 overflow-hidden rounded-2xl border border-emerald-400/20 bg-black/30 shadow-lg">
        <div className="border-b border-emerald-400/20 px-4 py-3 sm:px-6">
          <h3 className="text-base font-semibold text-emerald-500 sm:text-lg">মক্কার লাইভ সম্প্রচার</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {LIVE_STREAMS.map((stream) => (
              <button
                key={stream.id}
                type="button"
                onClick={() => setSelectedStreamId(stream.id)}
                className={
                  selectedStream.id === stream.id
                    ? "rounded-md border border-emerald-500 bg-emerald-500/15 px-3 py-1 text-xs text-emerald-400"
                    : "rounded-md border border-emerald-400/30 px-3 py-1 text-xs text-muted-foreground hover:bg-emerald-500/10"
                }
              >
                {stream.label}
              </button>
            ))}
          </div>
        </div>
        <div className="relative aspect-video w-full overflow-hidden">
          <video
            ref={videoRef}
            className="h-full w-full bg-black"
            controls
            autoPlay
            muted
            playsInline
            aria-label="মক্কার লাইভ সম্প্রচার"
          />
        </div>
        {streamError ? (
          <div className="border-t border-emerald-400/20 px-4 py-3 text-sm text-amber-400 sm:px-6">{streamError}</div>
        ) : null}
      </div>

      <GlassCard className="mb-8">
        <ChecklistPlanner
          title="হজ্ব প্রস্তুতি প্ল্যানার"
          storageKey="noor-hajj-planner"
          items={[
            { id: "passport-visa", label: "পাসপোর্ট, ভিসা ও টিকিট প্রস্তুত" },
            { id: "vaccination", label: "ভ্যাকসিন/স্বাস্থ্য প্রস্তুতি সম্পন্ন" },
            { id: "miqat-learning", label: "মীকাত ও ইহরামের বিধান রিভিউ" },
            { id: "dua-memorize", label: "প্রয়োজনীয় দু‘আ মুখস্থ" },
            { id: "agency-verify", label: "এজেন্সি লাইসেন্স যাচাই" },
          ]}
        />
      </GlassCard>

      {/* Main Section Cards Grid */}
      <MotionStagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECTION_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <MotionReveal key={card.id}>
              <Link href={card.href} className="block">
                <GlassCard className="flex h-full flex-col items-center gap-4 text-center transition-all hover:bg-emerald-600/10">
                  <Icon className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-base font-semibold">{card.label}</h3>
                </GlassCard>
              </Link>
            </MotionReveal>
          );
        })}
      </MotionStagger>
    </PageShell>
  );
}


