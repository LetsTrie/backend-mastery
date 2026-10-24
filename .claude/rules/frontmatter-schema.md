---
paths:
  - "content/**"
  - "src/lib/content/**"
---

# Frontmatter schema

The schema is enforced by Zod in `src/lib/content/schema.ts`. This document and
that file must agree; when you change one, change the other in the same commit.

```yaml
---
# Identity — PERMANENT once status is published
slug: design-a-notification-system      # must equal the folder name; kebab-case (leading _ = fixture)
kind: case-study                        # case-study | building-block | essay

# Display
title: Design a notification system     # sentence case, ≤ 60 chars
subtitle: Fan-out, retries, and user preferences at 1B messages a day   # ≤ 110 chars
description: >-                         # 120–160 chars; used for SEO + social cards
  How to design a multi-channel notification system that delivers push, email,
  and SMS reliably at scale — with estimates, diagrams, and trade-offs.

# Placement
part: case-studies                      # key from content/parts.yml
tags: [messaging, queues, fan-out]      # lowercase kebab; reuse existing tags first
prerequisites: [message-queues, idempotency]  # slugs of building-block chapters

# Lifecycle
status: draft                           # draft | review | published | archived
authors: [author-key]                   # keys from content/authors.yml
reviewers: []                           # keys from content/authors.yml
published: 2026-11-01                   # ISO date; set by a human at publish time
updated: 2026-11-01                     # bump on any substantive change

# Optional
cover: figures/cover.svg                # social/OG image override
aliases: []                             # old slugs → permanent redirects to this chapter
references:                             # extra sources not cited inline
  - title: "Designing Data-Intensive Applications"
    authors: "Martin Kleppmann"
    year: 2017
    url: https://dataintensive.net/
revisions:                              # human-facing changelog, newest first
  - date: 2026-11-01
    note: First published.
---
```

## Rules

- `slug` is immutable after first publish. Renames go through `aliases`.
- `status` lifecycle: `draft → review → published → (archived)`. Claude may move
  `draft → review`; only a human sets `published` or `archived`.
- `published` is never edited after it's set. Use `updated` + a `revisions`
  entry for meaningful changes (new section, corrected fact, new figure).
  Typo fixes don't need a revision entry.
- `tags`: check existing tags across `content/chapters/*/index.mdx` before
  inventing one. 6–10 tags: the domain (`system-design`), the core techniques
  (`fan-out`, `idempotency`), and the reader's intent (`interview-prep`). Max 10.
- `prerequisites` must reference existing chapter slugs (content lint checks).
- Reading time and word count are **computed**, never stored.
- Drafts (`status: draft | review`) render in dev and preview deployments only,
  never in production builds, sitemaps, or feeds.
