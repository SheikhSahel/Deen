import axios from "axios";
import {
  HadithResponse,
  PrayerTimesResponse,
  SurahDetailResponse,
  SurahListResponse,
} from "@/types/islamic";

const quranApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_QURAN_API ?? "https://api.alquran.cloud/v1",
  timeout: 10000,
});

const hadithApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_HADITH_API ?? "https://api.hadith.gading.dev",
  timeout: 10000,
});

export async function fetchPrayerTimes(latitude: number, longitude: number) {
  const { data } = await axios.get<PrayerTimesResponse>("/api/prayer-times", {
    params: { latitude, longitude },
  });
  return data;
}

export async function fetchSurahs() {
  const { data } = await quranApi.get<SurahListResponse>("/surah");
  return data;
}

export async function fetchSurahDetails(surahId: string) {
  const { data } = await quranApi.get<SurahDetailResponse>(
    `/surah/${surahId}/editions/quran-uthmani,bn.bengali,en.asad,ar.alafasy`,
  );
  return data;
}

export async function fetchHadithCollections() {
  const { data } = await hadithApi.get<{ data: { name: string; id: string; available: number }[] }>(
    "/books",
  );
  return data.data;
}

export async function fetchHadithByCollection(collectionId: string, page: number) {
  const start = (page - 1) * 10 + 1;
  const end = start + 9;
  const { data } = await hadithApi.get<HadithResponse>(`/books/${collectionId}`, {
    params: { range: `${start}-${end}` },
  });
  return data;
}
