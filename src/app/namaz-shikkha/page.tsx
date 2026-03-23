"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { toast } from "sonner";
import { GlassCard } from "@/components/shared/glass-card";
import { PageShell } from "@/components/shared/page-shell";
import { Button } from "@/components/ui/button";

const REMOTE_TTS_ENDPOINT = "/api/arabic-tts";

const COMMON_DUAS = [
  {
    title: "ছানা",
    arabic: "سُبْحَانَكَ اللّٰهُمَّ وَبِحَمْدِكَ وَتَبَارَكَ اسْمُكَ وَتَعَالٰى جَدُّكَ وَلَا إِلٰهَ غَيْرُكَ",
    translation: "হে আল্লাহ! আপনি পবিত্র, আপনার প্রশংসা সহ; আপনার নাম বরকতময়, আপনার মর্যাদা মহান; আপনি ছাড়া কোনো উপাস্য নেই।",
  },
  {
    title: "রুকু তাসবিহ",
    arabic: "سُبْحَانَ رَبِّيَ الْعَظِيمِ",
    translation: "আমার মহান প্রতিপালক পবিত্র।",
  },
  {
    title: "সিজদা তাসবিহ",
    arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
    translation: "আমার সর্বোচ্চ প্রতিপালক পবিত্র।",
  },
  {
    title: "তাশাহহুদ",
    arabic:
      "التَّحِيَّاتُ لِلّٰهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللّٰهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَىٰ عِبَادِ اللّٰهِ الصَّالِحِينَ، أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا اللّٰهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ",
    translation:
      "সব সম্মান, সব ইবাদত ও সব পবিত্র বিষয় আল্লাহর জন্য। হে নবী! আপনার উপর শান্তি, আল্লাহর রহমত ও বরকত বর্ষিত হোক। আমাদের উপর এবং আল্লাহর নেক বান্দাদের উপরও শান্তি বর্ষিত হোক। আমি সাক্ষ্য দিচ্ছি যে আল্লাহ ছাড়া কোনো উপাস্য নেই এবং আমি আরও সাক্ষ্য দিচ্ছি যে মুহাম্মদ ﷺ তাঁর বান্দা ও রাসূল।",
  },
  {
    title: "দরুদে ইব্রাহিম",
    arabic:
      "اللّٰهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ وَعَلَىٰ آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَىٰ إِبْرَاهِيمَ وَعَلَىٰ آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ، اللّٰهُمَّ بَارِكْ عَلَىٰ مُحَمَّدٍ وَعَلَىٰ آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَىٰ إِبْرَاهِيمَ وَعَلَىٰ آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ",
    translation:
      "হে আল্লাহ! মুহাম্মদ ﷺ এবং মুহাম্মদের পরিবারবর্গের উপর রহমত নাযিল করুন, যেমন আপনি ইবরাহিম (আ.) এবং ইবরাহিমের পরিবারবর্গের উপর রহমত নাযিল করেছেন। নিশ্চয়ই আপনি প্রশংসিত, মহিমান্বিত। হে আল্লাহ! মুহাম্মদ ﷺ এবং মুহাম্মদের পরিবারবর্গের উপর বরকত নাযিল করুন, যেমন আপনি ইবরাহিম (আ.) এবং ইবরাহিমের পরিবারবর্গের উপর বরকত নাযিল করেছেন। নিশ্চয়ই আপনি প্রশংসিত, মহিমান্বিত।",
  },
  {
    title: "দোয়া মাসুরা",
    arabic:
      "اللّٰهُمَّ إِنِّي ظَلَمْتُ نَفْسِي ظُلْمًا كَثِيرًا وَلَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ، فَاغْفِرْ لِي مَغْفِرَةً مِنْ عِنْدِكَ وَارْحَمْنِي، إِنَّكَ أَنْتَ الْغَفُورُ الرَّحِيمُ",
    translation:
      "হে আল্লাহ! আমি নিজের উপর অনেক জুলুম করেছি, আর আপনি ছাড়া গুনাহ মাফ করার কেউ নেই। তাই আপনি নিজ অনুগ্রহে আমাকে ক্ষমা করুন এবং আমার প্রতি দয়া করুন। নিশ্চয়ই আপনি পরম ক্ষমাশীল, পরম দয়ালু।",
  },
  {
    title: "দোয়া কুনুত",
    arabic:
      "اللّٰهُمَّ إِنَّا نَسْتَعِينُكَ وَنَسْتَغْفِرُكَ وَنُؤْمِنُ بِكَ وَنَتَوَكَّلُ عَلَيْكَ وَنُثْنِي عَلَيْكَ الْخَيْرَ وَنَشْكُرُكَ وَلَا نَكْفُرُكَ وَنَخْلَعُ وَنَتْرُكُ مَنْ يَفْجُرُكَ، اللّٰهُمَّ إِيَّاكَ نَعْبُدُ وَلَكَ نُصَلِّي وَنَسْجُدُ وَإِلَيْكَ نَسْعَىٰ وَنَحْفِدُ وَنَرْجُو رَحْمَتَكَ وَنَخْشَىٰ عَذَابَكَ إِنَّ عَذَابَكَ الْجِدَّ بِالْكُفَّارِ مُلْحِقٌ",
    translation:
      "হে আল্লাহ! আমরা আপনারই সাহায্য চাই, আপনার কাছে ক্ষমা চাই, আপনার উপর ঈমান আনি, আপনারই উপর ভরসা করি, আপনার উত্তম প্রশংসা করি, আপনার শুকরিয়া আদায় করি এবং আপনার অবাধ্য হই না। আমরা সেই ব্যক্তিকে ত্যাগ করি যে আপনার নাফরমানি করে। হে আল্লাহ! আমরা শুধু আপনারই ইবাদত করি, আপনারই জন্য নামাজ পড়ি ও সিজদা করি, আপনারই দিকে ধাবিত হই ও আপনার আনুগত্যে সচেষ্ট থাকি। আমরা আপনার রহমত প্রত্যাশা করি এবং আপনার শাস্তিকে ভয় করি। নিশ্চয়ই আপনার কঠিন শাস্তি কাফিরদেরকে পরিবেষ্টন করবে।",
  },
];

