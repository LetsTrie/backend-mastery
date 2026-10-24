import Link from "next/link";
import type { Chapter, PlannedChapter } from "@/lib/content";
import { getChapterNumber } from "@/lib/content";
import { Icon } from "./icons";

export function StatusBadge({ status }: { status: Chapter["status"] }) {
  if (status === "published") return null;
  return (
    <span className="status" data-status={status}>
      {status}
    </span>
  );
}

function ChapterRow({ chapter }: { chapter: Chapter }) {
  const number = getChapterNumber(chapter.slug);
  return (
    <li className="chapter-row">
      <span className="chapter-row-number" aria-hidden="true">
        {String(number ?? "–").padStart(2, "0")}
      </span>
      <div className="min-w-0">
        <h3 className="chapter-row-title">
          <Link href={`/chapters/${chapter.slug}`}>{chapter.title}</Link>
        </h3>
        <p className="mt-1.5 font-body text-muted text-pretty">{chapter.subtitle}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
          <span className="inline-flex items-center gap-1.5">
            <Icon name="clock" size={15} />
            {chapter.readingMinutes} min read
          </span>
          {chapter.figures.length > 0 ? (
            <span className="inline-flex items-center gap-1.5">
              <Icon name="diagram" size={15} />
              {chapter.figures.length} diagrams
            </span>
          ) : null}
          <StatusBadge status={chapter.status} />
        </div>
      </div>
      <span className="chapter-row-arrow max-sm:hidden" aria-hidden="true">
        <Icon name="arrowRight" size={20} />
      </span>
    </li>
  );
}

function PlannedRow({ planned }: { planned: PlannedChapter }) {
  return (
    <li className="chapter-row" data-planned="">
      <span className="chapter-row-number" aria-hidden="true">
        ·
      </span>
      <div className="flex min-w-0 flex-wrap items-center gap-3">
        <h3 className="chapter-row-title">{planned.title}</h3>
        <span className="status" data-status="planned">
          Planned
        </span>
      </div>
    </li>
  );
}

/** Chapters in reading order, optionally followed by the part's planned chapters. */
export function ChapterList({
  chapters,
  planned = [],
  emptyText = "The first chapters are on their way.",
}: {
  chapters: Chapter[];
  planned?: PlannedChapter[];
  emptyText?: string;
}) {
  if (chapters.length === 0 && planned.length === 0) {
    return <p className="py-6 font-body text-muted">{emptyText}</p>;
  }
  return (
    <ol className="border-t border-border">
      {chapters.map((chapter) => (
        <ChapterRow key={chapter.slug} chapter={chapter} />
      ))}
      {planned.map((p) => (
        <PlannedRow key={p.slug} planned={p} />
      ))}
    </ol>
  );
}
