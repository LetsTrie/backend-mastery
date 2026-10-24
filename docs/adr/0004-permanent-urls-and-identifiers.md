# 0004. Permanent URLs and identifiers

- **Status:** Accepted
- **Date:** 2026-10-24

## Context

Engineering content is linked from internal wikis, design docs, interview prep
notes, and social posts for years. Broken links and moved anchors destroy that
value and SEO along with it.

## Decision

- Chapter URLs are `/chapters/<slug>`. The slug is descriptive and **never
  contains a chapter number, date, or part**, so reordering the book never
  changes a URL.
- Slugs, heading anchors, figure ids (`#fig-<id>`), glossary keys, and part keys
  are permanent once published.
- Renames are handled with `aliases` (permanent 308 redirects) and explicit
  heading ids (`## Heading [#old-anchor]`).
- Retired chapters are `archived`, not deleted.

## Alternatives considered

| Option                          | Pros                       | Cons                                     |
| ------------------------------- | -------------------------- | ---------------------------------------- |
| `/chapters/07-notification-system` | Shows order in URL      | Every reorder breaks links               |
| `/2026/11/notification-system`  | Conventional blog style    | Implies content is dated; chapters are living |
| `/parts/case-studies/<slug>`    | Shows hierarchy            | Moving a chapter between parts breaks it |

## Consequences

- Content lint must detect changed anchors/ids on published chapters.
- Chapter numbers are display-only, computed from `content/parts.yml`.
