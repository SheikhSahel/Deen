"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-destructive/30 bg-destructive/10 p-6 text-center">
      <h2 className="text-xl font-semibold">কিছু সমস্যা হয়েছে</h2>
      <p className="mt-2 text-sm text-muted-foreground">অপ্রত্যাশিত একটি ত্রুটি ঘটেছে। আবার চেষ্টা করুন।</p>
      <Button onClick={reset} className="mt-4">
        আবার চেষ্টা করুন
      </Button>
    </div>
  );
}
