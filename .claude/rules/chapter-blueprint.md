---
paths:
  - "content/chapters/**"
---

# Chapter blueprint

Every chapter follows one of two blueprints. Consistency lets readers skim any
chapter the same way and lets us compare designs across chapters.

The canonical starting file is `content/chapters/_template/index.mdx`.

---

## A. Case-study chapter ("Design a …")

Sections in this order. `##` headings are fixed text so anchors are identical
across chapters (`#requirements`, `#high-level-design`, …). Adapt `###`
subsections freely.

| #  | `##` heading                    | Must contain                                                                                   |
| -- | ------------------------------- | ---------------------------------------------------------------------------------------------- |
| 0  | *(no heading — intro)*          | 1–3 paragraphs: what we're building and why it's hard. No summary box; the subtitle sets up the read. |
| 1  | Problem and scope               | What the system does, who uses it, what is explicitly **out of scope**.                        |
| 2  | Requirements                    | `### Functional`, `### Non-functional` (each with a number: latency, availability, durability). |
| 3  | Back-of-the-envelope estimation | `###` subsections (traffic, storage, …). Each calculation sits right beside its assumption (see below); optional "At a glance" summary table at the end. |
| 4  | API design                      | Endpoints / events / contracts. Request + response shapes. Idempotency and pagination stated.   |
| 5  | Data model                      | Entities, keys, access patterns → storage choice. Partition / shard key justified.              |
| 6  | High-level design               | One overview figure + a walkthrough of the main request path(s), numbered to match the figure.  |
| 7  | Deep dives                      | 2–4 `###` deep dives on the genuinely hard parts. Each: problem → options → choice → figure.    |
| 8  | Scaling and bottlenecks         | What breaks first as load grows ×10, ×100, and what we do about each.                           |
| 9  | Reliability and failure modes   | Failure table: component, failure, detection, mitigation. Retries, timeouts, backpressure.      |
| 10 | Observability                   | Key SLIs/SLOs, metrics, alerts, traces that matter for *this* system.                           |
| 11 | Security and privacy            | AuthN/Z, abuse, PII, data retention — only what's specific to this system.                      |
| 12 | Trade-offs and alternatives     | `<Tradeoffs>` table of decisions we made vs. alternatives we rejected.                          |
| 13 | Evolution                       | How v1 (small team, MVP) differs from v3 (global scale). What we'd build first.                 |
| 14 | Summary                         | 1 recap figure or table + 5–8 bullet recap. No new information.                                 |
| 15 | References                      | Rendered automatically from `<Cite>` usage + `references` frontmatter. Do not hand-write.       |

Rules:
- If a section genuinely doesn't apply, keep the heading and write one sentence
  explaining why (e.g. "No user-facing API; this is an internal pipeline.").
- Deep dives are the heart of the chapter. Spend ~40% of the words there.
- The high-level figure's numbered steps (①②③) must match the walkthrough's
  numbered list exactly.
- Estimation numbers flow downstream: if section 3 says 12k QPS peak, section 8
  must scale *from 12k*, not a new made-up number.
- Estimates read top to bottom without jumping back: state an assumption, then
  the calculation that uses it with its result, then the next assumption.
  Results are plain text, not bold.
  Never collect every assumption in one list and every formula in a distant table.
  Explain any number a reader can't derive at a glance (what a "status event"
  is, why rows are kept two days).

```mdx
**Assume 10M DAU, 5 notifications per user per day.**

- 10M × 5 = 50M notifications/day
- 50M ÷ 86,400 s ≈ 580 per second on average
```

## B. Building-block chapter ("Consistent hashing", "Idempotency", …)

| `##` heading         | Must contain                                                       |
| -------------------- | ------------------------------------------------------------------ |
| *(intro)*            | The problem this concept solves, in one breath.                    |
| The problem          | A concrete failing example without the concept.                    |
| How it works         | Mechanism, step by step, with figures.                             |
| Variants             | Common variations and when each fits.                              |
| In practice          | Where it shows up in real systems; pitfalls; operational concerns. |
| Trade-offs           | `<Tradeoffs>` or comparison table.                                 |
| Used in              | Links to case-study chapters that rely on this block.              |
| References           | Auto-rendered.                                                     |

Case studies **link** to building blocks instead of re-explaining them:
"We place nodes on a hash ring (see [Consistent hashing](/chapters/consistent-hashing))."

---

## Narrative arc

A chapter reads like a design review, not an encyclopedia:
1. Start naive. Show the simplest design that could work.
2. Break it with a realistic requirement or number.
3. Fix it, name the trade-off, repeat.

Readers should feel *why* each component exists. Never introduce a component
(cache, queue, CDN) without stating the problem it solves *in this system*.

## Figures per section (guideline)

| Section                    | Typical figures                                     |
| -------------------------- | --------------------------------------------------- |
| High-level design          | 1 architecture overview (required)                  |
| Deep dives                 | 1–2 each: sequence diagrams, data-flow, state machines |
| Data model                 | ER / table layout figure for non-trivial schemas    |
| Scaling and bottlenecks    | Before/after architecture or a capacity chart       |
| Reliability                | Failure-path sequence diagram for the worst case    |
| Summary                    | Final architecture (may reuse overview `id` variant) |
