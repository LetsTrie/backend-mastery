# Architecture Decision Records

One file per significant decision: `NNNN-short-title.md`, numbered sequentially,
never renumbered. ADRs are immutable once `Accepted` — to change a decision,
write a new ADR that **supersedes** the old one and update the old one's status.

Write an ADR when you: change the stack table in `CLAUDE.md`, add a framework
or content-pipeline dependency, change the URL scheme, change the MDX component
contract, or change the diagram toolchain.

| ADR  | Title                                             | Status   |
| ---- | ------------------------------------------------- | -------- |
| 0001 | [Content as colocated MDX, outside the app](0001-content-as-colocated-mdx.md) | Accepted |
| 0002 | [Static-first Next.js with a content adapter](0002-static-first-nextjs-with-content-adapter.md) | Accepted |
| 0003 | [Diagrams as code with D2](0003-diagrams-as-code-with-d2.md) | Accepted |
| 0004 | [Permanent URLs and identifiers](0004-permanent-urls-and-identifiers.md) | Accepted |

Template: [`0000-template.md`](0000-template.md).
