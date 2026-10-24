/**
 * The content adapter — the ONLY module that knows how content is loaded (ADR 0002).
 * Routes and components import from "@/lib/content", never from "content-collections".
 */
import {
  allChapters,
  author as authorsDoc,
  book,
  glossary as glossaryDoc,
  type Chapter as GeneratedChapter,
} from "content-collections";

export type Chapter = GeneratedChapter;
export type { Citation } from "./analyze";
export type { TocItem } from "./headings";
export type { ResolvedFigure } from "./figures";

/** Drafts, reviews, and `_fixtures` are visible in development and Vercel preview builds only. */
export const showDrafts =
  process.env.NODE_ENV !== "production" || process.env.VERCEL_ENV === "preview";

const isPublic = (c: Chapter) => c.status === "published" || c.status === "archived";

/** Chapters in reading order: parts.yml order first, then anything unlisted (lint flags those). */
function inReadingOrder(chapters: Chapter[]): Chapter[] {
  const order = book.parts.flatMap((part) => part.chapters);
  const rank = (c: Chapter) => {
    const index = order.indexOf(c.slug);
    return index === -1 ? Number.MAX_SAFE_INTEGER : index;
  };
  return [...chapters].sort((a, b) => rank(a) - rank(b) || a.title.localeCompare(b.title));
}

/** Chapters that appear in listings, TOC, feeds, and the sitemap. Archived ones stay out. */
export function getChapters({ includeDrafts = showDrafts } = {}): Chapter[] {
  return inReadingOrder(
    allChapters.filter(
      (c) =>
        !c.isFixture &&
        c.status !== "archived" &&
        (c.status === "published" || includeDrafts),
    ),
  );
}

/** Chapters that get a page. Archived chapters keep their URL forever (ADR 0004). */
export function getRoutableChapters(): Chapter[] {
  return allChapters.filter((c) => isPublic(c) || showDrafts);
}

export function getChapter(slug: string): Chapter | undefined {
  return getRoutableChapters().find((c) => c.slug === slug);
}

/** Display-only chapter number, derived from reading order. Never use in URLs or ids. */
export function getChapterNumber(slug: string): number | undefined {
  const index = getChapters().findIndex((c) => c.slug === slug);
  return index === -1 ? undefined : index + 1;
}

export function getNeighbors(slug: string) {
  const chapters = getChapters();
  const index = chapters.findIndex((c) => c.slug === slug);
  return {
    previous: index > 0 ? chapters[index - 1] : undefined,
    next: index !== -1 ? chapters[index + 1] : undefined,
  };
}

/** Chapters that list `slug` as a prerequisite. */
export function getUsedIn(slug: string): Chapter[] {
  return getChapters().filter((c) => c.prerequisites.includes(slug));
}

export type Part = (typeof book.parts)[number] & { items: Chapter[] };

export function getParts(): Part[] {
  const chapters = getChapters();
  return book.parts.map((part) => ({
    ...part,
    items: chapters.filter((c) => c.part === part.key),
  }));
}

export function getPart(key: string): Part | undefined {
  return getParts().find((part) => part.key === key);
}

/** Display title for a planned chapter that has no file yet: "design-a-rate-limiter" → "Design a rate limiter". */
function titleFromSlug(slug: string): string {
  const words = slug.split("-").join(" ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export type PlannedChapter = { slug: string; title: string };

/** The part's roadmap: planned slugs that are not yet written chapters, in order. */
export function getPlanned(part: Part): PlannedChapter[] {
  const written = new Set(allChapters.map((c) => c.slug));
  return part.planned
    .filter((slug) => !written.has(slug))
    .map((slug) => ({ slug, title: titleFromSlug(slug) }));
}

/** Roman numeral for a part's position (1 → "I"); parts are few, so a lookup suffices. */
export function partNumeral(key: string): string {
  const index = book.parts.findIndex((part) => part.key === key);
  return ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"][index] ?? String(index + 1);
}

/** Totals for the home page, counted over listed chapters only. */
export function getBookStats() {
  const chapters = getChapters();
  return {
    chapters: chapters.length,
    figures: chapters.reduce((sum, c) => sum + c.figures.length, 0),
    sources: chapters.reduce((sum, c) => sum + c.citations.length + c.references.length, 0),
    planned: getParts().reduce((sum, part) => sum + getPlanned(part).length, 0),
  };
}

export function getTags(): Map<string, Chapter[]> {
  const tags = new Map<string, Chapter[]>();
  for (const chapter of getChapters()) {
    for (const tag of chapter.tags) tags.set(tag, [...(tags.get(tag) ?? []), chapter]);
  }
  return new Map([...tags].sort(([a], [b]) => a.localeCompare(b)));
}

export type GlossaryEntry = { id: string; term: string; definition: string; owner?: string };

export function getGlossary(): GlossaryEntry[] {
  const { _meta, ...entries } = glossaryDoc;
  void _meta;
  return Object.entries(entries as Record<string, Omit<GlossaryEntry, "id">>)
    .map(([id, entry]) => ({ id, ...entry }))
    .sort((a, b) => a.term.localeCompare(b.term));
}

export function getGlossaryEntry(id: string): GlossaryEntry | undefined {
  return getGlossary().find((entry) => entry.id === id);
}

export type Author = { key: string; name: string; role?: string; bio?: string; url?: string; github?: string };

export function getAuthors(keys: string[]): Author[] {
  const { _meta, ...all } = authorsDoc ?? { _meta: undefined };
  void _meta;
  const directory = all as Record<string, Omit<Author, "key">>;
  return keys.flatMap((key) => {
    const entry = directory[key];
    return entry ? [{ key, ...entry }] : [];
  });
}

export { listFigureFiles, readFigureFile } from "./figures";
