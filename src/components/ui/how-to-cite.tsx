import { CopyButton } from "@/components/mdx/copy-button";
import { chapterCitation } from "@/lib/cite";
import type { Chapter } from "@/lib/content";
import { site } from "@/lib/site";

/** Suggested citation, BibTeX, and pointers to the machine-readable versions. */
export function HowToCite({ chapter, markdownHref }: { chapter: Chapter; markdownHref: string }) {
  const cite = chapterCitation(chapter);

  return (
    <section aria-labelledby="how-to-cite" className="how-to-cite">
      <h2 id="how-to-cite">How to cite</h2>
      <p>{cite.text}</p>
      <div className="code-block">
        <pre tabIndex={0} aria-label="BibTeX citation">
          <code>{cite.bibtex}</code>
        </pre>
        <CopyButton />
      </div>
      <p className="print-hide font-ui text-sm text-muted">
        Free to read{site.license ? ` under ${site.license.name}` : ""}, for people and machines.
        This chapter is also available as{" "}
        <a href={markdownHref} className="link">
          Markdown
        </a>
        , and the whole book is indexed in{" "}
        <a href="/llms.txt" className="link">
          llms.txt
        </a>
        . If you quote or build on it, please cite the chapter URL.
      </p>
    </section>
  );
}
