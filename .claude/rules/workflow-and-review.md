# Workflow, git, and editorial review

## Git

- Branch from `main`: `chapter/<slug>`, `fix/<short-desc>`, `feat/<short-desc>`,
  `chore/<short-desc>`, `adr/<nnnn>-<short-desc>`.
- Conventional Commits with a scope:
  - `content(notification-system): add retry deep dive`
  - `content(notification-system): fix peak QPS estimate`
  - `fig(notification-system): add fan-out sequence diagram`
  - `feat(mdx): add <Aside> component`
  - `fix(toc): scroll-spy off by one heading`
  - `docs(adr): 0005 adopt pagefind for search`
- One chapter per PR. Code changes and content changes in separate PRs unless
  the content depends on the new component.
- Never commit secrets, real customer data, or unredacted screenshots.

## Chapter lifecycle

```
draft ──► review ──► published ──► (archived)
  ▲          │
  └──────────┘  changes requested
```

| Stage       | Who                 | Gate                                                                 |
| ----------- | ------------------- | -------------------------------------------------------------------- |
| Outline     | Author (+ Claude)   | Human approves outline: sections, deep dives, figure list.           |
| Draft       | Author (+ Claude)   | All blueprint sections present; figures rendered; `pnpm check` passes. |
| Review      | ≥ 1 technical reviewer | Editorial checklist below; all `TODO(verify)` resolved.           |
| Published   | Human maintainer    | Sets `status: published` and `published` date. Merges.               |
| Updated     | Anyone via PR       | Bump `updated`; add `revisions` entry if substantive.                |

## Editorial review checklist

Used by `/review-chapter` and by human reviewers. A chapter cannot be published
with any ❌.

**Technical correctness**
- [ ] Every estimate shows inputs, formula, units; numbers are arithmetically correct.
- [ ] Downstream sections use the estimate's numbers consistently.
- [ ] Every component in the design solves a stated problem.
- [ ] Failure modes cover: dependency down, slow dependency, duplicate delivery,
      poison message, hot partition, region loss (where relevant).
- [ ] Consistency, durability, and delivery semantics are stated explicitly.
- [ ] Claims about real companies/products are cited; citations are real.
- [ ] No `TODO(verify)` left.

**Structure**
- [ ] All blueprint sections present, in order, with fixed `##` headings.
- [ ] Estimates are inline: each calculation sits beside its assumption; units spelled out ("bytes").
- [ ] 2–4 deep dives; each has problem → options → choice → figure.
- [ ] `<Tradeoffs>` table covers every major decision.
- [ ] Building blocks are linked, not re-explained.

**Figures**
- [ ] Every figure: source committed, id, caption, real alt text, referenced via `<FigRef>`.
- [ ] Uses shared D2 classes only; one focus area max; names match prose.
- [ ] Numbered steps in figures match `<Steps>`.
- [ ] Legible in both light and dark themes.

**Writing**
- [ ] Voice and banned words per `writing-style.md`.
- [ ] Acronyms defined on first use; `<Term>` on first glossary occurrence.
- [ ] Code blocks have language + title, ≤ 30 lines, valid syntax.
- [ ] Description 120–160 chars; title ≤ 60 chars.

**Permanence**
- [ ] For edits to published chapters: no anchor, figure id, or slug changed
      without an alias / explicit id.

## Errata

Readers report errors via the "Report an error" link (GitHub issue template
`errata`). Fix in a PR titled `content(<slug>): errata — <summary>`, add a
`revisions` entry, and credit the reporter if they agree.
