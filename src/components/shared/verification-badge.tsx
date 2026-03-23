import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function VerificationBadge({
  label = "যাচাইকৃত",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-300",
        className,
      )}
      aria-label={`${label} কনটেন্ট`}
    >
      <BadgeCheck className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}
