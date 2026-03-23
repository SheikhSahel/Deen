export type SourceMeta = {
  book: string;
  chapter?: string;
  grade?: string;
};

export type StaticDua = {
  arabic: string;
  translation: string;
  transliteration?: string;
  source?: SourceMeta;
  verified?: boolean;
  contexts?: string[];
};

export type StaticDuaCategory = {
  title: string;
  duas: StaticDua[];
  verified?: boolean;
  verifier?: string;
};

export type BookItem = {
  title: string;
  content: string;
};

export type BookChapter = {
  chapterTitle: string;
  books: BookItem[];
};

function assertString(value: unknown, label: string): asserts value is string {
  if (typeof value !== "string") {
    throw new Error(`Invalid schema: ${label} must be a non-empty string`);
  }
  if (value.trim().length === 0) {
    throw new Error(`Invalid schema: ${label} must be a non-empty string`);
  }
}

export function validateDuaCategoriesSchema(categories: readonly StaticDuaCategory[]) {
  if (!Array.isArray(categories) || categories.length === 0) {
    throw new Error("Invalid schema: DUA_CATEGORIES must be a non-empty array");
  }

  categories.forEach((category: StaticDuaCategory, cIdx: number) => {
    assertString(category.title, `DUA_CATEGORIES[${cIdx}].title`);

    if (!Array.isArray(category.duas) || category.duas.length === 0) {
      throw new Error(`Invalid schema: DUA_CATEGORIES[${cIdx}].duas must be a non-empty array`);
    }

    category.duas.forEach((dua: StaticDua, dIdx: number) => {
      assertString(dua.arabic, `DUA_CATEGORIES[${cIdx}].duas[${dIdx}].arabic`);
      assertString(dua.translation, `DUA_CATEGORIES[${cIdx}].duas[${dIdx}].translation`);

      if (dua.source) {
        assertString(dua.source.book, `DUA_CATEGORIES[${cIdx}].duas[${dIdx}].source.book`);
        if (dua.source.chapter !== undefined) {
          assertString(dua.source.chapter, `DUA_CATEGORIES[${cIdx}].duas[${dIdx}].source.chapter`);
        }
        if (dua.source.grade !== undefined) {
          assertString(dua.source.grade, `DUA_CATEGORIES[${cIdx}].duas[${dIdx}].source.grade`);
        }
      }
    });
  });

  return categories;
}

export function validateBookChaptersSchema(chapters: readonly BookChapter[]) {
  if (!Array.isArray(chapters) || chapters.length === 0) {
    throw new Error("Invalid schema: book chapters must be a non-empty array");
  }

  chapters.forEach((chapter: BookChapter, cIdx: number) => {
    assertString(chapter.chapterTitle, `BOOK_CHAPTERS[${cIdx}].chapterTitle`);

    if (!Array.isArray(chapter.books) || chapter.books.length === 0) {
      throw new Error(`Invalid schema: BOOK_CHAPTERS[${cIdx}].books must be a non-empty array`);
    }

    chapter.books.forEach((book: BookItem, bIdx: number) => {
      assertString(book.title, `BOOK_CHAPTERS[${cIdx}].books[${bIdx}].title`);
      assertString(book.content, `BOOK_CHAPTERS[${cIdx}].books[${bIdx}].content`);
    });
  });

  return chapters;
}
