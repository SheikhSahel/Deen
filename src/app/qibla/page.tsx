"use client";

import { useEffect, useMemo, useState } from "react";
import { GlassCard } from "@/components/shared/glass-card";
import { useGeolocation } from "@/hooks/use-geolocation";
import { getQiblaDirection } from "@/utils/qibla";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/shared/page-shell";
import { MotionReveal } from "@/components/motion/motion-section";
import { CompassSkeleton, EmptyStateCard } from "@/components/shared/async-state";

type IOSPermissionEvent = {
  requestPermission?: () => Promise<"granted" | "denied">;
};

export default function QiblaPage() {
  const { coordinates, error, loading, retry } = useGeolocation();
  const [heading, setHeading] = useState(0);

  const qiblaDirection = useMemo(() => {
    if (!coordinates) return null;
    return getQiblaDirection(coordinates.latitude, coordinates.longitude);
  }, [coordinates]);

  useEffect(() => {
    const listener = (event: DeviceOrientationEvent) => {
      if (typeof event.alpha === "number") {
        setHeading(event.alpha);
      }
    };

    window.addEventListener("deviceorientation", listener, true);
    return () => window.removeEventListener("deviceorientation", listener, true);
  }, []);

  const requestIosPermission = async () => {
    const handler = DeviceOrientationEvent as unknown as IOSPermissionEvent;
    if (typeof handler.requestPermission === "function") {
      await handler.requestPermission();
    }
  };

  return (
    <PageShell
      id="qibla-title"
      title="কিবলা দিকনির্দেশনা"
      subtitle="কম্পাস ও লোকেশন ব্যবহার করে আপনার নামাজের দিক নির্ধারণ করুন।"
    >
      {loading ? <CompassSkeleton /> : null}
      <MotionReveal>
        <GlassCard className={`space-y-6 ${loading ? "hidden" : ""}`}>
          <Button variant="outline" className="rounded-full" onClick={() => void requestIosPermission()}>
            কম্পাস চালু করুন (iOS)
          </Button>

          <Button variant="outline" className="rounded-full" onClick={() => retry()}>
            লোকেশন আবার নিন
          </Button>

          {error ? <p className="text-sm text-muted-foreground">{error}</p> : null}

          {qiblaDirection !== null ? (
            <div className="flex flex-col items-center gap-4">
              <div className="relative flex h-56 w-56 items-center justify-center rounded-full border-4 border-emerald-500/40 sm:h-64 sm:w-64">
                <div
                  className="absolute h-1 w-20 origin-left rounded bg-amber-500 sm:w-24"
                  style={{ transform: `rotate(${qiblaDirection - heading}deg)` }}
                  aria-label="কিবলা নির্দেশক"
                />
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">কিবলা কোণ</p>
                  <p className="text-2xl font-semibold text-emerald-500">{qiblaDirection.toFixed(1)}°</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">সোনালি নির্দেশকটি উপরের দিকে আসা পর্যন্ত ডিভাইস ঘুরান।</p>
            </div>
          ) : (
            <EmptyStateCard
              icon="compass"
              title="কম্পাস প্রস্তুত নয়"
              description="কিবলার দিক নির্ণয় করতে লোকেশন অনুমতি দিন এবং ডিভাইস ধীরে নাড়ান।"
            />
          )}
        </GlassCard>
      </MotionReveal>
    </PageShell>
  );
}
