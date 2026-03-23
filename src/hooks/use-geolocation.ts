"use client";

import { useCallback, useEffect, useState } from "react";
import { Coordinates } from "@/types/islamic";

interface GeolocationState {
  coordinates: Coordinates | null;
  loading: boolean;
  error: string | null;
  isFallback: boolean;
}

const GEOLOCATION_CACHE_KEY = "noor-geolocation-cache-v1";
const GEOLOCATION_CACHE_TTL_MS = 1000 * 60 * 60 * 12;

interface CachedGeolocation {
  coordinates: Coordinates;
  cachedAt: number;
}

function readCachedGeolocation(): Coordinates | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(GEOLOCATION_CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as CachedGeolocation;
    if (!parsed?.coordinates || !parsed?.cachedAt) return null;
    if (Date.now() - parsed.cachedAt > GEOLOCATION_CACHE_TTL_MS) return null;

    return parsed.coordinates;
  } catch {
    return null;
  }
}

function writeCachedGeolocation(coordinates: Coordinates) {
  if (typeof window === "undefined") return;

  try {
    const payload: CachedGeolocation = {
      coordinates,
      cachedAt: Date.now(),
    };
    window.localStorage.setItem(GEOLOCATION_CACHE_KEY, JSON.stringify(payload));
  } catch {
    return;
  }
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    loading: true,
    error: null,
    isFallback: true,
  });

  const requestLocation = useCallback(() => {
    const cachedCoordinates = readCachedGeolocation();

    if (!navigator.geolocation) {
      setState({
        coordinates: cachedCoordinates,
        loading: false,
        error: cachedCoordinates ? null : "আপনার ব্রাউজারে জিওলোকেশন সমর্থিত নয়।",
        isFallback: !cachedCoordinates,
      });
      return;
    }

    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
    }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        writeCachedGeolocation(coordinates);

        setState({
          coordinates,
          loading: false,
          error: null,
          isFallback: false,
        });
      },
      () => {
        if (cachedCoordinates) {
          setState({
            coordinates: cachedCoordinates,
            loading: false,
            error: null,
            isFallback: false,
          });
          return;
        }

        setState({
          coordinates: null,
          loading: false,
          error: "লোকেশন অনুমতি দেওয়া হয়নি। সঠিক ফলাফলের জন্য লোকেশন চালু করুন।",
          isFallback: true,
        });
      },
      { enableHighAccuracy: false, timeout: 7000, maximumAge: 1000 * 60 * 30 },
    );
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return {
    ...state,
    retry: requestLocation,
  };
}
