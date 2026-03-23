import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { PageShell } from "@/components/shared/page-shell";
import { BooksSectionClient } from "@/components/hajj/books-section-client";
import { Button } from "@/components/ui/button";
import { validateBookChaptersSchema, type BookChapter } from "@/lib/content-schema";

const BOOK_ITEMS = [
  { title: "হজ্ব অধ্যায়", content: "হজ্বের ফরজ, ওয়াজিব, সুন্নত, হজ্বের প্রকারভেদ (ইফরাদ, কিরান, তামাত্তু) এবং করণীয়-বর্জনীয়ের সংক্ষিপ্ত ও প্রয়োগভিত্তিক আলোচনা।" },
  { title: "মীকাত অধ্যায়", content: "কোন দেশের যাত্রী কোন মীকাত থেকে ইহরাম বাঁধবেন, মীকাত অতিক্রমের আগে প্রস্তুতি এবং মীকাত সংক্রান্ত সাধারণ ভুল।" },
  { title: "ইহরাম অধ্যায়", content: "ইহরামের নিয়ত, পোশাক, নিষিদ্ধ কাজ, সুগন্ধি/নখ/চুল সংক্রান্ত মাসআলা এবং ইহরামের আদব।" },
  { title: "তালবিয়া অধ্যায়", content: "তালবিয়ার আরবি, উচ্চারণ, অর্থ, কখন শুরু/বন্ধ করতে হয় এবং ভ্রমণের বিভিন্ন পর্যায়ে কতবার পড়া উত্তম।" },
  { title: "তাওয়াফ অধ্যায়", content: "তাওয়াফের ধরন, শর্ত, শুরু-শেষ, রমল/ইদতিবা, হাজরে আসওয়াদ ইস্তিলাম এবং তাওয়াফ ভেঙে গেলে করণীয়।" },
  { title: "সায়ি অধ্যায়", content: "সাফা-মারওয়া সায়ির ধাপ, ৭ চক্করের নিয়ম, সবুজ চিহ্নে দ্রুত চলা, দোয়া এবং সায়ির ভুলসমূহ।" },
  { title: "উকুফ অধ্যায়", content: "উকুফের গুরুত্ব, নির্ধারিত সময়, দোয়া ও ইস্তিগফারের আমল এবং উকুফ গ্রহণযোগ্যতার শর্ত।" },
  { title: "উকুফে মিনা", content: "মিনায় অবস্থানের দিনভিত্তিক পরিকল্পনা, তাঁবু-শৃঙ্খলা, জামাতে নামাজ এবং নিরাপত্তা-সংক্রান্ত দিকনির্দেশনা।" },
  { title: "উকুফে আরাফাহ", content: "৯ জিলহজে আরাফার ময়দানে সবচেয়ে গুরুত্বপূর্ণ আমল, খুতবা শোনা, দোয়ার আদব এবং সময় ব্যবস্থাপনা।" },
  { title: "উকুফে মুজদালিফা", content: "মাগরিব-এশা একসাথে আদায়, কঙ্কর সংগ্রহ, রাত যাপন, ফজর পরবর্তী আমল এবং মিনায় ফেরত যাত্রা নির্দেশনা।" },
  { title: "রমি (পাথর/কঙ্কর নিক্ষেপ) অধ্যায়", content: "জামরাতের ধাপ, সময়সীমা, কঙ্কর নিক্ষেপের সুন্নত পদ্ধতি, ভিড় ব্যবস্থাপনা ও নিরাপত্তা টিপস।" },
  { title: "জিনায়াত অধ্যায়", content: "অপরাধের কারণে দম দিতে হবে কি না, কোন ভুলে কী প্রতিকার, সাদাকা বা কাযা লাগার বাস্তব উদাহরণসহ ব্যাখ্যা।" },
  { title: "বদলী হজ্ব অধ্যায়", content: "অন্যের পক্ষ থেকে হজ্ব করার শর্ত, নিয়ত, অনুমতি, আর্থিক সক্ষমতা এবং ফিকহি সীমারেখা।" },
  { title: "হাদি (হজ্ব পশু) অধ্যায়", content: "হাদি কাদের উপর ওয়াজিব, কুরবানি ব্যবস্থাপনা, কুপন সিস্টেম, বিকল্প ব্যবস্থা এবং সময়সূচি।" },
  { title: "হলক অধ্যায়", content: "মাথা মুণ্ডন/চুল ছোট করা (হলক/তাকসির) বিধান, পুরুষ-মহিলার পার্থক্য এবং সঠিক সময়।" },
  { title: "ওমরাহ অধ্যায়", content: "উমরার পূর্ণ ধাপ: ইহরাম, তাওয়াফ, সায়ি, হলক/তাকসির; স্বল্প সময়ে পরিকল্পিতভাবে উমরা সম্পাদন।" },
  { title: "মহিলাদের মাসায়েল অধ্যায়", content: "মহিলাদের ইহরাম, মাহরাম, হায়েজ/নেফাস অবস্থায় আমল, তাওয়াফ/সায়ির বিধান এবং ব্যবহারিক প্রশ্নোত্তর।" },
  { title: "মক্কাতুল মুকাররমা", content: "মক্কায় গুরুত্বপূর্ণ স্থান, হারাম শরীফে আদব, ভিড়ের সময় চলাচল, পানি/স্বাস্থ্য ও অবস্থান ব্যবস্থাপনা।" },
  { title: "হারামাইনে নামায সংক্রান্ত মাসায়েল", content: "মসজিদুল হারাম ও মসজিদে নববীতে জামাত, সাফ, ইমামের অনুসরণ, কসর/জমা ও বাস্তব সমস্যার সমাধান।" },
  { title: "মসিনাতুল মুনাওয়ারা", content: "রওজা জিয়ারত আদব, মসজিদে নববীর আমল, কুবা/উহুদ জিয়ারত এবং আচরণবিধি।" },
  { title: "পরামর্শ/টিপস", content: "ভ্রমণ নথিপত্র, স্বাস্থ্য প্রস্তুতি, গ্রুপ সমন্বয়, জরুরি নম্বর, আর্থিক নিরাপত্তা এবং সফর শৃঙ্খলা।" },
  { title: "এক নজরে হজ্ব", content: "হজ্বের পুরো ফ্লো এক পৃষ্ঠায়: দিনভিত্তিক কাজ, ফরজ-ওয়াজিব চেকলিস্ট এবং দ্রুত রিভিশন নোট।" },
  { title: "এক নজরে উমরা", content: "উমরার ধাপগুলো ক্রমানুসারে চেকলিস্ট আকারে: কী আগে, কী পরে এবং সাধারণ ভুল এড়ানোর টিপস।" },
  { title: "এক নজরে হজ্ব ও উমরার দু'আ", content: "প্রতিটি পর্যায়ে দরকারি সংক্ষিপ্ত দোয়া, উচ্চারণ-সহায়তা ও প্রেক্ষিতভিত্তিক ব্যবহারের নির্দেশনা।" },
] as const;

