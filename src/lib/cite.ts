import { getAuthors, type Chapter } from "@/lib/content";
import { absoluteUrl, site } from "@/lib/site";

export type ChapterCitation = {
  url: string;
  authors: string;
  year: string;
  /** Suggested human-readable citation. */
  text: string;
  bibtex: string;
};

/** How to cite a chapter. Authors fall back to the publication when none are listed. */
export function chapterCitation(chapter: Chapter): ChapterCitation {
  const url = absoluteUrl(`/chapters/${chapter.slug}`);
  const names = getAuthors(chapter.authors).map((a) => a.name);
  const authors = names.length > 0 ? names.join(", ") : site.name;
  const year = (chapter.published ?? chapter.updated).slice(0, 4);
  const bibAuthor = names.length > 0 ? names.join(" and ") : `{${site.name}}`;

  return {
    url,
    authors,
    year,
    text: `${authors}. (${year}). ${chapter.title}. ${site.name}. ${url}`,
    bibtex: [
      `@misc{backendmastery:${chapter.slug},`,
      `  author       = {${bibAuthor}},`,
      `  title        = {${chapter.title}},`,
      `  year         = {${year}},`,
      `  howpublished = {\\url{${url}}},`,
      `  note         = {${site.name}, last updated ${chapter.updated}}`,
      `}`,
    ].join("\n"),
  };
}
