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
const AI_MODEL = process.env.AI_MODEL ?? "openai/gpt-4o-mini";
const AI_API_KEY = process.env.AI_API_KEY;
const PROVIDER_TIMEOUT_MS = 25000;
const PROVIDER_MAX_ATTEMPTS = 2;

function shouldRetryStatus(status: number) {
  return status === 408 || status === 429 || status >= 500;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
          temperature: 0.3,
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
          message: "AI service is not configured.",
          answer:
            "এই মুহূর্তে AI সহায়তা সক্রিয় নয়। অ্যাডমিনকে AI_API_KEY সেটআপ করতে বলুন, তাহলে আমি প্রশ্নের উত্তর দিতে পারব।",
        },
        { status: 503 },
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
- উত্তর সহজ, ভদ্র, তথ্যভিত্তিক এবং প্রয়োজনে ধাপে ধাপে দেবে।
- কুরআন/হাদিস উল্লেখ করলে নিশ্চিত না হলে বলবে "নির্ভরযোগ্য আলেম/গ্রন্থ থেকে যাচাই করুন"।
- ফিকহি মতভেদ থাকলে সংক্ষিপ্তভাবে একাধিক মত থাকতে পারে বলে জানাবে।
- উত্তরের শেষে সর্বদা সংক্ষিপ্ত "মাযহাবি নোট" এবং "অনিশ্চয়তা নোট" দেবে।
- ঘৃণা, সহিংসতা, বিভাজন বা বিদ্বেষমূলক কিছু সমর্থন করবে না।`;

    const citationInstruction = citationsMode
      ? "উত্তর ফরম্যাট: (১) উত্তর (২) সূত্র: কুরআন/হাদিস/ফিকহ উৎস (৩) মাযহাবি নোট (৪) অনিশ্চয়তা নোট"
      : "উত্তর ফরম্যাট: (১) উত্তর (২) মাযহাবি নোট (৩) অনিশ্চয়তা নোট";

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

    const withTemplate = citationsMode && !answer.includes("সূত্র")
      ? `${answer}\n\nসূত্র: নির্ভরযোগ্য কুরআন/হাদিস/আলেম সূত্র থেকে যাচাই করুন।\nমাযহাবি নোট: বিষয়ে মাযহাবভেদে পার্থক্য থাকতে পারে।\nঅনিশ্চয়তা নোট: AI উত্তরে ভুল থাকতে পারে, যোগ্য আলেমের সাথে যাচাই করুন।`
      : answer.includes("মাযহাবি নোট")
        ? answer
        : `${answer}\n\nমাযহাবি নোট: বিষয়ে মাযহাবভেদে মতপার্থক্য থাকতে পারে।\nঅনিশ্চয়তা নোট: এই উত্তর শিক্ষামূলক; প্রয়োজন হলে আলেমের সাথে যাচাই করুন।`;

    return NextResponse.json({ answer: withTemplate }, { status: 200 });
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
