/**
 * Content schemas — the executable form of `.claude/rules/frontmatter-schema.md`.
 * Keep the two in sync: change both in the same commit.
 */
import { z } from "zod";

/** Kebab-case identifier. A leading underscore marks a dev-only fixture (e.g. `_template`). */
export const slugPattern = /^_?[a-z0-9]+(?:-[a-z0-9]+)*$/;
const kebab = z.string().regex(slugPattern, "must be kebab-case");

/** YAML may yield a Date or a string depending on the parser; normalize to `YYYY-MM-DD`. */
const isoDate = z.preprocess(
  (value) => (value instanceof Date ? value.toISOString().slice(0, 10) : value),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "must be an ISO date (YYYY-MM-DD)"),
);

export const chapterKinds = ["case-study", "building-block", "essay"] as const;
export const chapterStatuses = ["draft", "review", "published", "archived"] as const;

export const referenceSchema = z.object({
  title: z.string().min(1),
  authors: z.string().optional(),
  year: z.number().int().optional(),
  url: z.url(),
});

export const revisionSchema = z.object({
  date: isoDate,
  note: z.string().min(1),
});

const chapterObject = z.object({
  slug: kebab,
  kind: z.enum(chapterKinds),
  title: z.string().min(1).max(60),
  subtitle: z.string().min(1).max(110),
  description: z.string().min(120).max(160),
  part: kebab,
  tags: z.array(kebab).max(5).default([]),
  prerequisites: z.array(kebab).default([]),
  status: z.enum(chapterStatuses),
  authors: z.array(kebab).default([]),
  reviewers: z.array(kebab).default([]),
  published: isoDate.optional(),
  updated: isoDate,
  cover: z.string().optional(),
  aliases: z.array(kebab).default([]),
  references: z.array(referenceSchema).default([]),
  revisions: z.array(revisionSchema).default([]),
});

function refineChapter(chapter: z.infer<typeof chapterObject>, ctx: z.RefinementCtx) {
  const live = chapter.status === "published" || chapter.status === "archived";
  if (live && !chapter.published) {
    ctx.addIssue({ code: "custom", path: ["published"], message: "required once published" });
  }
  if (live && chapter.authors.length === 0) {
    ctx.addIssue({ code: "custom", path: ["authors"], message: "at least one author required" });
  }
  if (chapter.slug.startsWith("_") && chapter.status !== "draft") {
    ctx.addIssue({ code: "custom", path: ["status"], message: "fixtures must stay draft" });
  }
}

/** Frontmatter only (content lint). */
export const chapterSchema = chapterObject.superRefine(refineChapter);

/** Frontmatter plus the MDX body (content-collections). */
export const chapterDocumentSchema = chapterObject
  .extend({ content: z.string() })
  .superRefine(refineChapter);

export type ChapterFrontmatter = z.infer<typeof chapterSchema>;

export const partSchema = z.object({
  key: kebab,
  title: z.string().min(1),
  description: z.string().min(1),
  chapters: z.array(kebab).default([]),
  planned: z.array(kebab).default([]),
});

export const bookSchema = z.object({ parts: z.array(partSchema).min(1) });

export const glossaryEntrySchema = z.object({
  term: z.string().min(1),
  definition: z.string().min(1),
  owner: kebab.optional(),
});
export const glossarySchema = z.record(kebab, glossaryEntrySchema);

export const authorSchema = z.object({
  name: z.string().min(1),
  role: z.string().optional(),
  bio: z.string().optional(),
  url: z.url().optional(),
  github: z.string().optional(),
});
export const authorsSchema = z.record(kebab, authorSchema);
