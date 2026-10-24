import Link from "next/link";
import { ChapterList } from "@/components/ui/chapter-list";
import { getChapters, getParts } from "@/lib/content";
import { site } from "@/lib/site";

export default function HomePage() {
  const latest = [...getChapters()]
    .sort((a, b) => (b.published ?? b.updated).localeCompare(a.published ?? a.updated))
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-3xl px-4 pt-16 sm:px-6 sm:pt-24">
      <h1 className="text-3xl font-semibold tracking-tight text-balance">{site.tagline}</h1>
      <p className="mt-5 font-body text-lg text-muted">{site.description}</p>

      <section className="mt-16" aria-labelledby="latest">
        <h2 id="latest" className="mb-4 text-xs font-semibold tracking-widest text-muted uppercase">
          Latest chapters
        </h2>
        <ChapterList chapters={latest} />
      </section>

      <section className="mt-16" aria-labelledby="parts">
        <h2 id="parts" className="mb-4 text-xs font-semibold tracking-widest text-muted uppercase">
          The book
        </h2>
        <ul className="grid gap-4 sm:grid-cols-3">
          {getParts().map((part) => (
            <li key={part.key}>
              <Link
                href={`/parts/${part.key}`}
                className="block h-full rounded-md border border-border p-4 hover:border-accent"
              >
                <span className="font-semibold">{part.title}</span>
                <span className="mt-1 block text-sm text-muted">{part.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
