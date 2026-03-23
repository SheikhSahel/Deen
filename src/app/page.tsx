import { HeroSection } from "@/components/home/hero-section";
import { SectionHeader } from "@/components/shared/section-header";
import { MotionReveal, MotionStagger } from "@/components/motion/motion-section";
import { Skeleton } from "@/components/ui/skeleton";
import { ChecklistPlanner } from "@/components/shared/checklist-planner";
import { RamadanCountdown } from "@/components/home/ramadan-countdown";
import dynamic from "next/dynamic";

const CountdownSkeleton = () => <Skeleton className="h-40 rounded-2xl" />;
const DuaSkeleton = () => <Skeleton className="h-44 rounded-2xl" />;

const DailyQuote = dynamic(() => import("@/components/home/daily-quote").then((mod) => mod.DailyQuote), {
  loading: CountdownSkeleton,
});
const DailyDua = dynamic(() => import("@/components/home/daily-dua").then((mod) => mod.DailyDua), {
  loading: DuaSkeleton,
});

export default function Home() {
  return (
    <MotionStagger className="space-y-8 sm:space-y-10 md:space-y-12">
      <MotionReveal>
        <HeroSection />
      </MotionReveal>

      <MotionReveal>
        <section className="section-shell">
          <SectionHeader
            title="দৈনিক ইবাদতের প্রয়োজনীয় অংশ"
            subtitle="রিয়েল-টাইম টুল ও দৈনিক স্মরণিকার মাধ্যমে দ্বীনের সাথে সংযুক্ত থাকুন।"
          />
          <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
            <RamadanCountdown />
            <DailyQuote />
          </div>
          <div className="mt-4">
            <ChecklistPlanner
              title="রমজান প্ল্যানার"
              storageKey="noor-ramadan-planner"
              items={[
                { id: "fajr-jamaat", label: "ফজর জামাতে আদায়" },
                { id: "quran-tilawah", label: "কমপক্ষে ১ রুকু তিলাওয়াত" },
                { id: "charity", label: "সাদাকাহ / সহায়তা" },
                { id: "iftar-dua", label: "ইফতারের পূর্বে দু‘আ" },
                { id: "taraweeh", label: "তারাবিহ আদায়" },
              ]}
            />
          </div>
        </section>
      </MotionReveal>

      <MotionReveal>
        <section className="section-shell">
          <SectionHeader title="আজকের দু‘আ" subtitle="লোকেশন বা অতিরিক্ত API ছাড়াই তাৎক্ষণিকভাবে আপডেট হওয়া নির্বাচিত দু‘আ।" />
          <DailyDua />
        </section>
      </MotionReveal>
    </MotionStagger>
  );
}
