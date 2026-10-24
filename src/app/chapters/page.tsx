import type { Metadata } from "next";
import Link from "next/link";
import { ChapterList } from "@/components/ui/chapter-list";
import { Icon } from "@/components/ui/icons";
import { getParts, getPlanned, partNumeral } from "@/lib/content";

export const metadata: Metadata = {
  title: "Chapters",
  description: "Every chapter, in reading order: foundations, building blocks, and case studies.",
  alternates: { canonical: "/chapters" },
};

export default function ChaptersPage() {
  const parts = getParts();

  return (
    <div className="container-page">
      <header className="max-w-3xl pt-12 pb-4 sm:pt-16">
        <p className="eyebrow">Table of contents</p>
        <h1 className="display mt-4 text-4xl">Chapters</h1>
        <p className="lede mt-5">
          Read in order to build the vocabulary first, or jump straight to the system you are
          designing. Foundations explain the arithmetic, building blocks the reusable parts, and case
          studies put them together.
        </p>
      </header>

      <div className="mt-10 grid gap-x-16 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <nav aria-label="Parts" className="max-lg:hidden">
          <ol className="sticky top-[calc(var(--header-height)+2rem)] space-y-1">
            {parts.map((part) => (
              <li key={part.key}>
                <a
                  href={`#part-${part.key}`}
                  className="flex items-baseline gap-3 rounded-[var(--radius-md)] px-3 py-2 text-md text-muted transition-colors hover:bg-surface hover:text-text"
                >
                  <span className="w-6 font-display font-semibold text-subtle">
                    {partNumeral(part.key)}
                  </span>
                  {part.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="space-y-20">
          {parts.map((part) => (
            <section key={part.key} id={`part-${part.key}`} aria-labelledby={`part-title-${part.key}`}>
              <div className="flex items-end justify-between gap-6">
                <div>
                  <p className="font-display text-4xl font-semibold text-subtle">
                    {partNumeral(part.key)}
                  </p>
                  <h2 id={`part-title-${part.key}`} className="display mt-2 text-2xl">
                    {part.title}
                  </h2>
                  <p className="mt-2 max-w-2xl text-muted">{part.description}</p>
                </div>
                <Link
                  href={`/parts/${part.key}`}
                  className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-muted transition-colors hover:text-text max-sm:hidden"
                >
                  Part overview
                  <Icon name="arrowRight" size={15} />
                </Link>
              </div>
              <div className="mt-6">
                <ChapterList chapters={part.items} planned={getPlanned(part)} />
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
