import { MDXContent } from "@content-collections/mdx/react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMdxComponents } from "@/components/mdx";
import { StatusBadge } from "@/components/ui/chapter-list";
import { HowToCite } from "@/components/ui/how-to-cite";
import { PrintPrep } from "@/components/ui/print-prep";
import { TocInline, TocRail } from "@/components/ui/toc";
import { chapterCitation } from "@/lib/cite";
import {
  getAuthors,
  getChapter,
  getChapterNumber,
  getNeighbors,
  getPart,
  getRoutableChapters,
  getUsedIn,
  type Chapter,
} from "@/lib/content";
import { markdownPath } from "@/lib/llm";
import { absoluteUrl, formatDate, site } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return getRoutableChapters().map((chapter) => ({ slug: chapter.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/chapters/[slug]">): Promise<Metadata> {
  const chapter = getChapter((await params).slug);
  if (!chapter) return {};
  const url = `/chapters/${chapter.slug}`;
  const cite = chapterCitation(chapter);
  return {
    title: chapter.title,
    description: chapter.description,
    alternates: {
      canonical: url,
      types: { "text/markdown": markdownPath(chapter.slug) },
    },
    // Highwire Press tags: read by Google Scholar, Zotero, and other citation tools.
    other: {
      citation_title: chapter.title,
      citation_author: cite.authors.split(", "),
      citation_publication_date: (chapter.published ?? chapter.updated).replaceAll("-", "/"),
      citation_journal_title: site.name,
      citation_public_url: cite.url,
      citation_language: "en",
    },
    robots: chapter.status === "published" ? undefined : { index: false },
    openGraph: {
      type: "article",
      url,
      title: chapter.title,
      description: chapter.description,
      publishedTime: chapter.published,
      modifiedTime: chapter.updated,
      tags: chapter.tags,
    },
    twitter: { card: "summary_large_image", title: chapter.title, description: chapter.description },
  };
}

function articleJsonLd(chapter: Chapter) {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: chapter.title,
    description: chapter.description,
    url: absoluteUrl(`/chapters/${chapter.slug}`),
    image: absoluteUrl(`/chapters/${chapter.slug}/opengraph-image`),
    datePublished: chapter.published,
    dateModified: chapter.updated,
    keywords: chapter.tags.join(", "),
    inLanguage: "en",
    isAccessibleForFree: true,
    ...(site.license ? { license: site.license.url } : {}),
    encoding: {
      "@type": "MediaObject",
      encodingFormat: "text/markdown",
      contentUrl: absoluteUrl(markdownPath(chapter.slug)),
    },
    author:
      chapter.authors.length > 0
        ? getAuthors(chapter.authors).map((a) => ({ "@type": "Person", name: a.name, url: a.url }))
        : { "@type": "Organization", name: site.name, url: site.url },
    publisher: { "@type": "Organization", name: site.name, url: site.url },
  };
}

function ChapterLink({ slug }: { slug: string }) {
  const target = getChapter(slug);
  if (!target) return <span className="text-muted">{slug} (coming soon)</span>;
  return (
    <Link href={`/chapters/${target.slug}`} className="link">
      {target.title}
    </Link>
  );
}

export default async function ChapterPage({ params }: PageProps<"/chapters/[slug]">) {
  const chapter = getChapter((await params).slug);
  if (!chapter) notFound();

  const part = getPart(chapter.part);
  const number = getChapterNumber(chapter.slug);
  const authors = getAuthors(chapter.authors);
  const { previous, next } = getNeighbors(chapter.slug);
  const usedIn = getUsedIn(chapter.slug);
  const hasReferences = chapter.citations.length > 0 || chapter.references.length > 0;
  const toc = [
    ...chapter.toc,
    ...(hasReferences ? [{ depth: 2 as const, id: "references", text: "References" }] : []),
    { depth: 2 as const, id: "how-to-cite", text: "How to cite" },
  ];
  const canonical = absoluteUrl(`/chapters/${chapter.slug}`);

  return (
    <div className="chapter-layout">
      <aside className="toc-rail">
        <TocRail items={toc} />
      </aside>

      <article className="reading-grid prose pt-10 sm:pt-16">
        {/* Running header for printed pages (see src/styles/print.css). */}
        <style>{`@media print { @page { @top-left { content: ${JSON.stringify(
          `${site.name} · ${chapter.title}`,
        )}; } } @page :first { @top-left { content: none; } } }`}</style>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(articleJsonLd(chapter)).replace(/</g, "\\u003c"),
          }}
        />

        <header className="font-ui">
          <p className="print-only chapter-kicker">
            {site.name}
            {part ? ` · ${part.title}` : null}
            {number ? ` · Chapter ${number}` : null}
          </p>
          <nav aria-label="Breadcrumb" className="print-hide text-sm text-muted">
            <Link href="/chapters" className="hover:text-text">
              Chapters
            </Link>
            {part ? (
              <>
                {" › "}
                <Link href={`/parts/${part.key}`} className="hover:text-text">
                  {part.title}
                </Link>
              </>
            ) : null}
            {number ? <> · Chapter {number}</> : null}
          </nav>
          <h1 className="mt-4 font-ui text-3xl leading-tight font-bold tracking-tight text-balance">
            {chapter.title}
          </h1>
          <p className="mt-3 font-body text-xl text-muted text-balance">{chapter.subtitle}</p>
          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted">
            {authors.length > 0 ? <span>By {authors.map((a) => a.name).join(", ")}</span> : null}
            {chapter.published ? (
              <time dateTime={chapter.published}>{formatDate(chapter.published)}</time>
            ) : null}
            {chapter.published && chapter.updated !== chapter.published ? (
              <span>
                Updated <time dateTime={chapter.updated}>{formatDate(chapter.updated)}</time>
              </span>
            ) : null}
            <span className="print-hide">{chapter.readingMinutes} min read</span>
            <span className="print-hide">
              <StatusBadge status={chapter.status} />
            </span>
            {chapter.tags.map((tag) => (
              <Link key={tag} href={`/tags/${tag}`} className="badge print-hide hover:text-text">
                {tag}
              </Link>
            ))}
            <span className="print-only">{canonical}</span>
          </div>
          <PrintPrep />
          {chapter.status === "archived" ? (
            <p className="callout print-hide mt-6" data-type="warning" role="note">
              This chapter is archived. It stays online so existing links keep working, but it is no
              longer maintained.
            </p>
          ) : null}
          {chapter.status === "draft" || chapter.status === "review" ? (
            <p className="callout print-hide mt-6" data-type="warning" role="note">
              {chapter.isFixture ? "Design fixture — never published." : `Unpublished ${chapter.status}.`}{" "}
              {chapter.openTodos > 0 ? `${chapter.openTodos} open TODO(verify).` : null}
            </p>
          ) : null}
        </header>

        {toc.length > 0 ? (
          <div className="print-hide">
            <TocInline items={toc} />
          </div>
        ) : null}

        <MDXContent code={chapter.body} components={getMdxComponents(chapter)} />

        {chapter.prerequisites.length > 0 || usedIn.length > 0 ? (
          <section aria-label="Related chapters" className="font-ui text-sm">
            {chapter.prerequisites.length > 0 ? (
              <p>
                <strong>Prerequisites:</strong>{" "}
                {chapter.prerequisites.map((slug, i) => (
                  <span key={slug}>
                    {i > 0 ? ", " : null}
                    <ChapterLink slug={slug} />
                  </span>
                ))}
              </p>
            ) : null}
            {usedIn.length > 0 ? (
              <p className="mt-2">
                <strong>Used in:</strong>{" "}
                {usedIn.map((c, i) => (
                  <span key={c.slug}>
                    {i > 0 ? ", " : null}
                    <ChapterLink slug={c.slug} />
                  </span>
                ))}
              </p>
            ) : null}
          </section>
        ) : null}

        {hasReferences ? (
          <section aria-labelledby="references" className="references">
            <h2 id="references">References</h2>
            {chapter.citations.length > 0 ? (
              <ol className="text-[0.95em]">
                {chapter.citations.map((c) => (
                  <li key={c.n} id={`ref-${c.n}`} value={c.n} className="scroll-mt-20">
                    {c.author ? `${c.author}. ` : null}
                    <a href={c.href}>{c.title}</a>
                    {c.year ? `. ${c.year}` : null}.
                  </li>
                ))}
              </ol>
            ) : null}
            {chapter.references.length > 0 ? (
              <>
                <h3 id="further-reading">Further reading</h3>
                <ul className="text-[0.95em]">
                  {chapter.references.map((r) => (
                    <li key={r.url}>
                      {r.authors ? `${r.authors}. ` : null}
                      <a href={r.url}>{r.title}</a>
                      {r.year ? `. ${r.year}` : null}.
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </section>
        ) : null}

        {chapter.revisions.length > 0 ? (
          <section aria-labelledby="revision-history" className="font-ui text-sm">
            <h2 id="revision-history">Revision history</h2>
            <ul className="list-none! ps-0!">
              {chapter.revisions.map((r) => (
                <li key={`${r.date}-${r.note}`}>
                  <time dateTime={r.date} className="text-muted tabular-nums">
                    {r.date}
                  </time>{" "}
                  — {r.note}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <HowToCite chapter={chapter} markdownHref={markdownPath(chapter.slug)} />

        {site.repoUrl ? (
          <p className="print-hide font-ui text-sm text-muted">
            <a
              href={`${site.repoUrl}/edit/main/content/chapters/${chapter.folder}/index.mdx`}
              className="link"
            >
              Edit this chapter
            </a>
            {" · "}
            <a
              href={`${site.repoUrl}/issues/new?template=errata.md&title=${encodeURIComponent(`Errata: ${chapter.title}`)}`}
              className="link"
            >
              Report an error
            </a>
          </p>
        ) : null}

        {previous || next ? (
          <nav
            aria-label="Chapter navigation"
            className="print-hide bleed-wide mt-16 grid gap-4 border-t border-border pt-8 font-ui sm:grid-cols-2"
          >
            {previous ? (
              <Link href={`/chapters/${previous.slug}`} className="group">
                <span className="text-sm text-muted">← Previous</span>
                <span className="block font-semibold group-hover:text-accent">{previous.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={`/chapters/${next.slug}`} className="group sm:text-right">
                <span className="text-sm text-muted">Next →</span>
                <span className="block font-semibold group-hover:text-accent">{next.title}</span>
              </Link>
            ) : null}
          </nav>
        ) : null}
      </article>
    </div>
  );
}
