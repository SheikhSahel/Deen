import type { Metadata } from "next";
import { Amiri, Noto_Sans_Bengali, Inter } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageTransition } from "@/components/layout/page-transition";
import { SITE_NAME } from "@/lib/constants";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const amiri = Amiri({ subsets: ["arabic"], weight: ["400", "700"], variable: "--font-amiri" });
const notoSansBengali = Noto_Sans_Bengali({ subsets: ["bengali"], weight: ["400", "500", "600", "700"], variable: "--font-bn" });

export const metadata: Metadata = {
  metadataBase: new URL("https://noor-platform.vercel.app"),
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/apple-touch-icon.svg",
  },
  alternates: {
    canonical: "/",
  },
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "নূর একটি আধুনিক ইসলামিক প্ল্যাটফর্ম যেখানে নামাজের সময়সূচি, কুরআন, হাদিস, দু'আ, কিবলা দিকনির্দেশনা এবং দৈনন্দিন ইবাদতের টুল রয়েছে।",
  keywords: ["ইসলামিক প্ল্যাটফর্ম", "নামাজের সময়", "কুরআন", "হাদিস", "কিবলা"],
  openGraph: {
    title: SITE_NAME,
    description: "প্রতিদিনের ইবাদত ও আধ্যাত্মিক চর্চার জন্য পূর্ণাঙ্গ ইসলামিক অভিজ্ঞতা।",
    type: "website",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: "প্রতিদিনের ইবাদত ও আধ্যাত্মিক চর্চার জন্য পূর্ণাঙ্গ ইসলামিক অভিজ্ঞতা।",
    images: ["/twitter-image.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <body className={`${inter.variable} ${amiri.variable} ${notoSansBengali.variable} antialiased`}>
        <AppProviders>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-emerald-600 focus:px-4 focus:py-2 focus:text-white"
          >
            মূল কনটেন্টে যান
          </a>
          <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <main id="main-content" className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-5 sm:py-8 md:px-6 md:py-10 lg:py-12">
              <PageTransition>{children}</PageTransition>
            </main>
            <Footer />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
