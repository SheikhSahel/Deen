export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface PrayerTimings {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  Sunrise?: string;
}

export interface PrayerTimesResponse {
  data: {
    timings: PrayerTimings;
    date: {
      readable: string;
      gregorian?: {
        weekday?: {
          en?: string;
        };
      };
      hijri: {
        date: string;
        month: { en: string; number: number };
        year: string;
      };
    };
    meta: {
      timezone: string;
    };
  };
}

export interface SurahItem {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  numberOfAyahs: number;
}

export interface SurahListResponse {
  data: SurahItem[];
}

export interface SurahEdition {
  englishName: string;
  identifier: string;
  name: string;
  type: string;
  format: string;
  direction: string;
  language: string;
}

export interface SurahAyah {
  numberInSurah: number;
  text: string;
  audio?: string;
}

export interface SurahDetailItem {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  numberOfAyahs: number;
  edition: SurahEdition;
  ayahs: SurahAyah[];
}

export interface SurahDetailResponse {
  data: SurahDetailItem[];
}

export interface HadithCollection {
  id: string;
  name: string;
  available: number;
}

export interface HadithItem {
  number: number;
  arab: string;
  id: string;
}

export interface HadithResponse {
  data: {
    name: string;
    id: string;
    available: number;
    requested: number;
    hadiths: HadithItem[];
  };
}
