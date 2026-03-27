"use client";

import { useGeolocation } from "@/hooks/use-geolocation";
import { usePrayerTimes } from "@/hooks/use-prayer-times";
import { GlassCard } from "@/components/shared/glass-card";
import { PRAYER_ORDER, formatPrayerTime12Hour, getNextPrayer, getPrayerLabel, isFridayPrayerDay } from "@/utils/prayer";
import { Skeleton } from "@/components/ui/skeleton";

export function PrayerPreview() {
  const { coordinates, loading: locationLoading, error } = useGeolocation();
  const { data, loading } = usePrayerTimes(coordinates?.latitude, coordinates?.longitude);

  if (locationLoading || loading) {
    return (
      <GlassCard>
        <h3 className="text-lg font-semibold sm:text-xl">নামাজের সময়ের প্রিভিউ</h3>
        <p className="mt-2 text-sm text-muted-foreground">লোকেশন থেকে সময়সূচি আনা হচ্ছে...</p>
        <div className="mt-4 space-y-2">
          <Skeleton className="h-5 w-full rounded-lg" />
          <Skeleton className="h-5 w-full rounded-lg" />
          <Skeleton className="h-5 w-2/3 rounded-lg" />
        </div>
      </GlassCard>
    );
  }

  if (error || !data) {
    return (
      <GlassCard>
        <h3 className="text-lg font-semibold sm:text-xl">নামাজের সময়ের প্রিভিউ</h3>
        <p className="mt-2 text-sm text-muted-foreground">আজকের সময়সূচি দেখতে লোকেশন চালু করুন।</p>
      </GlassCard>
    );
  }

  const isFriday = isFridayPrayerDay(data.data.date.gregorian?.weekday?.en);
  const nextPrayer = getNextPrayer(data.data.timings, isFriday);

  return (
    <GlassCard>
      <h3 className="text-lg font-semibold sm:text-xl">নামাজের সময়ের প্রিভিউ</h3>
      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-5 sm:gap-3">
        {PRAYER_ORDER.map((prayer) => {
          const isNext = prayer === nextPrayer;
          return (
            <div
              key={prayer}
              className={`rounded-xl border p-2.5 text-center sm:p-3 ${
                isNext
                  ? "border-emerald-500 bg-emerald-500/10"
                  : "border-emerald-300/20 bg-black/10"
              }`}
            >
              <p className="text-xs font-medium sm:text-sm">{getPrayerLabel(prayer, isFriday)}</p>
              <p className="mt-1 text-base font-semibold text-amber-500 sm:text-lg">
                {formatPrayerTime12Hour(data.data.timings[prayer])}
              </p>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
