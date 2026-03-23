import { notFound } from "next/navigation";
import { PageShell } from "@/components/shared/page-shell";
import { KitabReader } from "@/components/kitab/kitab-reader";
import { getKitabById, KITAB_BOOKS } from "@/lib/kitab-data";

type BookPageProps = {
  params: {
    bookId: string;
  };
};

export function generateStaticParams() {
  return KITAB_BOOKS.map((book) => ({ bookId: book.id }));
}

export default function KitabDetailsPage({ params }: BookPageProps) {
  const book = getKitabById(params.bookId);

  if (!book) {
    notFound();
  }

  return (
    <PageShell
      id="kitab-reader-title"
      title={book.title}
      subtitle={`${book.category} • ${book.description} • অধ্যায় ধরে পড়ুন`}
      className="space-y-6"
    >
      <KitabReader book={book} />
    </PageShell>
  );
}