const NAMAZ_FLOWS = [
  {
    title: "২ রাকাত নামাজের ধাপ",
    steps: [
      "নিয়ত করে তাকবিরে তাহরিমা (আল্লাহু আকবার) বলে হাত বাঁধুন।",
      "ছানা, আউযুবিল্লাহ, বিসমিল্লাহ, সূরা ফাতিহা এবং একটি সূরা পড়ুন।",
      "রুকু, তারপর কওমা; এরপর দুই সিজদা সম্পন্ন করুন।",
      "দ্বিতীয় রাকাতে একইভাবে কিরাত, রুকু ও সিজদা করুন।",
      "আত্তাহিয়্যাতু, দরুদ, দোয়া মাসুরা পড়ে সালাম ফিরিয়ে নামাজ শেষ করুন।",
    ],
  },
  {
    title: "৩ রাকাত (বিতর/মাগরিব) নামাজের ধাপ",
    steps: [
      "প্রথম দুই রাকাত ২ রাকাত নামাজের মতো আদায় করুন।",
      "দ্বিতীয় রাকাতে তাশাহহুদ পড়ে তৃতীয় রাকাতের জন্য দাঁড়ান।",
      "তৃতীয় রাকাতে সূরা ফাতিহা ও সূরা মিলিয়ে রুকু-সিজদা করুন।",
      "বিতরে কুনুত দোয়া পড়ে রুকুতে যান (যদি প্রযোজ্য হয়)।",
      "শেষ বৈঠকে তাশাহহুদ, দরুদ, দোয়া মাসুরা পড়ে সালাম ফিরান।",
    ],
  },
  {
    title: "৪ রাকাত নামাজের ধাপ",
    steps: [
      "প্রথম দুই রাকাত পূর্ণ কিরাতসহ পড়ুন এবং দ্বিতীয় রাকাতে বৈঠক করুন।",
      "তৃতীয় রাকাতে দাঁড়িয়ে শুধুমাত্র সূরা ফাতিহা (ফরজে) পড়ুন।",
      "রুকু-সিজদা করে চতুর্থ রাকাতে একইভাবে আদায় করুন।",
      "শেষ বৈঠকে তাশাহহুদ, দরুদে ইব্রাহিম ও দোয়া মাসুরা পড়ুন।",
      "ডানে-বামে সালাম ফিরিয়ে নামাজ সম্পন্ন করুন।",
    ],
  },
  {
    title: "ঈদের নামাজের ধাপ (২ রাকাত)",
    steps: [
      "জামাতে ইমামের সাথে তাকবিরে তাহরিমা বলে হাত বাঁধুন।",
      "ছানা পড়ে প্রথম রাকাতে অতিরিক্ত ৩ তাকবির দিন; প্রতিবার হাতে কান পর্যন্ত তুলে ছেড়ে দিন, তৃতীয় তাকবিরের পর হাত বেঁধে নিন।",
      "ইমাম কিরাত পড়বেন; এরপর রুকু, সিজদা করে দ্বিতীয় রাকাতে দাঁড়ান।",
      "দ্বিতীয় রাকাতে কিরাত শেষে অতিরিক্ত ৩ তাকবির দিন; হাতে কান পর্যন্ত তুলে ছেড়ে দিন।",
      "চতুর্থ তাকবির বলে রুকুতে যান, তারপর সিজদা, বৈঠক ও সালামের মাধ্যমে নামাজ শেষ করুন।",
      "নামাজ শেষে ইমাম খুতবা দেবেন; মনোযোগ দিয়ে খুতবা শুনুন।",
    ],
  },
  {
    title: "জানাজার নামাজের ধাপ",
    steps: [
      "নিয়ত করে প্রথম তাকবির (আল্লাহু আকবার) বলুন এবং হাত বাঁধুন।",
      "ছানা পড়ুন (সুবহানাকা), তবে ওয়া জাল্লা সানাউকা অংশসহ পড়া উত্তম।",
      "দ্বিতীয় তাকবিরের পর দরুদে ইব্রাহিম পড়ুন।",
      "তৃতীয় তাকবিরের পর মৃতের জন্য দোয়া করুন (বালেগ/নাবালেগ অনুযায়ী দোয়া)।",
      "চতুর্থ তাকবিরের পর অল্প বিরতি দিয়ে ডানে ও বামে সালাম ফিরান।",
      "জানাজার নামাজে রুকু-সিজদা নেই; সবটাই দাঁড়িয়ে সম্পন্ন হয়।",
    ],
  },
  {
    title: "মুসাফিরের কসর নামাজের ধাপ",
    steps: [
      "শরয়ি সফরের দূরত্বে গেলে যোহর, আসর ও এশার ফরজ ৪ রাকাতের বদলে ২ রাকাত পড়ুন।",
      "ফজর ২ রাকাত ও মাগরিব ৩ রাকাত আগের মতোই থাকবে।",
      "সুন্নত/নফল পড়া যাবে; কষ্ট হলে ছেড়ে দেওয়ার অবকাশ আছে।",
      "নিয়তে কসর নামাজের কথা মনে রাখুন এবং স্বাভাবিক নিয়মেই আদায় করুন।",
    ],
  },
  {
    title: "তাহাজ্জুদ নামাজের ধাপ",
    steps: [
      "এশার নামাজের পর ঘুমিয়ে রাতে শেষ তৃতীয়াংশে জাগা উত্তম।",
      "কমপক্ষে ২ রাকাত করে যতটুকু সম্ভব নফল নামাজ আদায় করুন।",
      "প্রতি ২ রাকাতে সালাম ফিরানো উত্তম পদ্ধতি।",
      "তিলাওয়াত, দোয়া ও ইস্তিগফারে বেশি সময় দিন; এটি কবুলের বিশেষ সময়।",
    ],
  },
  {
    title: "ইশরাক ও চাশতের নামাজ",
    steps: [
      "সূর্যোদয়ের প্রায় ১৫-২০ মিনিট পর ২ রাকাত ইশরাক পড়ুন।",
      "চাশতের সময় (সকাল মধ্যভাগে) ২ বা ৪ রাকাত নফল আদায় করুন।",
      "নিয়ত, কিরাত, রুকু, সিজদা সব সাধারণ নফল নামাজের মতোই হবে।",
      "সময় ঠিক রাখতে নামাজের সময়সূচির সূর্যোদয় দেখে নিন।",
    ],
  },
];

