# Permanence, SEO, and accessibility

Applies everywhere. People will link to our chapters, figures, and headings
from docs, Slack, and interview prep notes for years. Never break them.

## Permanent identifiers

| Identifier         | Example                                    | Changeable?                                  |
| ------------------ | ------------------------------------------ | -------------------------------------------- |
| Chapter URL        | `/chapters/design-a-notification-system`   | Never. Rename → add old slug to `aliases`.   |
| Heading anchor     | `#deep-dives`, `#retry-with-backoff`       | Never once published. Use `[#explicit-id]` to keep the old anchor if heading text changes. |
| Figure anchor      | `#fig-high-level-design`                   | Never. `id` is fixed at publish.             |
| Glossary anchor    | `/glossary#idempotency-key`                | Never.                                       |
| Feed item GUID     | chapter URL                                | Never.                                       |

- Chapter numbers ("Chapter 7") are **display only**, derived from `parts.yml`
  order, and never appear in URLs, file names, or figure IDs.
- Explicit heading IDs: `## Retries and backoff [#retry-with-backoff]` (MDX treats `{…}` as code, so we use brackets). Add one
  whenever you edit a published heading's text.
- Removing a published chapter: set `status: archived` (it stays reachable with a
  banner). Never delete the file.

## SEO

- Each chapter: `<title>` = `{title} — Backend Mastery`, meta description from
  frontmatter, canonical URL, Open Graph + Twitter card (generated OG image
  showing title + part), `Article` JSON-LD (headline, author, datePublished,
  dateModified, image).
- One `<h1>` per page. Logical heading order, no skipped levels.
- Internal linking is SEO and pedagogy: link prerequisites, building blocks,
  and related case studies generously but meaningfully.
- Full-content RSS/Atom; sitemap with `lastmod` from `updated`.
- No drafts in sitemap, feeds, or production builds.

## Accessibility (WCAG 2.2 AA minimum)

- Text contrast ≥ 4.5:1 (body) and ≥ 3:1 (large text, UI, diagram strokes),
  in both themes.
- Every figure has meaningful `alt`; decorative images don't exist here.
- Tables have header rows; complex tables have a caption.
- Keyboard: everything interactive reachable and operable; visible focus;
  "Skip to content" link.
- Code blocks: horizontally scrollable with keyboard (`tabindex="0"`), not
  wrapped mid-token; copy button has an accessible label.
- Never convey meaning by color alone (diagrams included).
- Respect `prefers-reduced-motion` and `prefers-color-scheme`.

## Performance budget (long chapter, mobile, 4G)

| Metric                          | Budget     |
| ------------------------------- | ---------- |
| LCP                             | < 1.8 s    |
| CLS                             | < 0.02     |
| INP                             | < 100 ms   |
| JS shipped (route, gzip)        | < 70 KB    |
| Fonts                           | ≤ 3 files, `font-display: swap`, subset |
| Figures                         | Width/height from the SVG viewBox (no layout shift); lazy-loaded |
