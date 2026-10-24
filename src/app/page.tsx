import Link from "next/link";
import { StatusBadge } from "@/components/ui/chapter-list";
import { Icon, type IconName } from "@/components/ui/icons";
import {
  getBookStats,
  getChapterNumber,
  getChapters,
  getPart,
  getParts,
  getPlanned,
  partNumeral,
  type Chapter,
} from "@/lib/content";
import { site } from "@/lib/site";

const features: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "target",
    title: "Scope and requirements",
    text: "What we build, what we leave out, and the numbers every later decision must meet.",
  },
  {
    icon: "estimate",
    title: "Estimates you can check",
    text: "Back-of-the-envelope math with inputs, formulas, and units, carried through the design.",
  },
  {
    icon: "diagram",
    title: "One visual language",
    text: "Every diagram uses the same shapes and colors, so a queue always looks like a queue.",
  },
  {
    icon: "layers",
    title: "Deep dives",
    text: "The two to four genuinely hard parts, each worked from problem to options to choice.",
  },
  {
    icon: "shield",
    title: "Failure modes",
    text: "What breaks, how you notice, and what contains it, down to the region.",
  },
  {
    icon: "tradeoffs",
    title: "Trade-offs, defended",
    text: "Every major decision next to the alternative we rejected, and the reason why.",
  },
];

function featuredFigure(chapter: Chapter) {
  return (
    chapter.figures.find((f) => f.id === "high-level-design" && f.exists) ??
    chapter.figures.find((f) => f.width === "wide" && f.exists) ??
    chapter.figures.find((f) => f.exists)
  );
}

function FeaturedChapter({ chapter }: { chapter: Chapter }) {
  const part = getPart(chapter.part);
  const number = getChapterNumber(chapter.slug);
  const figure = featuredFigure(chapter);

  return (
    <article className="card card-link grid overflow-hidden md:grid-cols-[1.05fr_1fr]">
      <div className="flex flex-col p-7 sm:p-10">
        <p className="eyebrow">
          {part ? part.title : "Chapter"}
          {number ? <span className="text-subtle">· Chapter {number}</span> : null}
        </p>
        <h3 className="display mt-4 text-2xl">
          <Link href={`/chapters/${chapter.slug}`} className="card-cover">
            {chapter.title}
          </Link>
        </h3>
        <p className="lede mt-4">{chapter.subtitle}</p>
        <p className="mt-5 font-body text-muted">{chapter.description}</p>
        <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-8 text-sm text-muted">
          <span className="inline-flex items-center gap-1.5">
            <Icon name="clock" size={15} />
            {chapter.readingMinutes} min read
          </span>
          <StatusBadge status={chapter.status} />
        </div>
      </div>
      {figure ? (
        <div className="border-border bg-surface p-5 max-md:border-t sm:p-8 md:border-l">
          <div className="preview-frame max-h-80 md:h-full md:max-h-[34rem]">
            {/* eslint-disable-next-line @next/next/no-img-element -- static SVG diagram */}
            <img
              className="theme-img--light object-cover object-top"
              src={figure.url}
              alt=""
              width={figure.size?.width}
              height={figure.size?.height}
              loading="lazy"
            />
            {figure.darkUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className="theme-img--dark object-cover object-top"
                src={figure.darkUrl}
                alt=""
                width={figure.size?.width}
                height={figure.size?.height}
                loading="lazy"
              />
            ) : null}
          </div>
        </div>
      ) : null}
    </article>
  );
}

