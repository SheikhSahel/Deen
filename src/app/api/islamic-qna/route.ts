import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

type QnaRole = "user" | "assistant";

type QnaMessage = {
  role: QnaRole;
  content: string;
};

type QnaRequest = {
  question?: string;
  history?: QnaMessage[];
  citationsMode?: boolean;
};

type ProviderContentPart = {
  type?: string;
  text?: string;
};

type ProviderChoice = {
  message?: {
    content?: string | ProviderContentPart[];
  };
  text?: string;
};

function extractAnswer(choices?: ProviderChoice[]) {
  const firstChoice = choices?.[0];
  if (!firstChoice) return "";

  const content = firstChoice.message?.content;

  if (typeof content === "string") {
    return content.trim();
  }

  if (Array.isArray(content)) {
    const combined = content
      .map((part) => (typeof part.text === "string" ? part.text : ""))
      .join("\n")
      .trim();

    if (combined) return combined;
  }

  if (typeof firstChoice.text === "string") {
    return firstChoice.text.trim();
  }

  return "";
}

const AI_API_BASE_URL = process.env.AI_API_BASE_URL ?? "https://openrouter.ai/api/v1/chat/completions";
const ALADHAN_BASE = process.env.NEXT_PUBLIC_ALADHAN_API ?? "https://api.aladhan.com/v1";
const AI_MODEL = process.env.AI_MODEL ?? "openai/gpt-4o-mini";
const AI_API_KEY = process.env.AI_API_KEY;
const PROVIDER_TIMEOUT_MS = 25000;
const PROVIDER_MAX_ATTEMPTS = 2;
const DHAKA_TIMEZONE = "Asia/Dhaka";

const HIJRI_MONTHS_BN: Record<string, string> = {
  Muharram: "মুহাররম",
  Safar: "সফর",
  "Rabi Al-Awwal": "রবিউল আউয়াল",
  "Rabi Al-Thani": "রবিউস সানি",
  "Jumada Al-Awwal": "জুমাদাল উলা",
  "Jumada Al-Akhirah": "জুমাদাস সানিয়া",
  Rajab: "রজব",
  Shaaban: "শাবান",
  Ramadan: "রমজান",
  Shawwal: "শাওয়াল",
  "Dhul Qadah": "জিলকদ",
  "Dhul Hijjah": "জিলহজ্জ",
};

function shouldRetryStatus(status: number) {
  return status === 408 || status === 429 || status >= 500;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildFallbackAnswer(question: string, citationsMode: boolean) {
  const q = question.toLowerCase();

  let core = "সংক্ষিপ্ত উত্তর: নিয়ত ঠিক রেখে কুরআন-সুন্নাহ অনুযায়ী আমল করুন।";

  if (q.includes("roza") || q.includes("ramadan") || q.includes("রমজান") || q.includes("রোজা") || q.includes("সিয়াম") || q.includes("সাওম")) {
    core = "রমজানে রোজার সংখ্যা আগেভাগে নির্দিষ্টভাবে বলা যায় না। চাঁদ দেখার উপর নির্ভর করে তা ২৯ বা ৩০টি হয়। তাই ২০২৬ সালের ক্ষেত্রেও চূড়ান্ত সংখ্যা হবে ২৯ বা ৩০।";
  } else if (q.includes("নামাজ") || q.includes("সালাত") || q.includes("সালাহ")) {
    core = "নামাজের ক্ষেত্রে সময়, পবিত্রতা, কিবলামুখী হওয়া এবং সঠিক রুকন বজায় রাখা ফরজ আদায়ের মূল শর্ত।";
  } else if (q.includes("যাকাত") || q.includes("zakat")) {
    core = "যাকাতে নিসাব, বছর পূর্ণ হওয়া এবং যাকাতযোগ্য সম্পদের সঠিক হিসাব করা অপরিহার্য।";
  } else if (q.includes("হজ") || q.includes("উমরা")) {
    core = "হজ/উমরায় ইহরাম, তাওয়াফ, সাঈ ও নির্ধারিত নিয়মগুলো ধারাবাহিকভাবে পালন করতে হয়।";
  }

  const sourceLine = citationsMode
    ? "সূত্র: কুরআন-সুন্নাহর সাধারণ নীতি ও স্বীকৃত ফিকহি ব্যাখ্যা।\n"
    : "";

  return `${core}\n\n${sourceLine}মাযহাবি নোট: প্রয়োগের সূক্ষ্ম বিষয়ে মাযহাবভেদে পার্থক্য থাকতে পারে।`;
}

function normalizeAnswerStyle(answer: string, citationsMode: boolean) {
  let cleaned = answer.trim();

  cleaned = cleaned
    .replace(/\n?অনিশ্চয়তা নোট:[^\n]*/gi, "")
    .replace(/\n?AI উত্তরে ভুল থাকতে পারে[^\n]*/gi, "")
    .replace(/\n?চূড়ান্ত আমলের আগে[^\n]*/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (citationsMode && !cleaned.includes("সূত্র:")) {
    cleaned = `${cleaned}\n\nসূত্র: কুরআন, সহিহ হাদিস, এবং স্বীকৃত ফিকহি ব্যাখ্যা।`;
  }

  if (!cleaned.includes("মাযহাবি নোট:")) {
    cleaned = `${cleaned}\n\nমাযহাবি নোট: প্রয়োগের সূক্ষ্ম ক্ষেত্রে মাযহাবভেদে পার্থক্য থাকতে পারে।`;
  }

  return cleaned;
}

function normalizeDigits(value: string) {
  return value
    .replace(/[০-৯]/g, (digit) => String("০১২৩৪৫৬৭৮৯".indexOf(digit)))
    .toLowerCase();
}

function toBanglaDigits(value: string | number) {
  return String(value).replace(/[0-9]/g, (digit) => "০১২৩৪৫৬৭৮৯"[Number(digit)]);
}

function parseHHMM(time: string) {
  const [hours, minutes] = time.slice(0, 5).split(":").map(Number);
  return { hours, minutes };
}

function getDhakaNowParts() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: DHAKA_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const year = Number(parts.find((part) => part.type === "year")?.value ?? "0");
  const month = Number(parts.find((part) => part.type === "month")?.value ?? "1");
  const day = Number(parts.find((part) => part.type === "day")?.value ?? "1");
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? "0");

  return { year, month, day, hour, minute };
}

