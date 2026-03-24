"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Book, BookOpen, Building2, CircleHelp, GraduationCap, Hand, Map } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { ChecklistPlanner } from "@/components/shared/checklist-planner";
import { PageShell } from "@/components/shared/page-shell";
import { MotionReveal, MotionStagger } from "@/components/motion/motion-section";

const MAKKAH_TIMEZONE = "Asia/Riyadh";
const LIVE_BROADCAST_SOURCES = [
  {
    id: "makkah-haram",
    label: "মক্কা লাইভ - আল-হারাম আল-মক্কি",
    description: "মক্কার পবিত্র মসজিদের সরাসরি লাইভ সম্প্রচার",
    embedUrl: "https://www.youtube.com/embed/H5D7gPbnLrY",
  },
  {
    id: "madinah-haram",
    label: "মদিনা লাইভ",
    description: "মদিনার মসজিদে নববীর সরাসরি লাইভ সম্প্রচার",
    embedUrl: "https://www.youtube.com/embed/NOmU_zOKZpE",
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
  const [selectedBroadcastId, setSelectedBroadcastId] = useState<(typeof LIVE_BROADCAST_SOURCES)[number]["id"]>(
    "makkah-haram"
  );
  const selectedBroadcast = LIVE_BROADCAST_SOURCES.find((source) => source.id === selectedBroadcastId) ?? LIVE_BROADCAST_SOURCES[0];

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

      <div className="mb-8 space-y-4">
        <div className="rounded-2xl border border-emerald-400/20 bg-black/30 shadow-lg">
          <div className="px-4 py-3 sm:px-6">
            <h3 className="text-base font-semibold text-emerald-500 sm:text-lg">পবিত্র মসজিদের লাইভ সম্প্রচার</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              মক্কা এবং মদিনার পবিত্র মসজিদগুলির সরাসরি লাইভ সম্প্রচার দেখুন
            </p>
          </div>
          <div className="border-t border-emerald-400/20 px-4 py-4 sm:px-6">
            <div className="mb-4 flex flex-wrap gap-2">
              {LIVE_BROADCAST_SOURCES.map((source) => (
                <button
                  key={source.id}
                  onClick={() => setSelectedBroadcastId(source.id)}
                  className={
                    selectedBroadcast.id === source.id
                      ? "rounded-md border border-emerald-500 bg-emerald-500/20 px-3 py-2 text-sm font-medium text-emerald-200 transition-colors"
                      : "rounded-md border border-emerald-400/30 bg-emerald-400/5 px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-emerald-400/50 hover:text-emerald-300"
                  }
                >
                  {source.label}
                </button>
              ))}
            </div>
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
              <iframe
                key={selectedBroadcast.id}
                className="h-full w-full"
                src={selectedBroadcast.embedUrl}
                title={selectedBroadcast.label}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              <strong>{selectedBroadcast.label}:</strong> {selectedBroadcast.description}
            </p>
          </div>
        </div>
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