const BOOK_CHAPTERS: readonly BookChapter[] = validateBookChaptersSchema([
  {
    chapterTitle: "হজ্ব-উমরা মূল অধ্যায়",
    books: [...BOOK_ITEMS.slice(0, 12)],
  },
  {
    chapterTitle: "অতিরিক্ত মাসায়েল ও রিভিশন",
    books: [...BOOK_ITEMS.slice(12)],
  },
]);

const VISUAL_HAJJ_ITEMS = [
  "ইহরাম অবস্থায় নিষিদ্ধ কাজ",
  "এক নজরে হজ্ব এর আহকাম",
  "হজ্ব এর ১ম, ২য় ও ৩য় দিনের আমল (৭, ৮, ৯ যিলহজ্ব)",
  "হজ্ব এর ৪র্থ, ৫ম দিনের আমল (১০, ১১ যিলহজ্ব)",
  "হজ্ব এর ৬ষ্ঠ, ৭ম দিনের আমল (১২, ১৩ যিলহজ্ব)",
  "এক নজরে হজ্ব এর ৬ দিন",
  "এক নজরে তামাত্তু হজ্ব এর আমল",
  "এক নজরে হজ্ব-উমরার দু'আ",
] as const;

const VISUAL_UMRAH_ITEMS = [
  "ইহরাম অবস্থায় নিষিদ্ধ কাজ",
  "এক নজরে উমরার আহকাম",
] as const;