function ddMmYyyy(year: number, month: number, day: number) {
  return `${String(day).padStart(2, "0")}-${String(month).padStart(2, "0")}-${year}`;
}

function nextDate(year: number, month: number, day: number) {
  const utc = new Date(Date.UTC(year, month - 1, day));
  utc.setUTCDate(utc.getUTCDate() + 1);
  return {
    year: utc.getUTCFullYear(),
    month: utc.getUTCMonth() + 1,
    day: utc.getUTCDate(),
  };
}

type AladhanTimingsResponse = {
  data?: {
    timings?: {
      Maghrib?: string;
    };
    date?: {
      hijri?: {
        date?: string;
        month?: { en?: string; number?: number };
        year?: string;
      };
    };
  };
};

async function fetchHijriByDhakaDate(date: string) {
  const url = `${ALADHAN_BASE}/timingsByCity/${date}?city=Dhaka&country=Bangladesh&method=1&school=1&latitudeAdjustmentMethod=3`;
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) return null;
  return (await response.json()) as AladhanTimingsResponse;
}

function formatHijriBn(hijri?: { date?: string; month?: { en?: string; number?: number }; year?: string }) {
  if (!hijri?.date || !hijri.year) return null;
  const day = Number(hijri.date.split("-")?.[0] ?? "");
  if (Number.isNaN(day)) return null;

  const monthEn = hijri.month?.en ?? "";
  const monthBn = HIJRI_MONTHS_BN[monthEn] ?? monthEn;
  const year = Number(hijri.year);
  if (Number.isNaN(year)) return null;

  return `${toBanglaDigits(day)} ${monthBn} ${toBanglaDigits(year)} হিজরি`;
}

function isRamadanCountQuestion(question: string) {
  const q = normalizeDigits(question);
  const hasRamadanWord =
    q.includes("ramadan") ||
    q.includes("রমজান") ||
    q.includes("roza") ||
    q.includes("রোজা") ||
    q.includes("sawm") ||
    q.includes("সাওম") ||
    q.includes("সিয়াম") ||
    q.includes("সিয়াম");

  const asksCount =
    q.includes("how many") ||
    q.includes("কত") ||
    q.includes("সংখ্যা") ||
    q.includes("number") ||
    q.includes("total");

  return hasRamadanWord && asksCount;
}

function isTodayArabicDateQuestion(question: string) {
  const q = normalizeDigits(question);
  const asksDate = q.includes("আজ") || q.includes("today") || q.includes("তারিখ") || q.includes("date");
  const asksHijri = q.includes("আরবি") || q.includes("arabic") || q.includes("hijri") || q.includes("হিজরি");
  return asksDate && asksHijri;
}

