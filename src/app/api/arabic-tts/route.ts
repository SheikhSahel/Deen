import { NextRequest, NextResponse } from "next/server";

const STREAM_ELEMENTS_TTS = "https://api.streamelements.com/kappa/v2/speech";
const GOOGLE_TTS = "https://translate.google.com/translate_tts";
const VOICE = "Zeina";

function buildStreamElementsUrl(text: string) {
  const params = new URLSearchParams({
    voice: VOICE,
    text,
  });
  return `${STREAM_ELEMENTS_TTS}?${params.toString()}`;
}

function buildGoogleTtsUrl(text: string) {
  const params = new URLSearchParams({
    ie: "UTF-8",
    client: "tw-ob",
    tl: "ar",
    q: text,
  });
  return `${GOOGLE_TTS}?${params.toString()}`;
}

async function fetchAudio(url: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      Accept: "audio/mpeg,audio/*,*/*",
    },
    cache: "no-store",
  });

  if (!response.ok) return null;

  const audioBuffer = await response.arrayBuffer();
  if (audioBuffer.byteLength === 0) return null;

  return audioBuffer;
}

export async function GET(request: NextRequest) {
  const text = request.nextUrl.searchParams.get("text")?.trim();

  if (!text) {
    return NextResponse.json({ message: "Missing text" }, { status: 400 });
  }

  try {
    const encodedText = text.slice(0, 1000);
    const streamElementsAudio = await fetchAudio(buildStreamElementsUrl(encodedText));
    const audio = streamElementsAudio ?? (await fetchAudio(buildGoogleTtsUrl(encodedText)));

    if (!audio) {
      return NextResponse.json({ message: "Unable to generate audio" }, { status: 502 });
    }

    return new NextResponse(audio, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch {
    return NextResponse.json({ message: "TTS service failed" }, { status: 500 });
  }
}
