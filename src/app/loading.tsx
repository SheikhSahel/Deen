import { LoadingGrid } from "@/components/shared/loading-grid";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-52 animate-pulse rounded bg-muted" />
      <LoadingGrid />
    </div>
  );
}
