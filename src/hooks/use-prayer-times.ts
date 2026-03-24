"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { fetchPrayerTimes } from "@/lib/api";
import { PrayerTimesResponse } from "@/types/islamic";

const PRAYER_TIMES_CACHE_KEY_PREFIX = "noor-prayer-times-cache-v1";
const PRAYER_TIMES_CACHE_TTL_MS = 1000 * 60 * 15;

interface CachedPrayerTimes {
  data: PrayerTimesResponse;
  cachedAt: number;
}

function getCacheKey(latitude: number, longitude: number) {
  const lat = latitude.toFixed(3);
  const lng = longitude.toFixed(3);
  const date = new Date().toISOString().slice(0, 10);
  return `${PRAYER_TIMES_CACHE_KEY_PREFIX}:${date}:${lat}:${lng}`;
}

function readPrayerTimesCache(cacheKey: string): PrayerTimesResponse | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(cacheKey);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as CachedPrayerTimes;
    if (!parsed?.data || !parsed?.cachedAt) return null;
    if (Date.now() - parsed.cachedAt > PRAYER_TIMES_CACHE_TTL_MS) return null;

    return parsed.data;
  } catch {
    return null;
  }
}

function writePrayerTimesCache(cacheKey: string, data: PrayerTimesResponse) {
  if (typeof window === "undefined") return;

  try {
    const payload: CachedPrayerTimes = {
      data,
      cachedAt: Date.now(),
    };
    window.localStorage.setItem(cacheKey, JSON.stringify(payload));
  } catch {
    return;
  }
}

export function usePrayerTimes(latitude?: number, longitude?: number) {
  const [data, setData] = useState<PrayerTimesResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (latitude === undefined || longitude === undefined) return;

    const cacheKey = getCacheKey(latitude, longitude);
    const cachedData = readPrayerTimesCache(cacheKey);

    if (cachedData) {
      setData(cachedData);
    }

    const load = async () => {
      try {
        setLoading(!cachedData);
        const response = await fetchPrayerTimes(latitude, longitude);
        setData(response);
        writePrayerTimesCache(cacheKey, response);
      } catch {
        if (!cachedData) {
          toast.error("এই মুহূর্তে নামাজের সময়সূচি আনা যাচ্ছে না।");
        }
      } finally {
        setLoading(false);
      }
    };

    void load();
    // Refresh prayer times every 15 minutes (matching cache TTL)
    const refreshIntervalId = setInterval(() => {
      void load();
    }, PRAYER_TIMES_CACHE_TTL_MS);

    return () => clearInterval(refreshIntervalId);
  }, [latitude, longitude]);

  return { data, loading };
}