const JANAZA_DUAS = [
  {
    title: "জানাজার দোয়া (বালেগ)",
    arabic:
      "اللّٰهُمَّ اغْفِرْ لِحَيِّنَا وَمَيِّتِنَا وَشَاهِدِنَا وَغَائِبِنَا وَصَغِيرِنَا وَكَبِيرِنَا وَذَكَرِنَا وَأُنْثَانَا، اللّٰهُمَّ مَنْ أَحْيَيْتَهُ مِنَّا فَأَحْيِهِ عَلَى الْإِسْلَامِ وَمَنْ تَوَفَّيْتَهُ مِنَّا فَتَوَفَّهُ عَلَى الْإِيمَانِ",
    pronunciation:
      "আল্লাহুম্মাগফির লিহাইয়্যিনা ওয়া মাইয়্যিতিনা ওয়া শাহিদিনা ওয়া গায়িবিনা ওয়া সগীরিনা ওয়া কবীরিনা ওয়া যাকারিনা ওয়া উন্সানা, আল্লাহুম্মা মান আহইয়াইতাহু মিন্‌না ফা আহইহি আলাল ইসলাম, ওয়া মান তাওয়াফ্ফাইতাহু মিন্‌না ফা তাওয়াফ্ফাহু আলাল ঈমান।",
  },
  {
    title: "জানাজার দোয়া (শিশু)",
    arabic:
      "اللّٰهُمَّ اجْعَلْهُ لَنَا فَرَطًا وَاجْعَلْهُ لَنَا أَجْرًا وَذُخْرًا وَاجْعَلْهُ لَنَا شَافِعًا وَمُشَفَّعًا",
    pronunciation:
      "আল্লাহুম্মাজ আলহু লানা ফারাতান, ওয়াজ আলহু লানা আজরান ওয়া যুখরান, ওয়াজ আলহু লানা শাফি'আন ওয়া মুশাফ্‌ফা'আ।",
  },
];

