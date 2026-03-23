"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { GlassCard } from "@/components/shared/glass-card";
import { PageShell } from "@/components/shared/page-shell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LEARNING_LEVELS = [
  {
    title: "বেসিক লেভেল",
    topics: ["আরবি বর্ণমালা পরিচয়", "হরকত ও তানভীন", "মাখরাজের প্রাথমিক অনুশীলন", "ছোট সূরা পাঠ"],
  },
  {
    title: "ইন্টারমিডিয়েট লেভেল",
    topics: ["মাদ, গুন্নাহ, ইখফা", "ওয়াকফ ও ইবতিদা নিয়ম", "তাজবিদ সহ সাবলীল তিলাওয়াত", "দৈনিক তিলাওয়াত রুটিন"],
  },
  {
    title: "অ্যাডভান্সড লেভেল",
    topics: ["উন্নত তাজবিদ প্রয়োগ", "তারতিল ও তাদাব্বুর", "আয়াতভিত্তিক অনুশীলন পরিকল্পনা", "শুদ্ধ তিলাওয়াত মূল্যায়ন চেকলিস্ট"],
  },
];

const ARABIC_LETTERS = [
  { letter: "ا", name: "আলিফ", sound: "আ" },
  { letter: "ب", name: "বা", sound: "ব" },
  { letter: "ت", name: "তা", sound: "ত" },
  { letter: "ث", name: "সা", sound: "থ/স" },
  { letter: "ج", name: "জীম", sound: "জ" },
  { letter: "ح", name: "হা", sound: "হ" },
  { letter: "خ", name: "খা", sound: "খ" },
  { letter: "د", name: "দাল", sound: "দ" },
  { letter: "ر", name: "রা", sound: "র" },
  { letter: "س", name: "সীন", sound: "স" },
  { letter: "ش", name: "শীন", sound: "শ" },
  { letter: "ق", name: "ক্বাফ", sound: "ক্ব" },
  { letter: "ك", name: "কাফ", sound: "ক" },
  { letter: "ل", name: "লাম", sound: "ল" },
  { letter: "م", name: "মীম", sound: "ম" },
  { letter: "ن", name: "নূন", sound: "ন" },
  { letter: "ه", name: "হা", sound: "হ" },
  { letter: "و", name: "ওয়াও", sound: "ও/উ" },
  { letter: "ي", name: "ইয়া", sound: "ই/ইয়" },
] as const;

const HARAKAT_QUIZ = [
  { text: "بَ", answer: "বা", options: ["বা", "বি", "বু"] },
  { text: "بِ", answer: "বি", options: ["বা", "বি", "বু"] },
  { text: "بُ", answer: "বু", options: ["বা", "বি", "বু"] },
  { text: "تَ", answer: "তা", options: ["তা", "তি", "তু"] },
  { text: "تِ", answer: "তি", options: ["তা", "তি", "তু"] },
] as const;

const PRACTICE_AYAHS = [
  {
    arabic: "ٱلْحَمْدُ لِلَّٰهِ رَبِّ ٱلْعَٰلَمِينَ",
    transliteration: "Alhamdu lillahi rabbil 'alamin",
    meaning: "সমস্ত প্রশংসা আল্লাহর জন্য, যিনি সকল জগতের প্রতিপালক।",
  },
  {
    arabic: "ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
    transliteration: "Ar-Rahmanir-Rahim",
    meaning: "যিনি পরম করুণাময়, অসীম দয়ালু।",
  },
  {
    arabic: "مَٰلِكِ يَوْمِ ٱلدِّينِ",
    transliteration: "Maliki yawmid-din",
    meaning: "বিচার দিনের অধিপতি।",
  },
] as const;

