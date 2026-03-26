"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/shared/glass-card";
import { getRamadanCountdownBySettings } from "@/utils/date";
import { useIslamicSettings } from "@/hooks/use-islamic-settings";
import { getRamadanWindows } from "@/lib/hijri-provider";

type RamadanSnapshot = {
  statusText: string;
  daysLeft: number;
  nextStartDate: string;
};

function formatBnDate(date: Date, country: "BD" | "SA") {
  return new Intl.DateTimeFormat("bn-BD", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: country === "SA" ? "Asia/Riyadh" : "Asia/Dhaka",
  }).format(date);
}

function buildRamadanSnapshot(settings: { country: "BD" | "SA"; moonSightingOffset: number }) {
  try {
    const now = new Date();
    const countdown = getRamadanCountdownBySettings(settings, now);
    const ramadanWindow = getRamadanWindows(settings, now);

    const statusText = countdown.isDuring
      ? "রমজান চলছে। আলহামদুলিল্লাহ।"
      : countdown.completed
        ? "এই বছরের রমজান শেষ হয়েছে।"
        : "আগামী রমজানের জন্য প্রস্তুতি নিন।";

    return {
      statusText,
      daysLeft: Math.max(0, countdown.days),
      nextStartDate: formatBnDate(new Date(ramadanWindow.start), settings.country),
    } as RamadanSnapshot;
  } catch {
    return {
      statusText: "আগামী রমজানের জন্য প্রস্তুতি নিন।",
      daysLeft: 0,
      nextStartDate: "--",
    } as RamadanSnapshot;
  }
}

export function RamadanCountdown() {
  const { settings } = useIslamicSettings();
  const [snapshot, setSnapshot] = useState<RamadanSnapshot>(() => buildRamadanSnapshot({
    country: "BD",
    moonSightingOffset: 0,
  }));

  useEffect(() => {
    // Set snapshot whenever settings change (includes initial load)
    setSnapshot(buildRamadanSnapshot(settings));

    // Also run every minute to update countdown
    const timer = window.setInterval(() => {
      setSnapshot(buildRamadanSnapshot(settings));
    }, 60_000);

    return () => window.clearInterval(timer);
  }, [settings]);

  return (
    <GlassCard>
      <h3 className="text-lg font-semibold sm:text-xl">রমজান প্রস্তুতি</h3>
      <p className="mt-3 text-sm text-emerald-500 sm:text-base">{snapshot.statusText}</p>

      <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-2 sm:gap-3">
        <div className="rounded-xl border border-emerald-300/20 bg-black/10 p-2.5 text-center sm:p-3">
          <p className="text-xl font-semibold text-emerald-500 sm:text-2xl">{snapshot.daysLeft}</p>
          <p className="text-xs uppercase text-muted-foreground">দিন বাকি</p>
        </div>
        <div className="rounded-xl border border-emerald-300/20 bg-black/10 p-2.5 text-center sm:p-3">
          <p className="text-sm font-semibold text-emerald-500 sm:text-base">{snapshot.nextStartDate}</p>
          <p className="text-xs uppercase text-muted-foreground">সম্ভাব্য শুরু</p>
        </div>
      </div>
    </GlassCard>
  );
}
