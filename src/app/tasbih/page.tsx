"use client";

import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTasbihStore } from "@/store/tasbih-store";
import { PageShell } from "@/components/shared/page-shell";
import { MotionReveal } from "@/components/motion/motion-section";

export default function TasbihPage() {
  const { count, increment, reset } = useTasbihStore();

  return (
    <PageShell
      id="tasbih-title"
      title="ডিজিটাল তাসবিহ"
      subtitle="স্বয়ংক্রিয়ভাবে সংরক্ষণ হওয়া শান্ত, বিঘ্নহীন কাউন্টারে জিকির গুনুন।"
    >
      <MotionReveal>
        <div className="mx-auto flex max-w-md flex-col items-center gap-5 rounded-3xl border border-emerald-400/20 bg-white/5 p-5 backdrop-blur-xl sm:gap-6 sm:p-8">
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={increment}
            className="flex h-44 w-44 items-center justify-center rounded-full border-4 border-emerald-500/40 bg-emerald-500/10 text-4xl font-semibold text-emerald-500 shadow-2xl sm:h-52 sm:w-52 sm:text-5xl"
            aria-label="তাসবিহ কাউন্টার বাড়ান"
          >
            {count}
          </motion.button>

          <Button variant="outline" onClick={reset} className="rounded-full border-amber-500/40">
            <RotateCcw className="mr-2 h-4 w-4" />
            কাউন্টার রিসেট
          </Button>
        </div>
      </MotionReveal>
    </PageShell>
  );
}
