"use client";

import { useEffect } from "react";
import { GlassCard } from "@/components/shared/glass-card";
import { useGeolocation } from "@/hooks/use-geolocation";
import { usePrayerTimes } from "@/hooks/use-prayer-times";
import { LoadingGrid } from "@/components/shared/loading-grid";
import { Button } from "@/components/ui/button";
import {
  getForbiddenPrayerWindows,
  getNaflPrayerWindows,
  getNextPrayer,
  getPrayerWindows,
  sanitizePrayerTime,
} from "@/utils/prayer";
import { PageShell } from "@/components/shared/page-shell";
import { MotionReveal, MotionStagger } from "@/components/motion/motion-section";
import { usePrayerPlanner, type PrayerKey } from "@/hooks/use-prayer-planner";

const DEFAULT_COORDS = {
  latitude: 23.8103,
  longitude: 90.4125,
};

const PRAYER_LABELS: Record<string, string> = {
  Fajr: "ফজর",
  Dhuhr: "যোহর",
  Asr: "আসর",
  Maghrib: "মাগরিব",
  Isha: "এশা",
};

export default function PrayerTimesPage() {
  const planner = usePrayerPlanner();
  const { coordinates, loading: locationLoading, error, retry } = useGeolocation();
  const targetCoordinates = coordinates ?? DEFAULT_COORDS;
  const { data, loading } = usePrayerTimes(targetCoordinates.latitude, targetCoordinates.longitude);

  useEffect(() => {
    if (!planner.reminderEnabled || typeof window === "undefined") return;
    if (!("Notification" in window)) return;

    if (Notification.permission === "default") {
      void Notification.requestPermission();
    }
  }, [planner.reminderEnabled]);

  if ((locationLoading && !data) || loading) {
    return (
      <PageShell id="prayer-times-title" title="নামাজের সময়সূচি" subtitle="আপনার এলাকার নামাজের সময় লোড হচ্ছে...">
        <LoadingGrid />
      </PageShell>
    );
  }

  if (!data) {
    return (
      <PageShell id="prayer-times-title" title="নামাজের সময়সূচি" subtitle="আপনার অবস্থান পাওয়া যাচ্ছে না।">
        <GlassCard>
          <p className="text-sm text-muted-foreground">
            এই মুহূর্তে নামাজের সময় লোড করা যায়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।
          </p>
        </GlassCard>
      </PageShell>
    );
  }

  const nextPrayer = getNextPrayer(data.data.timings);
  const prayerWindows = getPrayerWindows(data.data.timings);
  const naflWindows = getNaflPrayerWindows(data.data.timings);
  const forbiddenWindows = getForbiddenPrayerWindows(data.data.timings);

  return (
    <PageShell
      id="prayer-times-title"
      title="নামাজের সময়সূচি"
      subtitle={`${data.data.date.readable} • ${data.data.date.hijri.date} (${data.data.meta.timezone})`}
    >
      {error ? (
        <GlassCard className="flex flex-wrap items-center justify-between gap-3 border-amber-400/30 bg-amber-500/10">
          <p className="text-sm text-amber-100">লোকেশন পাওয়া যায়নি, আপাতত ডিফল্ট লোকেশন (ঢাকা) অনুযায়ী সময় দেখানো হচ্ছে।</p>
          <Button variant="outline" size="sm" onClick={() => retry()}>
            লোকেশন আবার নিন
          </Button>
        </GlassCard>
      ) : null}

      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
        এখনকার নামাজ: <span className="font-semibold text-emerald-100">{PRAYER_LABELS[nextPrayer] ?? nextPrayer}</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
        <GlassCard className="border-amber-500/30 bg-amber-500/10 p-4 sm:p-5">
          <p className="text-xs uppercase tracking-wide text-amber-300/90">সাহরির শেষ সময়</p>
          <p className="mt-2 text-2xl font-semibold text-amber-200 sm:text-3xl">{sanitizePrayerTime(data.data.timings.Fajr)}</p>
          <p className="mt-1 text-xs text-muted-foreground">ফজরের সময় শুরু হওয়ার সাথে সাথে সাহরি শেষ।</p>
        </GlassCard>

        <GlassCard className="border-emerald-500/30 bg-emerald-500/10 p-4 sm:p-5">
          <p className="text-xs uppercase tracking-wide text-emerald-300/90">ইফতারের শুরুর সময়</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-200 sm:text-3xl">{sanitizePrayerTime(data.data.timings.Maghrib)}</p>
          <p className="mt-1 text-xs text-muted-foreground">মাগরিব শুরু হওয়ার সাথে সাথে ইফতার করা যায়।</p>
        </GlassCard>
      </div>

      <MotionStagger className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {prayerWindows.map((prayer) => {
          const isNext = prayer.key === nextPrayer;
          return (
            <MotionReveal key={prayer.key}>
              <GlassCard className={isNext ? "border-emerald-500 bg-emerald-500/10" : "border-emerald-400/20"}>
                <p className="text-xs text-muted-foreground sm:text-sm">{prayer.label}</p>
                <p className="mt-2 text-2xl font-semibold text-amber-500 sm:text-3xl">
                  {sanitizePrayerTime(prayer.start)}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">শুরু: {prayer.start}</p>
                <p className="text-xs text-muted-foreground">শেষ: {prayer.end}</p>
              </GlassCard>
            </MotionReveal>
          );
        })}
      </MotionStagger>

      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard className="space-y-3 p-5 sm:p-7">
          <h3 className="text-xl font-semibold">নফল নামাজ সমূহ</h3>
          <div className="space-y-2 text-sm">
            {naflWindows.map((window) => (
              <div key={window.key} className="rounded-lg border border-emerald-400/20 px-3 py-2">
                <p className="font-medium text-emerald-500">{window.label}</p>
                <p className="text-muted-foreground">শুরু: {window.start} • শেষ: {window.end}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="space-y-3 p-5 sm:p-7">
          <h3 className="text-xl font-semibold">নামাজের নিষিদ্ধ সময়</h3>
          <div className="space-y-2 text-sm">
            {forbiddenWindows.map((window) => (
              <div key={window.key} className="rounded-lg border border-red-400/20 px-3 py-2">
                <p className="font-medium text-red-300">{window.label}</p>
                <p className="text-muted-foreground">শুরু: {window.start} • শেষ: {window.end}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard className="space-y-4 p-5 sm:p-7">
        <h3 className="text-xl font-semibold">মিসড সালাত ট্র্যাকার</h3>
        <p className="text-sm text-muted-foreground">আজ কোন কোন ফরজ কাজা হয়েছে তা টিক দিন, নিচে ধীরে কাযা পরিকল্পনা দেখাবে।</p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(PRAYER_LABELS) as PrayerKey[]).map((prayer) => {
            const active = planner.missedToday.includes(prayer);
            return (
              <Button
                key={prayer}
                variant={active ? "default" : "outline"}
                className="rounded-full"
                onClick={() => planner.toggleMissed(prayer)}
              >
                {PRAYER_LABELS[prayer]}
              </Button>
            );
          })}
        </div>
        <p className="rounded-lg border border-emerald-400/20 px-3 py-2 text-sm text-muted-foreground">{planner.recoveryPlan}</p>
      </GlassCard>

      <GlassCard className="space-y-4 p-5 sm:p-7">
        <h3 className="text-xl font-semibold">সুন্নাহ/নফল রিমাইন্ডার</h3>
        <p className="text-sm text-muted-foreground">নোটিফিকেশন অন করলে নফল উইন্ডো মনে করিয়ে দিতে পারবে (ব্রাউজার অনুমতি প্রয়োজন)।</p>
        <Button variant={planner.reminderEnabled ? "default" : "outline"} className="rounded-full" onClick={planner.toggleReminder}>
          {planner.reminderEnabled ? "রিমাইন্ডার চালু" : "রিমাইন্ডার বন্ধ"}
        </Button>
      </GlassCard>

      <GlassCard className="space-y-4 p-5 sm:p-7">
        <h3 className="text-xl font-semibold">উপকারী সুন্নাহ স্মরণিকা</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          “আল্লাহর কাছে সবচেয়ে প্রিয় আমল হলো যা নিয়মিত করা হয়, যদিও তা সামান্য হয়।” (বুখারি)
        </p>
      </GlassCard>
    </PageShell>
  );
}
