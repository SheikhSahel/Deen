import { cn } from "@/lib/utils";

export function GlassCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-emerald-300/25 bg-gradient-to-br from-white/15 via-white/10 to-transparent p-4 shadow-[0_10px_35px_rgba(0,0,0,0.08)] backdrop-blur-md transition duration-300 hover:border-emerald-300/35 sm:p-5",
        className,
      )}
    >
      {children}
    </div>
  );
}
