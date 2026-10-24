---
name: review-chapter
description: Editorial and technical review of a chapter against the house checklist — recomputes estimates, checks figures, citations, structure, style, and permanence. Use before moving a chapter to review/published or when asked to review, audit, or proofread a chapter.
argument-hint: <slug>
---

# Review chapter: $ARGUMENTS

Review `content/chapters/$ARGUMENTS/index.mdx` and its `figures/` folder against
`.claude/rules/workflow-and-review.md` (the checklist), plus
`chapter-blueprint.md`, `writing-style.md`, `mdx-components.md`,
`diagrams-and-figures.md`, and `frontmatter-schema.md`.

Be a demanding senior reviewer. The goal is a chapter readers trust for years.

## Procedure

1. **Frontmatter** — validate every field against `frontmatter-schema.md`.
   Slug equals folder name; part exists in `parts.yml`; prerequisites exist.
2. **Structure** — list the `##` headings and diff them against the blueprint.
3. **Math** — recompute every inline calculation and `<Estimate>` row yourself,
   and check each one sits beside the assumption it uses. Then trace each
   derived number (peak QPS, storage/year, bandwidth) through later sections
   and flag any inconsistency.
4. **Design soundness** — for each component, can you name the problem it
   solves in this chapter? Check failure modes: dependency down, slow
   dependency, duplicates, poison messages, hot partitions, region loss.
   Are delivery/consistency/durability semantics stated?
5. **Figures** — for each `<Figure>`: source file exists, `.svg` and `.dark.svg`
   exist and are fresh, alt text describes the flow, caption present,
   referenced by a `<FigRef>`, uses only shared D2 classes, names match prose,
   numbered steps match `<Steps>`.
6. **Citations** — every claim about a named company/product has a `<Cite>`.
   Spot-check that URLs are reachable and say what the chapter claims
   (use WebFetch). Flag anything that looks fabricated.
7. **Style** — banned words, voice, acronym definitions, `<Term>` first use per `##` section,
   heading case, code block language + title, unit formatting.
8. **Permanence** — if `status` is `published`, diff against `main`
   (`git diff main -- content/chapters/$ARGUMENTS`) and flag any changed slug,
   heading anchor without `[#explicit-id]`, or figure `id`.
9. **TODOs** — list every `TODO(verify)`.

## Output

Return a report, most severe first:

```
## Review: <title> (<status>)

Verdict: ❌ Not ready | ⚠️ Ready with fixes | ✅ Ready for human sign-off

### ❌ Blocking
- [math] index.mdx:142 — Peak QPS 2.9k but §8 scales from 5k. …

### ⚠️ Should fix
- …

### 💡 Suggestions
- …

### Stats
Words: … · Read time: … · Figures: … · Citations: … · Open TODOs: …
```

Each item: category, `file:line`, what's wrong, and the concrete fix.

Do not edit the chapter unless the user asks you to apply fixes. When asked,
fix ❌ items first, then re-run this review.
