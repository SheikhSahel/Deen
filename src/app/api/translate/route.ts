import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

interface TranslateRequest {
  text?: string;
  source?: string;
  target?: string;
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const rate = checkRateLimit(`translate:${ip}`, 50, 60_000);
    if (!rate.allowed) {
      return NextResponse.json({ message: "Too many translation requests" }, { status: 429 });
    }

    const body = (await request.json()) as TranslateRequest;
    const text = body.text?.trim();
    const source = body.source?.trim() || "id";
    const target = body.target?.trim() || "en";

    if (!text) {
      return NextResponse.json({ message: "Text is required" }, { status: 400 });
    }

    if (text.length > 2500) {
      return NextResponse.json({ message: "Text is too long" }, { status: 413 });
    }

    const endpoint = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(
      source,
    )}&tl=${encodeURIComponent(target)}&dt=t&q=${encodeURIComponent(text)}`;

    const response = await fetch(endpoint, { cache: "no-store" });
    if (!response.ok) {
      return NextResponse.json({ message: "Translation service unavailable" }, { status: 502 });
    }

    const data = (await response.json()) as unknown[];
    const segments = Array.isArray(data[0]) ? (data[0] as unknown[]) : [];
    const translatedText = segments
      .map((segment) => (Array.isArray(segment) ? segment[0] : ""))
      .filter((chunk): chunk is string => typeof chunk === "string")
      .join("")
      .trim();

    if (!translatedText) {
      return NextResponse.json({ message: "Translation failed" }, { status: 500 });
    }

    return NextResponse.json({ translatedText }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Unexpected translation error" }, { status: 500 });
  }
}
