"use client";

import jsPDF from "jspdf";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

type BookEntry = {
  title: string;
  content: string;
};

type BookChapter = {
  chapterTitle: string;
  books: Array<BookEntry>;
};

function toSafeFilename(text: string) {
  return text
    .replace(/[\\/:*?"<>|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function downloadBookPdf(bookNumber: number, book: BookEntry) {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 14;
  const maxWidth = pageWidth - margin * 2;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  pdf.text(`Book #${bookNumber}: Hajj & Umrah Guide`, margin, 18);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(12);

  const wrappedTitle = pdf.splitTextToSize(`Title: ${book.title}`, maxWidth);
  pdf.text(wrappedTitle, margin, 30);

  const wrappedBody = pdf.splitTextToSize(`Content: ${book.content}`, maxWidth);
  pdf.text(wrappedBody, margin, 44);

  pdf.save(`Book-${bookNumber}-${toSafeFilename(book.title)}.pdf`);
}

export function BooksSectionClient({ chapters }: { chapters: readonly BookChapter[] }) {
  let bookCounter = 1;

  return (
    <div className="mt-4 space-y-6">
      {chapters.map((chapter) => {
        const chapterBooks = chapter.books.map((book) => {
          const currentNum = bookCounter;
          bookCounter++;
          return { num: currentNum, ...book };
        });

        return (
          <div key={chapter.chapterTitle} className="rounded-xl border border-emerald-400/20 p-4">
            <h4 className="mb-4 text-lg font-semibold text-emerald-600">{chapter.chapterTitle}</h4>
            <Accordion type="single" collapsible className="space-y-2">
              {chapterBooks.map(({ num, title, content }) => (
                <AccordionItem key={`${num}-${title}`} value={`book-${num}`}>
                  <AccordionTrigger className="hover:text-emerald-600">
                    <span className="font-medium text-emerald-700">{num}.</span>
                    <span className="ml-2">{title}</span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-3 text-sm text-muted-foreground">{content}</p>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="rounded-full border-emerald-400/40"
                      onClick={() => downloadBookPdf(num, { title, content })}
                    >
                      PDF ডাউনলোড (#এ{num})
                    </Button>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        );
      })}
    </div>
  );
}
