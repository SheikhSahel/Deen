import Link from "next/link";
import { PageShell } from "@/components/shared/page-shell";
import { GlassCard } from "@/components/shared/glass-card";
import { MotionReveal, MotionStagger } from "@/components/motion/motion-section";
import { Button } from "@/components/ui/button";

export default function QuranPage() {
  return (
    <PageShell
      id="quran-title"
      title="কুরআন"
      subtitle="আপনি কি কুরআন পড়তে চান, নাকি কুরআন শিখতে চান—একটি অপশন বেছে নিন।"
    >
      <MotionStagger className="grid gap-4 md:grid-cols-2">
        <MotionReveal>
          <GlassCard className="space-y-3">
            <h2 className="text-lg font-semibold">কুরআন পড়ুন</h2>
            <p className="text-sm text-muted-foreground">সূরা অনুসন্ধান, অনুবাদসহ পাঠ এবং এক ক্লিকে পুরো কুরআন শোনার সুবিধা।</p>
            <Button asChild className="rounded-full bg-emerald-700 hover:bg-emerald-800">
              <Link href="/quran/read">কুরআন পড়তে যান</Link>
            </Button>
          </GlassCard>
        </MotionReveal>

        <MotionReveal>
          <GlassCard className="space-y-3">
            <h2 className="text-lg font-semibold">কুরআন শিক্ষা</h2>
            <p className="text-sm text-muted-foreground">বেসিক থেকে অ্যাডভান্সড—ধাপে ধাপে তাজবিদ ও শুদ্ধ তিলাওয়াত শেখার গাইডলাইন।</p>
            <Button asChild variant="outline" className="rounded-full border-emerald-400/40">
              <Link href="/quran/learn">কুরআন শিক্ষা অংশে যান</Link>
            </Button>
          </GlassCard>
        </MotionReveal>
      </MotionStagger>
    </PageShell>
  );
}
