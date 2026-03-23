import Link from "next/link";
import { GlassCard } from "@/components/shared/glass-card";
import { PageShell } from "@/components/shared/page-shell";
import { KITAB_BOOKS } from "@/lib/kitab-data";

export default function KitabPage() {
  return (
    <PageShell
      id="kitab-title"
      title="কিতাব"
      subtitle="প্রতিটি বইয়ে ঢুকে অধ্যায় ধরে পড়ুন, আগের/পরের অধ্যায়ে যান এবং ধারাবাহিকভাবে পড়াশোনা করুন।"
      className="space-y-6"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {KITAB_BOOKS.map((book) => (
          <GlassCard key={book.id} className="interactive-lift h-full">
            <h3 className="text-lg font-semibold text-emerald-500">{book.title}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{book.category}</p>
            <p className="mt-3 text-sm text-muted-foreground">{book.description}</p>
            <Link href={`/kitab/${book.id}`} className="mt-4 inline-block text-sm font-medium text-emerald-600 hover:underline">
              বইটি পড়ুন
            </Link>
          </GlassCard>
        ))}
      </div>
    </PageShell>
  );
}