function buildRamadanCountFactAnswer(citationsMode: boolean) {
  const sourceLine = citationsMode ? "\n\nসূত্র: চাঁদ দেখার শরয়ি বিধান; রমজান মাস ২৯ বা ৩০ দিনের হয়।" : "";
  return `রমজানে রোজার সংখ্যা স্থিরভাবে ৩০ বলা সঠিক নয়। সঠিক উত্তর হলো: রমজানের রোজা ২৯ বা ৩০টি হয়, কারণ মাসের শুরু-শেষ চাঁদ দেখার উপর নির্ভর করে।${sourceLine}\n\nমাযহাবি নোট: চাঁদ দেখার গ্রহণযোগ্যতা ও গণনার পদ্ধতিতে অঞ্চলভেদে কিছু বাস্তব পার্থক্য থাকতে পারে।`;
}

async function buildTodayHijriFactAnswer(citationsMode: boolean) {
  const now = getDhakaNowParts();
  const todayDate = ddMmYyyy(now.year, now.month, now.day);
  const tomorrow = nextDate(now.year, now.month, now.day);
  const tomorrowDate = ddMmYyyy(tomorrow.year, tomorrow.month, tomorrow.day);

  const [todayData, tomorrowData] = await Promise.all([
    fetchHijriByDhakaDate(todayDate),
    fetchHijriByDhakaDate(tomorrowDate),
  ]);

  const maghribRaw = todayData?.data?.timings?.Maghrib;
  const todayHijri = todayData?.data?.date?.hijri;
  const tomorrowHijri = tomorrowData?.data?.date?.hijri;

  if (!maghribRaw || !todayHijri || !tomorrowHijri) return null;

  const { hours: maghribHour, minutes: maghribMinute } = parseHHMM(maghribRaw);
  const nowMinutes = now.hour * 60 + now.minute;
  const maghribMinutes = maghribHour * 60 + maghribMinute;
  const activeHijri = nowMinutes >= maghribMinutes ? tomorrowHijri : todayHijri;

  const formatted = formatHijriBn(activeHijri);
  if (!formatted) return null;

  const sourceLine = citationsMode
    ? "\n\nসূত্র: আল-আধান প্রেয়ার টাইমস API (ঢাকা), এবং মাগরিবের পর ইসলামী দিন পরিবর্তনের বিধান।"
    : "";

  return `আজকের আরবি তারিখ: ${formatted}${sourceLine}\n\nমাযহাবি নোট: ইসলামী দিন মাগরিবের পর শুরু হয়; তাই মাগরিবের পরে তারিখ পরের দিনে পরিবর্তিত হয়।`;
}

async function applyFactGuards(question: string, answer: string, citationsMode: boolean) {
  if (isTodayArabicDateQuestion(question)) {
    const todayHijriAnswer = await buildTodayHijriFactAnswer(citationsMode);
    if (todayHijriAnswer) return todayHijriAnswer;
  }

  if (isRamadanCountQuestion(question)) {
    return buildRamadanCountFactAnswer(citationsMode);
  }

  return answer;
}

