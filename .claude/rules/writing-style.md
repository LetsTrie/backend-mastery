---
paths:
  - "content/**"
---

# Writing style

## Audience

Working software engineers, mid-level to staff. They know what a load balancer
and a database index are. They do **not** need "What is a server?" — they need
the reasoning a senior engineer uses to choose between two good options.

Write so that a reader can:
1. reproduce the design on a whiteboard from memory,
2. defend every major choice in a design review,
3. know what breaks first at 10× scale.

## Voice

- **"We"** for the design journey ("We shard by `user_id` because…"). **"You"**
  only for direct advice to the reader. Never "I".
- Active voice, present tense. "The dispatcher reads from the queue", not
  "The queue will be read from by the dispatcher".
- Confident but honest. State trade-offs plainly; don't hedge every sentence.
  When something genuinely depends, say what it depends on.
- No hype, no filler: never "blazingly fast", "seamless", "robust", "simply",
  "just", "obviously", "it's worth noting that", "in today's world".
- No vendor marketing. Name a product only when it's the clearest example, and
  prefer the generic term first: "a log-based message broker (e.g. Kafka)".
- American English. Oxford comma.

## Structure at the sentence and paragraph level

- One idea per paragraph. Paragraphs of 2–5 sentences.
- Lead with the conclusion, then the reasoning ("Use a queue here. Without
  one, a burst of 50k sends would…").
- Prefer a list or table when comparing 3+ things. Prefer prose for reasoning.
- Every section ends knowing why it existed: if a section has no decision,
  insight, or number, cut it.

## Headings

- Sentence case: "High-level design", not "High-Level Design".
- H1 is the chapter title (rendered from frontmatter — never write `#` in MDX).
- Use `##` for blueprint sections, `###` for subsections, `####` sparingly.
  Never go deeper than `####`.
- Headings are anchors that live forever (see `permanence-and-seo.md`). Keep them
  short, specific, and stable. No punctuation except hyphens.

## Terms, numbers, and units

- Define an acronym on first use per chapter: "time-to-live (TTL)". Skip the
  expansion for acronyms every reader knows (SMS, API, HTTP, URL). If the term
  exists in `content/glossary.yml`, wrap first use in `<Term id="ttl">TTL</Term>`.
- Code identifiers, field names, endpoints, and config keys in backticks.
- Units: `ms`, `s`, `KB`, `MB`, `GB`, `TB` (decimal, powers of 1000 for
  estimates), `QPS` for queries, `RPS` for HTTP requests, `msg/s` for messages.
  Spell out **bytes** ("100 bytes", "≈ 2 KB per user"): a bare `B` reads as
  billion next to `1B notifications`.
  Always a space between number and unit: `200 ms`, not `200ms`.
- Large numbers: `10M`, `1.2B` in prose and tables; `10,000` when exactness matters.
- Percentiles as `p50`, `p99`, `p99.9`. Availability as `99.9%` with the
  equivalent downtime the first time it appears ("≈ 8.8 h/year").
- Round aggressively in estimates and say so: "≈ 1,160 QPS → call it 1.2k".

## Honesty rules

- Assumptions are labeled: "**Assumption:** 10M DAU, 5 notifications/user/day."
- Real-world claims about named companies need a citation via `<Cite>`. If you
  can't find one, rephrase as a hypothetical or remove it.
- Unsure? Write `TODO(verify): …` inline. Don't paper over gaps.
- Never present an interview-style answer as "the" answer. Real designs have
  alternatives; show the one we chose and why.
- No interview-coaching asides ("Scope it in the first five minutes…") and no
  "Questions an interviewer will ask" sections. The chapter teaches the design;
  readers preparing for interviews get that for free.

## Code in chapters

- Only include code that teaches something a diagram can't (an API contract, a
  schema, a tricky algorithm, an idempotency check).
- Always set the language and a title: ```` ```ts title="dispatcher.ts" ````.
- Keep snippets ≤ 30 lines. Elide with `// …` rather than show boilerplate.
- Pseudocode is fine and often better; label it ```` ```text title="pseudocode" ````.
- SQL, HTTP, and JSON examples must be valid as written.

## Length

- **No word limits.** Chapters are as long as the topic needs to be complete
  and comprehensive. Never trim a useful explanation, example, figure, or deep
  dive to hit a number.
- Depth, not padding: every section must still earn its place with a decision,
  an insight, a number, or a figure. Cut repetition and filler, never substance.
- Long chapters stay navigable through the fixed blueprint headings, the table
  of contents, and the Summary.
