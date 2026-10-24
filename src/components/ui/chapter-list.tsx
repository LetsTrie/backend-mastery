import Link from "next/link";
import type { Chapter } from "@/lib/content";
import { getChapterNumber } from "@/lib/content";

export function StatusBadge({ status }: { status: Chapter["status"] }) {
  if (status === "published") return null;
  return <span className="badge">{status}</span>;
}

/** A list of chapters with number, title, subtitle, and reading time. */
export function ChapterList({ chapters }: { chapters: Chapter[] }) {
  if (chapters.length === 0) {
    return <p className="text-muted">The first chapters are on their way.</p>;
  }
  return (
    <ol className="divide-y divide-border border-y border-border">
      {chapters.map((chapter) => (
        <li key={chapter.slug}>
          <Link
            href={`/chapters/${chapter.slug}`}
            className="group grid grid-cols-[2.5rem_1fr] gap-x-3 py-5 sm:grid-cols-[3rem_1fr_auto]"
          >
            <span className="pt-0.5 text-sm text-muted tabular-nums">
              {String(getChapterNumber(chapter.slug) ?? "–").padStart(2, "0")}
            </span>
            <span>
              <span className="flex flex-wrap items-center gap-2 font-semibold group-hover:text-accent">
                {chapter.title} <StatusBadge status={chapter.status} />
              </span>
              <span className="mt-1 block font-body text-muted">{chapter.subtitle}</span>
            </span>
            <span className="col-start-2 mt-2 text-sm text-muted sm:col-start-3 sm:mt-0.5">
              {chapter.readingMinutes} min
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
