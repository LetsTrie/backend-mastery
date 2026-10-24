# 0001. Content as colocated MDX, outside the app

- **Status:** Accepted
- **Date:** 2026-10-24

## Context

Chapters are the long-lived asset; the website will be rebuilt or migrated
several times over the life of the publication. Chapters are long and contain
many figures, tables, and callouts that need consistent rendering.

## Decision

- Write chapters in **MDX**, stored in a top-level `content/` folder that is
  independent of `src/`.
- One folder per chapter: `content/chapters/<slug>/index.mdx` with its
  `figures/` colocated, so a chapter is self-contained and moves as a unit.
- MDX is restricted to standard Markdown plus a small, stable component catalog
  (`.claude/rules/mdx-components.md`). No imports, raw HTML, or ad-hoc JSX.

## Alternatives considered

| Option                         | Pros                                  | Cons                                                       |
| ------------------------------ | ------------------------------------- | ---------------------------------------------------------- |
| Plain Markdown (`.md`)         | Maximally portable                    | No numbered figures, callouts, estimate tables without hacks |
| Headless CMS                   | Non-developer editing UI              | Vendor lock-in; content not in git; diagrams awkward        |
| MDX inside `src/app/**/page.mdx` | Zero config with `@next/mdx`        | Couples content to routing and to Next.js                   |

## Consequences

- Content is reviewed in PRs like code, with full history.
- The component catalog becomes a public API that must stay backward compatible.
- A content linter is needed to enforce the restricted MDX subset.
