import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-emerald-400/20 bg-white/5 p-8 text-center backdrop-blur-xl">
      <h2 className="text-2xl font-semibold">পৃষ্ঠা পাওয়া যায়নি</h2>
      <p className="mt-2 text-sm text-muted-foreground">আপনি যে পৃষ্ঠাটি খুঁজছেন, সেটি নেই।</p>
      <Button asChild className="mt-4 bg-emerald-700 hover:bg-emerald-800">
        <Link href="/">হোমে ফিরে যান</Link>
      </Button>
    </div>
  );
}