const NEW_MOON_DUA = {
  arabic:
    "اللّٰهُ أَكْبَرُ، اَللّٰهُمَّ أَهِلَّهُ عَلَيْنَا بِالْأَمْنِ وَالْإِيْمَانِ وَالسَّلَامَةِ وَالْإِسْلَامِ، وَالتَّوْفِيْقِ لِمَا تُحِبُّ وَتَرْضَى، رَبُّنَا وَرَبُّكَ اللّٰهُ",
  pronunciation:
    "আল্লাহু আকবার। আল্লাহুম্মা আহিল্লাহু আলাইনা বিল আমনি ওয়াল ঈমানি ওয়াস সালামাতি ওয়াল ইসলাম, ওয়াত তাওফীকি লিমা তুহিব্বু ওয়া তারদা, রব্বুনা ওয়া রব্বুকাল্লাহ।",
  meaning:
    "আল্লাহ মহান। হে আল্লাহ! এই নতুন চাঁদকে আমাদের জন্য নিরাপত্তা, ঈমান, শান্তি, ইসলাম এবং আপনার পছন্দনীয় কাজে তাওফিকের বার্তা হিসেবে উদিত করুন। আমাদের রব এবং তোমার রব আল্লাহ।",
} as const;

const HAJJ_KITABS = [
  { name: "ফিকহুস সুন্নাহ – হজ্ব অংশ", focus: "হজ্বের মাসায়েল ও দলিলভিত্তিক আলোচনা" },
  { name: "মানাসিকে হজ্ব (সংকলন)", focus: "ধাপে ধাপে হজ্ব-উমরা গাইড" },
  { name: "হজ্ব ও উমরার মাসায়েল", focus: "বাংলা ভাষায় প্রয়োগমুখী প্রশ্নোত্তর" },
  { name: "মদিনা ও মক্কার জিয়ারত গাইড", focus: "হারামাইন ভিজিটের শিষ্টাচার ও আমল" },
] as const;

const TRAINING_VIDEOS = [
  {
    title: "ধাপে ধাপে হজ্ব সম্পূর্ণ প্রশিক্ষণ",
    scholar: "বিভিন্ন আলেমের লেকচার (বাংলা)",
    url: "https://www.youtube.com/results?search_query=hajj+training+bangla",
  },
  {
    title: "উমরা করার পূর্ণাঙ্গ পদ্ধতি",
    scholar: "ইমাম ও ইসলামী স্কলারদের আলোচনা",
    url: "https://www.youtube.com/results?search_query=umrah+guide+bangla",
  },
  {
    title: "হজ্বে সাধারণ ভুল ও সংশোধন",
    scholar: "ফিকহ বিশেষজ্ঞ আলেম",
    url: "https://www.youtube.com/results?search_query=hajj+mistakes+and+corrections",
  },
] as const;

const LICENSED_AGENCIES_BY_LOCATION = [
  {
    location: "বাংলাদেশ",
    agencies: [
      {
        name: "বাংলাদেশ হজ পোর্টাল (সরকারি)",
        contact: "https://hajj.gov.bd",
        note: "সরকার অনুমোদিত হজ এজেন্সির সর্বশেষ তালিকা ও নোটিশ।",
      },
      {
        name: "ধর্ম বিষয়ক মন্ত্রণালয় – হজ শাখা",
        contact: "https://mora.gov.bd",
        note: "লাইসেন্স যাচাই, নীতিমালা ও অফিসিয়াল ঘোষণা।",
      },
      {
        name: "HAAB (Hajj Agencies Association of Bangladesh)",
        contact: "https://haab.org.bd",
        note: "সদস্যভুক্ত হজ এজেন্সির ডিরেক্টরি ও যোগাযোগ তথ্য।",
      },
    ],
  },
  {
    location: "সৌদি আরব",
    agencies: [
      {
        name: "Nusuk (Saudi Official Platform)",
        contact: "https://www.nusuk.sa",
        note: "সৌদি অনুমোদিত উমরা সেবা, অপারেটর ও প্যাকেজ যাচাইয়ের অফিসিয়াল প্ল্যাটফর্ম।",
      },
      {
        name: "Ministry of Hajj and Umrah (KSA)",
        contact: "https://www.haj.gov.sa",
        note: "সৌদি সরকারের অফিসিয়াল হজ্ব-উমরা তথ্য ও নির্দেশনা।",
      },
    ],
  },
] as const;

