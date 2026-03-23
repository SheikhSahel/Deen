import { NextRequest, NextResponse } from "next/server";

const ALADHAN_BASE = process.env.NEXT_PUBLIC_ALADHAN_API ?? "https://api.aladhan.com/v1";

function getFallbackPayload() {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = now.getFullYear();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return {
    data: {
      timings: {
        Fajr: "05:00",
        Sunrise: "06:18",
        Dhuhr: "12:15",
        Asr: "15:45",
        Maghrib: "18:10",
        Isha: "19:40",
      },
      date: {
        readable: `${dd}-${mm}-${yyyy}`,
        hijri: {
          date: "--",
          month: { en: "Unavailable", number: 0 },
          year: "--",
        },
      },
      meta: {
        timezone: `${timezone} (Fallback)`,
      },
    },
  };
}

export async function GET(request: NextRequest) {
  const latitude = request.nextUrl.searchParams.get("latitude");
  const longitude = request.nextUrl.searchParams.get("longitude");

  if (!latitude || !longitude) {
    return NextResponse.json({ message: "Missing latitude or longitude" }, { status: 400 });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const url = `${ALADHAN_BASE}/timings/${timestamp}?latitude=${latitude}&longitude=${longitude}&method=2`;

  try {
    const response = await fetch(url, { next: { revalidate: 300 } });

    if (!response.ok) {
      return NextResponse.json(getFallbackPayload(), { status: 200 });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json(getFallbackPayload(), { status: 200 });
  }
}