async function callProvider(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  siteUrl: string,
) {
  for (let attempt = 1; attempt <= PROVIDER_MAX_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);

    try {
      const response = await fetch(AI_API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AI_API_KEY}`,
          "HTTP-Referer": siteUrl,
          "X-Title": "Noor Islamic Platform",
        },
        body: JSON.stringify({
          model: AI_MODEL,
          messages,
          temperature: 0.15,
          max_tokens: 900,
        }),
        cache: "no-store",
        signal: controller.signal,
      });

      if (!response.ok && shouldRetryStatus(response.status) && attempt < PROVIDER_MAX_ATTEMPTS) {
        await sleep(350 * attempt);
        continue;
      }

      return response;
    } catch {
      if (attempt < PROVIDER_MAX_ATTEMPTS) {
        await sleep(350 * attempt);
        continue;
      }
      return null;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const rate = checkRateLimit(`qna:${ip}`, 20, 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        {
          message: "Rate limit exceeded",
          answer: "অনেক দ্রুত প্রশ্ন করা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পরে আবার চেষ্টা করুন।",
        },
        { status: 429 },
      );
    }

    const body = (await request.json()) as QnaRequest;
    const question = body.question?.trim();
    const citationsMode = body.citationsMode === true;

    if (!question) {
      return NextResponse.json({ message: "Question is required" }, { status: 400 });
    }

    if (!AI_API_KEY) {
      return NextResponse.json(
        {
          message: "Fallback answer",
          answer: buildFallbackAnswer(question, citationsMode),
        },
        { status: 200 },
      );
    }

    const history = Array.isArray(body.history)
      ? body.history
          .filter(
            (item): item is QnaMessage =>
              !!item && (item.role === "user" || item.role === "assistant") && typeof item.content === "string",
          )
          .slice(-8)
      : [];

    const systemPrompt = `তুমি একটি ইসলামিক সহায়ক AI।
- ব্যবহারকারী যে ভাষায় প্রশ্ন করুক, তুমি শুধু বাংলা ভাষায় উত্তর দেবে।
- উত্তর হবে আত্মবিশ্বাসী, স্পষ্ট, সংক্ষিপ্ত এবং তথ্যগতভাবে নির্ভুল।
- একদম শুরুতে সরাসরি চূড়ান্ত উত্তর দাও; অপ্রয়োজনীয় ভূমিকা বা দ্বিধাগ্রস্ত ভাষা ব্যবহার করবে না।
- সংখ্যা/তারিখ/সময়ভিত্তিক প্রশ্নে অনুমান করবে না; নির্ধারিত সীমা থাকলে তা স্পষ্ট বলবে (যেমন ২৯ বা ৩০) এবং এক লাইনে কারণ দেবে।
- ফিকহি মতভেদ থাকলে সর্বাধিক প্রচলিত মত আগে দাও, তারপর এক লাইনে মতভেদ উল্লেখ করো।
- কুরআন/হাদিস রেফারেন্স দিলে বানিয়ে বলবে না; নিশ্চিত রেফারেন্স না থাকলে সংখ্যা/নম্বর না দিয়ে সাধারণভাবে সূত্র বলবে।
- "সম্ভবত/হয়তো/আমি নিশ্চিত নই" ধরনের দ্বিধাগ্রস্ত ভাষা বারবার ব্যবহার করবে না।
- "অনিশ্চয়তা নোট" শিরোনাম ব্যবহার করবে না।
- ঘৃণা, সহিংসতা, বিভাজন বা বিদ্বেষমূলক কিছু সমর্থন করবে না।`;

    const citationInstruction = citationsMode
      ? "উত্তর ফরম্যাট: (১) সরাসরি উত্তর (২) প্রয়োজনে সংক্ষিপ্ত ব্যাখ্যা (৩) সূত্র (৪) মাযহাবি নোট"
      : "উত্তর ফরম্যাট: (১) সরাসরি উত্তর (২) প্রয়োজনে সংক্ষিপ্ত ব্যাখ্যা (৩) মাযহাবি নোট";

    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      { role: "system", content: systemPrompt },
      { role: "system", content: citationInstruction },
      ...history,
      { role: "user", content: question },
    ];

    const siteUrl = request.nextUrl.origin;
    const response = await callProvider(messages, siteUrl);

    if (!response) {
      return NextResponse.json(
        {
          message: "AI provider unavailable",
          answer: "দুঃখিত, AI সেবা সাময়িকভাবে ব্যস্ত। অনুগ্রহ করে আবার চেষ্টা করুন।",
        },
        { status: 503 },
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          message: "AI response failed",
          answer: "দুঃখিত, এই মুহূর্তে উত্তর দিতে সমস্যা হচ্ছে। একটু পর আবার চেষ্টা করুন।",
        },
        { status: 502 },
      );
    }

    const data = (await response.json()) as {
      choices?: ProviderChoice[];
    };

    const answer = extractAnswer(data.choices);

    if (!answer) {
      return NextResponse.json(
        {
          message: "Empty AI answer",
          answer: "দুঃখিত, এই প্রশ্নের উত্তর তৈরি করা যায়নি। আবার চেষ্টা করুন।",
        },
        { status: 500 },
      );
    }

    const withTemplate = normalizeAnswerStyle(answer, citationsMode);
    const guardedAnswer = await applyFactGuards(question, withTemplate, citationsMode);

    return NextResponse.json({ answer: guardedAnswer }, { status: 200 });
  } catch {
    return NextResponse.json(
      {
        message: "Unexpected AI error",
        answer: "দুঃখিত, অপ্রত্যাশিত সমস্যা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।",
      },
      { status: 500 },
    );
  }
}