function SubsectionBackButton() {
  return (
    <div className="pt-2">
      <Button asChild variant="outline" className="rounded-full border-emerald-400/40">
        <Link href="/hajj-umrah">হজ্ব ও উমরা হোমে ফিরুন</Link>
      </Button>
    </div>
  );
}

function BooksSection() {
  return (
    <GlassCard>
      <h3 className="text-xl font-semibold">অধ্যায়ভিত্তিক হজ্ব-উমরা বই</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        প্রতিটি অধ্যায়ে সংশ্লিষ্ট বিষয়ের কনটেন্ট দেওয়া হয়েছে যাতে ধাপে ধাপে পড়া ও বোঝা সহজ হয়।
      </p>
      <BooksSectionClient chapters={BOOK_CHAPTERS} />
      <div className="mt-3 text-sm text-muted-foreground">মোট বই: 24টি (২টি অধ্যায়ে বিভক্ত)</div>
      <SubsectionBackButton />
    </GlassCard>
  );
}

function VisualHajjSection() {
  return (
    <GlassCard>
      <h3 className="text-xl font-semibold">সচিত্র হজ্ব</h3>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
        {VISUAL_HAJJ_ITEMS.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <SubsectionBackButton />
    </GlassCard>
  );
}

function VisualUmrahSection() {
  return (
    <GlassCard>
      <h3 className="text-xl font-semibold">সচিত্র উমরা</h3>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
        {VISUAL_UMRAH_ITEMS.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <SubsectionBackButton />
    </GlassCard>
  );
}

function DuaSection() {
  return (
    <GlassCard>
      <h3 className="text-xl font-semibold">নতুন চাঁদ দেখে পড়ার দু&apos;আ</h3>
      <p className="arabic-text mt-4 text-right text-[1.5rem] leading-relaxed text-amber-500">{NEW_MOON_DUA.arabic}</p>
      <p className="mt-4 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">উচ্চারণ:</span> {NEW_MOON_DUA.pronunciation}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">বাংলা অর্থ:</span> {NEW_MOON_DUA.meaning}
      </p>
      <SubsectionBackButton />
    </GlassCard>
  );
}

function MasailSection() {
  return (
    <GlassCard>
      <h3 className="text-xl font-semibold">মাসাইল</h3>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
        <li>ইহরাম অবস্থায় ভুল হলে কখন দম, কখন সাদাকা প্রযোজ্য</li>
        <li>তাওয়াফ বা সায়ি ভেঙে গেলে পুনরায় করণের সঠিক পদ্ধতি</li>
        <li>মহিলাদের বিশেষ অবস্থা (হায়েজ/নেফাস) সম্পর্কিত নির্দেশনা</li>
        <li>মীকাত অতিক্রমের আগে-পরে করণীয় বিষয়ে সাধারণ প্রশ্নোত্তর</li>
      </ul>
      <SubsectionBackButton />
    </GlassCard>
  );
}

function KitabSection() {
  return (
    <GlassCard>
      <h3 className="text-xl font-semibold">হজ্ব ও উমরা সম্পর্কিত কিতাব</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {HAJJ_KITABS.map((kitab) => (
          <div key={kitab.name} className="rounded-xl border border-emerald-400/20 p-4">
            <p className="font-semibold text-emerald-500">{kitab.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{kitab.focus}</p>
          </div>
        ))}
      </div>
      <SubsectionBackButton />
    </GlassCard>
  );
}

function TrainingSection() {
  return (
    <GlassCard>
      <h3 className="text-xl font-semibold">হজ্ব প্রশিক্ষণ ভিডিও টিউটোরিয়াল</h3>
      <p className="mt-2 text-sm text-muted-foreground">বিভিন্ন ইসলামিক স্কলার ও ইমামের আলোচনা থেকে নির্ভুলভাবে হজ্ব-উমরা শিখতে ভিডিও রিসোর্স।</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {TRAINING_VIDEOS.map((video) => (
          <div key={video.title} className="rounded-xl border border-emerald-400/20 p-4">
            <p className="font-semibold">{video.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{video.scholar}</p>
            <Button asChild variant="outline" size="sm" className="mt-3 rounded-full border-emerald-400/40">
              <a href={video.url} target="_blank" rel="noreferrer">
                ভিডিও দেখুন <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
        ))}
      </div>
      <SubsectionBackButton />
    </GlassCard>
  );
}

function AgencySection() {
  return (
    <GlassCard>
      <h3 className="text-xl font-semibold">লাইসেন্সপ্রাপ্ত হজ্ব ও উমরা এজেন্সি উৎস</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        লোকেশন অনুযায়ী অফিসিয়াল/লাইসেন্স-ভিত্তিক উৎস তালিকা দেওয়া হলো। বুকিংয়ের আগে সর্বশেষ লাইসেন্স অবশ্যই যাচাই করুন।
      </p>
      <div className="mt-4 space-y-4">
        {LICENSED_AGENCIES_BY_LOCATION.map((group) => (
          <div key={group.location} className="rounded-xl border border-emerald-400/20 p-4">
            <h4 className="font-semibold text-emerald-500">{group.location}</h4>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {group.agencies.map((agency) => (
                <div key={agency.name} className="rounded-lg border border-emerald-400/15 p-3">
                  <p className="font-medium">{agency.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{agency.note}</p>
                  <Button asChild variant="outline" size="sm" className="mt-3 rounded-full border-emerald-400/40">
                    <a href={agency.contact} target="_blank" rel="noreferrer">
                      যোগাযোগ / যাচাই <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <SubsectionBackButton />
    </GlassCard>
  );
}

const SECTION_CONFIG = {
  books: {
    title: "হজ্ব-উমরা বই",
    subtitle: "অধ্যায়ভিত্তিক বই তালিকা এবং সংশ্লিষ্ট বিষয়বস্তু।",
    content: <BooksSection />,
  },
  "hajj-visual": {
    title: "সচিত্র হজ্ব",
    subtitle: "হজ্বের ধাপসমূহ এক নজরে ভিজ্যুয়াল তালিকায়।",
    content: <VisualHajjSection />,
  },
  "umrah-visual": {
    title: "সচিত্র উমরা",
    subtitle: "উমরার প্রধান বিষয়গুলো সহজ তালিকায়।",
    content: <VisualUmrahSection />,
  },
  dua: {
    title: "দু'আ",
    subtitle: "নতুন চাঁদ দেখে পড়ার দু'আ: আরবি, উচ্চারণ ও বাংলা অর্থ।",
    content: <DuaSection />,
  },
  masail: {
    title: "মাসাইল",
    subtitle: "হজ্ব-উমরার সাধারণ ফিকহি প্রশ্ন ও ব্যবহারিক নির্দেশনা।",
    content: <MasailSection />,
  },
  kitab: {
    title: "কিতাব",
    subtitle: "হজ্ব ও উমরা সম্পর্কিত বিভিন্ন কিতাব।",
    content: <KitabSection />,
  },
  training: {
    title: "হজ্ব প্রশিক্ষণ",
    subtitle: "বিভিন্ন আলেম ও ইমামের ভিডিও টিউটোরিয়াল।",
    content: <TrainingSection />,
  },
  agency: {
    title: "হজ্ব এজেন্সি",
    subtitle: "লোকেশনভিত্তিক লাইসেন্স যাচাইযোগ্য এজেন্সি উৎস।",
    content: <AgencySection />,
  },
} as const;

export default function HajjUmrahSectionPage({ params }: { params: { section: string } }) {
  const section = SECTION_CONFIG[params.section as keyof typeof SECTION_CONFIG];
  if (!section) {
    notFound();
  }

  return (
    <PageShell id="hajj-umrah-subsection" title={section.title} subtitle={section.subtitle}>
      {section.content}
    </PageShell>
  );
}
