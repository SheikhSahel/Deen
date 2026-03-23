import Link from "next/link";
import { PageShell } from "@/components/shared/page-shell";
import { GlassCard } from "@/components/shared/glass-card";
import { MotionReveal, MotionStagger } from "@/components/motion/motion-section";
import { Button } from "@/components/ui/button";

export default function NamazPage() {
  return (
    <PageShell
      id="namaz-title"
      title="নামাজ"
      subtitle="আপনি কি নামাজের সময় জানতে চান, নাকি নামাজ শিখতে চান—একটি অপশন বেছে নিন।"
    >
      <MotionStagger className="grid gap-4 md:grid-cols-2">
        <MotionReveal>
          <GlassCard className="space-y-3">
            <h3 className="text-lg font-semibold">নামাজের সময়</h3>
            <p className="text-sm text-muted-foreground">আপনার লোকেশন অনুযায়ী সঠিক নামাজের সময়, সুহুর ও ইফতার সময় জানুন।</p>
            <Button asChild className="rounded-full bg-emerald-700 hover:bg-emerald-800">
              <Link href="/prayer-times">নামাজের সময় দেখতে যান</Link>
            </Button>
          </GlassCard>
        </MotionReveal>

        <MotionReveal>
          <GlassCard className="space-y-3">
            <h3 className="text-lg font-semibold">নামাজ শিক্ষা</h3>
            <p className="text-sm text-muted-foreground">নামাজের নিয়ম, দোয়া, দরূদ এবং সঠিক পদ্ধতি ধাপে ধাপে শিখুন।</p>
            <Button asChild variant="outline" className="rounded-full border-emerald-400/40">
              <Link href="/namaz-shikkha">নামাজ শিক্ষা অংশে যান</Link>
            </Button>
          </GlassCard>
        </MotionReveal>
      </MotionStagger>
    </PageShell>
  );
}