export default function QuranLearnPage() {
  const [selectedLetterIndex, setSelectedLetterIndex] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);
  const [completedAyahIndexes, setCompletedAyahIndexes] = useState<number[]>([]);

  const selectedLetter = ARABIC_LETTERS[selectedLetterIndex];
  const currentQuiz = HARAKAT_QUIZ[quizIndex];

  const completedProgress = useMemo(() => {
    return Math.round((completedAyahIndexes.length / PRACTICE_AYAHS.length) * 100);
  }, [completedAyahIndexes]);

  const handleQuizAnswer = (selectedAnswer: string) => {
    const isCorrect = selectedAnswer === currentQuiz.answer;
    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
      setQuizFeedback("সঠিক উত্তর! মাশাআল্লাহ।");
    } else {
      setQuizFeedback(`ভুল হয়েছে। সঠিক উত্তর: ${currentQuiz.answer}`);
    }
  };

  const handleNextQuestion = () => {
    setQuizFeedback(null);
    if (quizIndex < HARAKAT_QUIZ.length - 1) {
      setQuizIndex((prev) => prev + 1);
      return;
    }

    setQuizIndex(0);
    setQuizScore(0);
  };

  const toggleAyahCompleted = (index: number) => {
    setCompletedAyahIndexes((prev) =>
      prev.includes(index) ? prev.filter((value) => value !== index) : [...prev, index],
    );
  };

  return (
    <PageShell
      id="quran-learn-title"
      title="কুরআন শিক্ষা"
      subtitle="এখানে আপনি আরবি হরফ, হরকত ও ছোট আয়াত প্র্যাকটিস করে ধাপে ধাপে কুরআন পড়া শিখতে পারবেন।"
      className="space-y-6"
    >
      <GlassCard className="space-y-3">
        <h3 className="text-lg font-semibold">১) আরবি হরফ ইন্টারঅ্যাকটিভ প্র্যাকটিস</h3>
        <p className="text-sm text-muted-foreground">একটি হরফে ক্লিক করলে তার নাম ও উচ্চারণ দেখাবে।</p>

        <div className="grid grid-cols-5 gap-2 sm:grid-cols-7 md:grid-cols-10">
          {ARABIC_LETTERS.map((item, index) => (
            <button
              key={item.letter}
              type="button"
              onClick={() => setSelectedLetterIndex(index)}
              className={cn(
                "arabic-text rounded-lg border px-2 py-3 text-xl transition",
                selectedLetterIndex === index
                  ? "border-emerald-500 bg-emerald-500/10"
                  : "border-emerald-400/20 hover:border-emerald-400/40",
              )}
            >
              {item.letter}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/5 p-3 text-sm">
          <p>
            নির্বাচিত হরফ: <span className="arabic-text text-xl text-amber-500">{selectedLetter.letter}</span>
          </p>
          <p className="mt-1 text-muted-foreground">নাম: {selectedLetter.name} • উচ্চারণ: {selectedLetter.sound}</p>
        </div>
      </GlassCard>

      <GlassCard className="space-y-3">
        <h3 className="text-lg font-semibold">২) হরকত কুইজ</h3>
        <p className="text-sm text-muted-foreground">
          প্রশ্ন {quizIndex + 1}/{HARAKAT_QUIZ.length} • স্কোর: {quizScore}
        </p>

        <div className="arabic-text text-center text-4xl text-amber-500">{currentQuiz.text}</div>

        <div className="grid gap-2 sm:grid-cols-3">
          {currentQuiz.options.map((option) => (
            <Button key={option} variant="outline" onClick={() => handleQuizAnswer(option)}>
              {option}
            </Button>
          ))}
        </div>

        {quizFeedback ? (
          <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/5 p-3 text-sm text-muted-foreground">
            {quizFeedback}
          </div>
        ) : null}

        <Button onClick={handleNextQuestion} className="rounded-full bg-emerald-700 hover:bg-emerald-800">
          পরের প্রশ্ন
        </Button>
      </GlassCard>

      <GlassCard className="space-y-3">
        <h3 className="text-lg font-semibold">৩) ছোট আয়াত রিডিং প্র্যাকটিস</h3>
        <p className="text-sm text-muted-foreground">আজকের প্র্যাকটিস অগ্রগতি: {completedProgress}%</p>

        <div className="space-y-3">
          {PRACTICE_AYAHS.map((ayah, index) => {
            const isDone = completedAyahIndexes.includes(index);
            return (
              <div key={ayah.arabic} className="rounded-xl border border-emerald-400/20 p-3">
                <p className="arabic-text text-right text-2xl text-amber-500">{ayah.arabic}</p>
                <p className="mt-2 text-sm text-muted-foreground">উচ্চারণ: {ayah.transliteration}</p>
                <p className="mt-1 text-sm text-muted-foreground">অর্থ: {ayah.meaning}</p>
                <Button
                  variant={isDone ? "default" : "outline"}
                  className={cn("mt-3 rounded-full", isDone ? "bg-emerald-700 hover:bg-emerald-800" : "")}
                  onClick={() => toggleAyahCompleted(index)}
                >
                  {isDone ? "পড়া সম্পন্ন" : "আমি পড়েছি"}
                </Button>
              </div>
            );
          })}
        </div>
      </GlassCard>

      <div className="grid gap-4 md:grid-cols-3">
        {LEARNING_LEVELS.map((level) => (
          <GlassCard key={level.title}>
            <h3 className="text-lg font-semibold">{level.title}</h3>
            <ul className="mt-3 list-disc space-y-2 pl-4 text-sm text-muted-foreground">
              {level.topics.map((topic) => (
                <li key={topic}>{topic}</li>
              ))}
            </ul>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold">এবার কুরআন পড়া শুরু করুন</h3>
          <p className="text-sm text-muted-foreground">শেখার পরে সরাসরি সূরা রিডিং অংশে গিয়ে প্র্যাকটিস করুন।</p>
        </div>
        <Button asChild className="rounded-full bg-emerald-700 hover:bg-emerald-800">
          <Link href="/quran/read">কুরআন পড়ার অংশে যান</Link>
        </Button>
      </GlassCard>
    </PageShell>
  );
}
