---
name: new-chapter
description: Start a new blog chapter (system design case study or building block) — research, outline for approval, then scaffold and draft from the template. Use when the user asks to write, start, or plan a chapter such as "Design a notification system".
argument-hint: <topic, e.g. "Design a notification system">
---

# New chapter: $ARGUMENTS

Follow these phases in order. Do not skip the approval gate.

## Phase 1 — Orient (no writing yet)

1. Derive the slug: kebab-case of the title, e.g. `design-a-notification-system`.
   Confirm `content/chapters/<slug>/` does not already exist.
2. Decide `kind`: `case-study` ("Design a …") or `building-block` (a concept).
3. Read `content/parts.yml` and list existing chapters. Identify:
   - which **part** this belongs to,
   - which existing building-block chapters are **prerequisites** (link, don't re-explain),
   - which planned-but-unwritten building blocks this chapter would need
     (flag them; don't silently explain them inline at length).
4. Re-read `.claude/rules/chapter-blueprint.md` and `.claude/rules/writing-style.md`.

## Phase 2 — Research

Gather 5–15 real, reachable sources: official docs (e.g. APNs/FCM docs for
notifications), engineering blog posts from companies that built this system,
papers, and well-known books. Record title, author/org, year, URL.

Never invent a source. If a fact can't be sourced, mark it `TODO(verify)`.

## Phase 3 — Outline → STOP for approval

Write `content/chapters/<slug>/outline.md` (not rendered by the site) containing:

- Working title, subtitle, description (120–160 chars), part, tags, prerequisites.
- Scope: in / out.
- Functional + non-functional requirements with target numbers.
- Estimation assumptions (DAU, ratios, payload sizes, peak factor) and the
  derived QPS / storage / bandwidth — with the arithmetic.
- `##` sections per the blueprint, each with 1–3 bullets of what it will say.
- **Deep dives** (2–4): for each, the problem, the options considered, and the
  likely choice.
- **Figure list**: `id`, type (architecture / sequence / ER / state / chart),
  one-line purpose, which section it lives in.
- Sources list.
- Open questions for the author.

Then present a concise summary of the outline to the user and **stop**.
Ask them to approve or adjust deep dives, scope, and numbers.

## Phase 4 — Scaffold (after approval)

1. Copy `content/chapters/_template/` to `content/chapters/<slug>/`.
2. Fill frontmatter (`status: draft`, today's date for `updated`, leave
   `published` unset or as the template placeholder for the human to set).
3. Add the slug to the right part in `content/parts.yml` (move it out of
   `planned` if it was listed there).

## Phase 5 — Draft

- Write section by section in blueprint order. Keep estimation numbers
  consistent everywhere they appear.
- Create each figure with the `/add-diagram` workflow as its section is written.
- Add new glossary terms to `content/glossary.yml` (only for reusable terms).
- Use `<Cite>` for every external factual claim.

## Phase 6 — Self-review and hand-off

1. Run the `/review-chapter <slug>` checklist and fix every ❌.
2. Run `pnpm check` if the app exists; otherwise run `scripts/render-diagrams.sh --check`.
3. Set `status: review`. Never set `published`.
4. Report to the user: word count, figure count, open `TODO(verify)` items,
   building blocks that still need their own chapter, and anything you were
   unsure about.
