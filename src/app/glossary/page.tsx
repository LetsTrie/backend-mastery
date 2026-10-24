import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/ui/icons";
import { getChapter, getGlossary, type GlossaryEntry } from "@/lib/content";

export const metadata: Metadata = {
  title: "Glossary",
  description:
    "Definitions of the terms used throughout the book, with links to where each is explained in depth.",
  alternates: { canonical: "/glossary" },
};

function groupByLetter(entries: GlossaryEntry[]) {
  const groups = new Map<string, GlossaryEntry[]>();
  for (const entry of entries) {
    const letter = entry.term.charAt(0).toUpperCase();
    groups.set(letter, [...(groups.get(letter) ?? []), entry]);
  }
  return groups;
}

export default function GlossaryPage() {
  const groups = groupByLetter(getGlossary());

  return (
    <div className="container-page max-w-5xl">
      <header className="max-w-3xl pt-12 pb-4 sm:pt-16">
        <p className="eyebrow">Reference</p>
        <h1 className="display mt-4 text-4xl">Glossary</h1>
        <p className="lede mt-5">
          Every term the book relies on, defined once. Each links to the chapter that explains it in
          depth.
        </p>
      </header>

      <nav
        aria-label="Letters"
        className="sticky top-[var(--header-height)] z-10 -mx-2 mt-8 flex flex-wrap gap-1 border-y border-border bg-bg/90 px-2 py-3 backdrop-blur"
      >
        {[...groups.keys()].map((letter) => (
          <a
            key={letter}
            href={`#letter-${letter}`}
            className="grid h-8 w-8 place-items-center rounded-full font-display font-semibold text-muted transition-colors hover:bg-surface hover:text-text"
          >
            {letter}
          </a>
        ))}
      </nav>

      <div className="mt-10 space-y-14">
        {[...groups].map(([letter, entries]) => (
          <section key={letter} id={`letter-${letter}`} aria-labelledby={`h-${letter}`}>
            <h2 id={`h-${letter}`} className="display text-3xl text-subtle">
              {letter}
            </h2>
            <dl className="mt-5 grid gap-4 md:grid-cols-2">
              {entries.map((entry) => {
                const owner = entry.owner ? getChapter(entry.owner) : undefined;
                return (
                  <div key={entry.id} id={entry.id} className="card p-6 target:border-accent">
                    <dt className="font-display text-lg font-semibold">
                      <a href={`#${entry.id}`} className="transition-colors hover:text-accent">
                        {entry.term}
                      </a>
                    </dt>
                    <dd className="mt-2 font-body leading-relaxed text-muted">{entry.definition}</dd>
                    {owner ? (
                      <dd className="mt-4">
                        <Link
                          href={`/chapters/${owner.slug}`}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent"
                        >
                          {owner.title}
                          <Icon name="arrowRight" size={14} />
                        </Link>
                      </dd>
                    ) : null}
                  </div>
                );
              })}
            </dl>
          </section>
        ))}
      </div>
    </div>
  );
}
