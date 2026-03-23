import { Compass, SearchX, Sparkles } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { Skeleton } from "@/components/ui/skeleton";

export function DataPageSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <GlassCard key={index}>
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-3 h-6 w-2/3" />
          <Skeleton className="mt-3 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-4/5" />
        </GlassCard>
      ))}
    </div>
  );
}

export function EmptyStateCard({
  title,
  description,
  icon = "sparkles",
}: {
  title: string;
  description: string;
  icon?: "sparkles" | "search" | "compass";
}) {
  const Icon = icon === "search" ? SearchX : icon === "compass" ? Compass : Sparkles;

  return (
    <GlassCard className="text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/12 text-emerald-500">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </GlassCard>
  );
}

export function CompassSkeleton() {
  return (
    <GlassCard className="space-y-5">
      <Skeleton className="h-10 w-44 rounded-full" />
      <div className="flex justify-center">
        <Skeleton className="h-56 w-56 rounded-full sm:h-64 sm:w-64" />
      </div>
      <Skeleton className="mx-auto h-4 w-64" />
    </GlassCard>
  );
}
