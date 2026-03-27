import { NextRequest, NextResponse } from "next/server";

const ALADHAN_BASE = process.env.NEXT_PUBLIC_ALADHAN_API ?? "https://api.aladhan.com/v1";

export async function GET(request: NextRequest) {
  const latitude = request.nextUrl.searchParams.get("latitude");
  const longitude = request.nextUrl.searchParams.get("longitude");

  if (!latitude || !longitude) {
    return NextResponse.json({ message: "Missing latitude or longitude" }, { status: 400 });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  // method=1 (Karachi) and school=1 (Hanafi) better match South Asian schedules.
  const url = `${ALADHAN_BASE}/timings/${timestamp}?latitude=${latitude}&longitude=${longitude}&method=1&school=1&latitudeAdjustmentMethod=3`;

  try {
    const response = await fetch(url, { next: { revalidate: 300 } });

    if (!response.ok) {
      return NextResponse.json({ message: "Prayer times provider unavailable" }, { status: 502 });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Prayer times provider unavailable" }, { status: 502 });
  }
}
