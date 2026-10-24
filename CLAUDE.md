# Backend Mastery — Engineering Blog

A long-form engineering publication. We start with **system design chapters**
("Design a notification system", "Design a rate limiter", …): deep, diagram-rich
write-ups that working engineers trust enough to bookmark for years.

This file is the constitution. Detailed rules live in `.claude/rules/` and load
automatically. If a rule here conflicts with a scoped rule, this file wins.

---

## 1. Principles (in priority order)

1. **Correct over clever.** Every number is derived or cited. Every claim is
   reasoned or sourced. We never invent statistics, quotes, or company internals.
2. **Content outlives code.** Chapters are portable Markdown/MDX that would
   survive a framework migration. The site is a renderer; the content is the asset.
3. **Permanence.** URLs, heading anchors, and figure IDs are forever. Once
   published, a slug never changes without a permanent redirect.
4. **One visual language.** Every diagram across every chapter uses the same
   shapes, colors, and legend. A reader should recognize "a queue" instantly.
5. **Readers first.** Calm typography, fast pages, accessible to everyone,
   no popups, no trackers beyond privacy-friendly analytics.
6. **Boring technology.** Prefer the stable, well-supported choice. Every new
   dependency needs a reason; every architectural choice gets an ADR.

---

## 2. Stack

| Concern        | Choice                                                              |
| -------------- | ------------------------------------------------------------------- |
| Framework      | Next.js 16 (App Router), React 19, TypeScript `strict`              |
| Rendering      | Fully static (SSG). No runtime database. No request-time rendering. |
| Content        | MDX in `content/`, validated by Zod via Content Collections         |
| Styling        | Tailwind CSS v4 on top of design tokens in `src/styles/tokens.css`  |
| Code blocks    | Shiki (build-time highlighting, dual light/dark themes)             |
| Diagrams       | D2 source → SVG (light + dark), committed next to the source        |
| Runtime / pkg  | Node 24 LTS, pnpm                                                   |
| Hosting        | Vercel (static output; nothing that locks content to the host)      |

Decisions and their rationale: `docs/adr/`. Do not change a row in this table
without writing a new ADR that supersedes the old one.

---

## 3. Repository map

```
content/                      ← THE ASSET. Framework-agnostic.
  chapters/<slug>/
    index.mdx                 ← the chapter
    figures/                  ← <id>.d2 (source) + <id>.svg / <id>.dark.svg (generated)
  chapters/_template/         ← copy this to start a chapter (or run /new-chapter)
  chapters/_kitchen-sink/     ← dev-only fixture using every MDX component
  parts.yml                   ← book structure: parts → ordered chapter slugs
  glossary.yml                ← canonical term definitions (<Term> pulls from here)
  authors.yml
  _shared/d2/                 ← diagram classes + light/dark palettes (the visual language)
content-collections.ts        ← content pipeline config (wired to src/lib/content)
src/
  app/                        ← routes only; thin
  components/mdx/             ← the MDX component catalog (public API for writers)
  components/ui/              ← site chrome
  lib/content/                ← the ONLY code that knows how content is loaded
  styles/tokens.css           ← design tokens (color, type, space)
scripts/                      ← diagram rendering, content lint
docs/adr/                     ← architecture decision records
.claude/rules/                ← detailed, path-scoped rules
.claude/skills/               ← /new-chapter, /review-chapter, /add-diagram
```

---

## 4. Golden rules (non-negotiable)

**Content**
- Follow the chapter blueprint in `.claude/rules/chapter-blueprint.md`. Sections
  may be adapted to the topic, never silently dropped.
- Use only components from the MDX catalog (`.claude/rules/mdx-components.md`).
  No ad-hoc JSX, no inline HTML, no inline styles in content.
- Every figure has an `id`, a caption, and real alt text. Refer to figures with
  `<FigRef id="…" />`, never "the diagram above".
- Back-of-the-envelope math shows its inputs, its assumptions, and its units.
- Explain a building block (consistent hashing, idempotency keys, …) **once**,
  in the chapter that owns it; everywhere else, link to it.
- Never set `status: published`. Only a human promotes a chapter.

**Honesty**
- If you are not sure something is true, write `TODO(verify): <what to check>`
  inline rather than guessing. Unresolved TODOs block publishing.
- Citations must be real, reachable sources (papers, official docs, engineering
  blogs). Never fabricate a URL, paper title, or quote.
- Label assumptions explicitly: "Assume 10M DAU" — not "Facebook has 10M DAU".

**Code**
- Content loading goes through `src/lib/content/` only, so the content library
  can be swapped in one place.
- Server Components by default. A Client Component needs a reason (interaction).
- No new dependency without stating why in the PR; no new architectural pattern
  without an ADR.

**Permanence**
- Never rename a published slug, heading anchor, or figure `id` without adding a
  redirect / alias. See `.claude/rules/permanence-and-seo.md`.

---

## 5. How Claude works on this repo

**Writing or editing a chapter** — run `/new-chapter <topic>` or follow the same
flow manually:
1. *Research* → list sources and the 3–5 deep-dive candidates.
2. *Outline* → section headings + figure list + estimation inputs.
   **Stop and get human approval of the outline before drafting.**
3. *Draft* section by section; create diagrams with `/add-diagram` as you go.
4. *Self-review* with `/review-chapter <slug>`; fix everything it flags.
5. Run `pnpm check` (types, lint, content lint, diagram freshness).
6. Leave `status: review` and summarize open `TODO(verify)` items.

**Changing site code** — read `.claude/rules/nextjs-engineering.md` and
`.claude/rules/design-system.md` first. Run `pnpm check` and `pnpm build`
before calling work done.

---

## 6. Commands

Keep this list in sync with `package.json`.

```
pnpm dev               # local dev server (drafts and _fixtures visible)
pnpm build             # static production build (published chapters only)
pnpm check             # typecheck + eslint + content lint + diagrams:check + unit tests
pnpm typecheck         # next typegen + tsc
pnpm test              # vitest (src/**/*.test.ts)
pnpm diagrams          # render every content/**/figures/*.d2 → .svg + .dark.svg
pnpm diagrams:check    # fail if any SVG is stale vs. its .d2 source
pnpm lint:content      # frontmatter schema, alt text, FigRef targets, links, TODOs
```

D2 is a system dependency: `brew install d2`.

Design fixtures for eyeballing changes: `/chapters/_kitchen-sink` and
`/chapters/_template` (dev and preview deployments only).
