import { CopyMarkdownButton } from "./copy-markdown-button";
import { PrintButton } from "./print-button";

/** Copy-as-Markdown and print actions under a chapter's title. Hidden when printing. */
export function ChapterActions({ markdownHref }: { markdownHref: string }) {
  return (
    <div className="chapter-actions print-hide" role="group" aria-label="Chapter actions">
      <CopyMarkdownButton href={markdownHref} />
      <PrintButton />
      <a href={markdownHref} className="chapter-action chapter-action--link">
        View Markdown
      </a>
    </div>
  );
}