export default function HomePage() {
  const chapters = getChapters();
  const first = chapters[0];
  const featured = [...chapters].sort((a, b) =>
    (b.published ?? b.updated).localeCompare(a.published ?? a.updated),
  )[0];
  const stats = getBookStats();
  const parts = getParts();

  return (
    <>
      <section className="relative isolate">
        <div className="hero-backdrop" aria-hidden="true" />
        <div className="hero-glow" aria-hidden="true" />
        <div className="container-page flex flex-col items-center pt-16 pb-12 text-center sm:pt-20 sm:pb-16">
          <p className="chip">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
            A free, long-form book on system design
          </p>
          <h1 className="display mt-7 max-w-4xl text-4xl">{site.tagline}</h1>
          <p className="lede mt-6 max-w-2xl">{site.description}</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {first ? (
              <Link href={`/chapters/${first.slug}`} className="btn btn-primary">
                Start reading
                <Icon name="arrowRight" size={17} />
              </Link>
            ) : null}
            <Link href="/chapters" className="btn btn-secondary">
              Browse chapters
            </Link>
          </div>

          <dl className="mt-12 grid w-full max-w-3xl grid-cols-2 gap-y-6 border-y border-border py-6 sm:grid-cols-4 sm:divide-x sm:divide-border">
            {[
              { label: "Chapters", value: stats.chapters },
              { label: "Diagrams", value: stats.figures },
              { label: "Cited sources", value: stats.sources },
              { label: "Planned", value: stats.planned },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-1">
                <dt className="order-2 text-xs font-semibold tracking-[0.09em] text-muted uppercase">
                  {stat.label}
                </dt>
                <dd className="order-1 font-display text-3xl font-semibold tabular-nums">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {featured ? (
        <section className="container-page mt-8" aria-labelledby="featured">
          <h2 id="featured" className="section-label mb-6">
            Latest chapter
          </h2>
          <FeaturedChapter chapter={featured} />
        </section>
      ) : null}

      <section className="container-page mt-20" aria-labelledby="inside">
        <div className="max-w-2xl">
          <p className="eyebrow">How each chapter works</p>
          <h2 id="inside" className="display mt-3 text-3xl">
            Read it like a design review, not an encyclopedia.
          </h2>
          <p className="lede mt-5">
            Every case study starts naive, breaks under real numbers, and is rebuilt one defended
            decision at a time.
          </p>
        </div>
        <ul className="mt-12 grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <li key={feature.title} className="bg-bg p-7">
              <span className="inline-grid h-10 w-10 place-items-center rounded-[var(--radius-md)] bg-accent-soft text-accent">
                <Icon name={feature.icon} size={20} />
              </span>
              <h3 className="mt-5 font-display text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-md leading-relaxed text-muted">{feature.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="container-page mt-20" aria-labelledby="the-book">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="eyebrow">The book</p>
            <h2 id="the-book" className="display mt-3 text-3xl">
              Three parts, one reading order.
            </h2>
          </div>
          <Link href="/chapters" className="btn btn-secondary">
            Full table of contents
            <Icon name="arrowRight" size={17} />
          </Link>
        </div>

        <ol className="mt-12 grid gap-5 lg:grid-cols-3">
          {parts.map((part) => {
            const planned = getPlanned(part);
            const shownPlanned = planned.slice(0, Math.max(0, 5 - part.items.length));
            const more = planned.length - shownPlanned.length;
            return (
              <li key={part.key} className="card card-link flex flex-col p-7">
                <p className="font-display text-4xl font-semibold text-subtle">
                  {partNumeral(part.key)}
                </p>
                <h3 className="display mt-4 text-xl">
                  <Link href={`/parts/${part.key}`} className="card-cover">
                    {part.title}
                  </Link>
                </h3>
                <p className="mt-2 text-md leading-relaxed text-muted">{part.description}</p>
                <ul className="mt-6 space-y-2.5 border-t border-border pt-5 text-md">
                  {part.items.map((chapter) => (
                    <li key={chapter.slug} className="flex items-start gap-2.5 font-medium">
                      <Icon name="book" size={16} className="mt-0.5 shrink-0 text-accent" />
                      {chapter.title}
                    </li>
                  ))}
                  {shownPlanned.map((p) => (
                    <li key={p.slug} className="flex items-start gap-2.5 text-muted">
                      <span className="mt-2 ml-1.5 h-1 w-1 shrink-0 rounded-full bg-subtle" />
                      <span className="ml-1">{p.title}</span>
                    </li>
                  ))}
                  {more > 0 ? <li className="pl-6 text-sm text-muted">+{more} more planned</li> : null}
                </ul>
                <p className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold">
                  {part.items.length} written · {planned.length} planned
                </p>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="container-page mt-20">
        <div className="card flex flex-col items-start gap-6 bg-surface p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div className="max-w-xl">
            <h2 className="display text-2xl">New chapters, straight to your reader.</h2>
            <p className="mt-2 text-muted">
              No newsletter, no tracking. Subscribe with any feed reader.
            </p>
          </div>
          <div className="flex gap-3">
            <a href="/feed.xml" className="btn btn-primary">
              <Icon name="rss" size={17} />
              RSS feed
            </a>
            <a href="/atom.xml" className="btn btn-secondary">
              Atom
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