export default function NamazShikkhaPage() {
  const [activeAudioKey, setActiveAudioKey] = useState<string | null>(null);
  const utterancesRef = useRef<SpeechSynthesisUtterance[]>([]);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stopAudio = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    if (remoteAudioRef.current) {
      remoteAudioRef.current.pause();
      remoteAudioRef.current.currentTime = 0;
      remoteAudioRef.current.onended = null;
      remoteAudioRef.current.onerror = null;
      remoteAudioRef.current = null;
    }

    utterancesRef.current = [];
    setActiveAudioKey(null);
  };

  const splitArabicForSpeech = (text: string) => {
    const cleaned = text.replace(/\s+/g, " ").trim();
    if (cleaned.length <= 180) return [cleaned];

    const roughParts = cleaned.split(/(?<=[،؛.!؟])/);
    const chunks: string[] = [];
    let current = "";

    for (const part of roughParts) {
      const piece = part.trim();
      if (!piece) continue;

      if (!current) {
        current = piece;
        continue;
      }

      if (`${current} ${piece}`.length <= 180) {
        current = `${current} ${piece}`;
      } else {
        chunks.push(current);
        current = piece;
      }
    }

    if (current) chunks.push(current);
    return chunks.length > 0 ? chunks : [cleaned];
  };

  const ensureVoicesReady = async () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return [] as SpeechSynthesisVoice[];

    const initialVoices = window.speechSynthesis.getVoices();
    if (initialVoices.length > 0) return initialVoices;

    return new Promise<SpeechSynthesisVoice[]>((resolve) => {
      let settled = false;

      const finalize = () => {
        if (settled) return;
        settled = true;
        window.speechSynthesis.removeEventListener("voiceschanged", handleVoicesChanged);
        resolve(window.speechSynthesis.getVoices());
      };

      const handleVoicesChanged = () => finalize();

      window.speechSynthesis.addEventListener("voiceschanged", handleVoicesChanged);
      setTimeout(finalize, 1200);
    });
  };

  const pickArabicVoice = (voices: SpeechSynthesisVoice[]) => {
    const strict = voices.find((voice) => /^ar(-|$)/i.test(voice.lang));
    if (strict) return strict;
    return voices.find((voice) => voice.lang.toLowerCase().includes("ar"));
  };

  const buildRemoteTtsUrl = (text: string) => {
      const params = new URLSearchParams({ text });
    return `${REMOTE_TTS_ENDPOINT}?${params.toString()}`;
  };

  const playRemoteChunks = (chunks: string[], key: string) => {
    let index = 0;

    const playNext = () => {
      if (index >= chunks.length) {
        setActiveAudioKey((current) => (current === key ? null : current));
        remoteAudioRef.current = null;
        return;
      }

      const audio = new Audio(buildRemoteTtsUrl(chunks[index]));
      remoteAudioRef.current = audio;

      audio.onended = () => {
        index += 1;
        playNext();
      };

      audio.onerror = () => {
        setActiveAudioKey((current) => (current === key ? null : current));
        remoteAudioRef.current = null;
        toast.error("অডিও চালু করা যাচ্ছে না। ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।");
      };

      void audio.play().catch(() => {
        setActiveAudioKey((current) => (current === key ? null : current));
        remoteAudioRef.current = null;
        toast.error("অডিও চালু করা যাচ্ছে না। আবার Play চাপুন।");
      });
    };

    playNext();
  };

  const speakChunks = (chunks: string[], key: string, voice?: SpeechSynthesisVoice) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    let index = 0;

    const speakNext = () => {
      if (index >= chunks.length) {
        setActiveAudioKey((current) => (current === key ? null : current));
        utterancesRef.current = [];
        return;
      }

      const utterance = new SpeechSynthesisUtterance(chunks[index]);
      utterance.lang = "ar-SA";
      utterance.rate = 0.85;
      utterance.pitch = 1;
      if (voice) utterance.voice = voice;

      utterance.onend = () => {
        index += 1;
        speakNext();
      };

      utterance.onerror = () => {
        setActiveAudioKey((current) => (current === key ? null : current));
        utterancesRef.current = [];
        toast.error("অডিও চালু করা যাচ্ছে না। আপনার ব্রাউজারের ভয়েস সেটিংস চেক করুন।");
      };

      utterancesRef.current.push(utterance);
      window.speechSynthesis.speak(utterance);
    };

    speakNext();
  };

  const playArabicDua = async (key: string, arabicText: string) => {
    if (activeAudioKey === key) {
      stopAudio();
      return;
    }

    stopAudio();
    const chunks = splitArabicForSpeech(arabicText);

    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setActiveAudioKey(key);
      playRemoteChunks(chunks, key);
      return;
    }

    window.speechSynthesis.resume();

    const voices = await ensureVoicesReady();
    const voice = pickArabicVoice(voices);

    setActiveAudioKey(key);

    if (!voice) {
      playRemoteChunks(chunks, key);
      return;
    }

    speakChunks(chunks, key, voice);
  };

  return (
    <PageShell
      id="namaz-shikkha-title"
      title="নামাজ শিক্ষা"
      subtitle="২, ৩ ও ৪ রাকাত নামাজের ধাপসমূহ এবং নামাজের গুরুত্বপূর্ণ দোয়া একসাথে শিখুন।"
      className="space-y-6"
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {NAMAZ_FLOWS.map((flow) => (
          <GlassCard key={flow.title}>
            <h3 className="text-lg font-semibold">{flow.title}</h3>
            <ol className="mt-3 list-decimal space-y-2 pl-4 text-sm text-muted-foreground">
              {flow.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </GlassCard>
        ))}
      </div>

      <GlassCard>
        <h3 className="text-xl font-semibold">নামাজে পড়ার দোয়া ও তাসবিহ</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {COMMON_DUAS.map((dua) => (
            <div key={dua.title} className="rounded-xl border border-emerald-400/20 p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-emerald-500">{dua.title}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1 px-2 text-xs"
                  onClick={() => playArabicDua(`common-${dua.title}`, dua.arabic)}
                  aria-label={`${dua.title} অডিও ${activeAudioKey === `common-${dua.title}` ? "বন্ধ করুন" : "চালু করুন"}`}
                >
                  {activeAudioKey === `common-${dua.title}` ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  {activeAudioKey === `common-${dua.title}` ? "Stop" : "Play"}
                </Button>
              </div>
              <p className="arabic-text mt-2 text-right text-[1.5rem] leading-relaxed text-amber-500">{dua.arabic}</p>
              <p className="mt-2 text-sm text-muted-foreground">{dua.translation}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="text-xl font-semibold">জানাজার দোয়া (বালেগ/শিশু)</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {JANAZA_DUAS.map((dua) => (
            <div key={dua.title} className="rounded-xl border border-emerald-400/20 p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-emerald-500">{dua.title}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1 px-2 text-xs"
                  onClick={() => playArabicDua(`janaza-${dua.title}`, dua.arabic)}
                  aria-label={`${dua.title} অডিও ${activeAudioKey === `janaza-${dua.title}` ? "বন্ধ করুন" : "চালু করুন"}`}
                >
                  {activeAudioKey === `janaza-${dua.title}` ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  {activeAudioKey === `janaza-${dua.title}` ? "Stop" : "Play"}
                </Button>
              </div>
              <p className="arabic-text mt-2 text-right text-[1.5rem] leading-relaxed text-amber-500">{dua.arabic}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground/90">উচ্চারণ:</span> {dua.pronunciation}
              </p>
            </div>
          ))}
        </div>
      </GlassCard>
    </PageShell>
  );
}
