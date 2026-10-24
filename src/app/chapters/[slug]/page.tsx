import { MDXContent } from "@content-collections/mdx/react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMdxComponents } from "@/components/mdx";
import { HowToCite } from "@/components/ui/how-to-cite";
import { Icon } from "@/components/ui/icons";
import { PrintPrep } from "@/components/ui/print-prep";
import { TocRail } from "@/components/ui/toc";
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
  if (!target) {
    return (
      <span className="chip" title="Not written yet">
        {slug.split("-").join(" ")} · soon
      </span>
    );
  }
  return (
    <Link href={`/chapters/${target.slug}`} className="chip">
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
      <div className="reading-progress print-hide" aria-hidden="true" />
      <aside className="toc-rail print-hide">
        <TocRail items={toc} />
      </aside>

      <article className="reading-grid prose">
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

        <header className="chapter-hero font-ui">
          <p className="print-only chapter-kicker">
            {site.name}
            {part ? ` · ${part.title}` : null}
            {number ? ` · Chapter ${number}` : null}
          </p>
          {number ? (
            <p className="eyebrow print-hide">
              Chapter {String(number).padStart(2, "0")}
              {chapter.kind === "case-study" ? <span className="text-subtle">· Case study</span> : null}
            </p>
          ) : null}
          <h1 className="display chapter-title">{chapter.title}</h1>
          <p className="lede mt-5 text-xl">{chapter.subtitle}</p>

          {/* No byline strip on screen; a printed copy still says who, when, and where. */}
          <p className="print-only chapter-meta">
            {[
              authors.map((author) => author.name).join(", "),
              chapter.published ? formatDate(chapter.published) : null,
              canonical,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>

          {chapter.tags.length > 0 ? (
            <div className="mt-6 flex flex-wrap gap-2 print-hide">
              {chapter.tags.map((tag) => (
                <Link key={tag} href={`/tags/${tag}`} className="chip">
                  #{tag}
                </Link>
              ))}
            </div>
          ) : null}

          <PrintPrep />
          {chapter.status === "archived" ? (
            <p className="notice print-hide" role="note">
              <Icon name="warning" size={17} />
              This chapter is archived. It stays online so existing links keep working, but it is no
              longer maintained.
            </p>
          ) : null}
          {chapter.status === "draft" || chapter.status === "review" ? (
            <p className="notice print-hide" role="note">
              <Icon name="warning" size={17} />
              <span>
                {chapter.isFixture
                  ? "Design fixture. Never published."
                  : `This chapter is in ${chapter.status} and not yet published.`}{" "}
                {chapter.openTodos > 0 ? `${chapter.openTodos} open TODO(verify).` : null}
              </span>
            </p>
          ) : null}
        </header>

        <MDXContent code={chapter.body} components={getMdxComponents(chapter)} />

        <div className="end-matter space-y-12">
          {chapter.prerequisites.length > 0 || usedIn.length > 0 ? (
            <section aria-label="Related chapters" className="end-section font-ui">
              {chapter.prerequisites.length > 0 ? (
                <div>
                  <p className="text-xs font-bold tracking-[0.09em] text-muted uppercase">
                    Read first
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {chapter.prerequisites.map((slug) => (
                      <ChapterLink key={slug} slug={slug} />
                    ))}
                  </div>
                </div>
              ) : null}
              {usedIn.length > 0 ? (
                <div className="mt-6">
                  <p className="text-xs font-bold tracking-[0.09em] text-muted uppercase">Used in</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {usedIn.map((c) => (
                      <ChapterLink key={c.slug} slug={c.slug} />
                    ))}
                  </div>
                </div>
              ) : null}
            </section>
          ) : null}

          {hasReferences ? (
            <section aria-labelledby="references" className="references end-section">
              <h2 id="references">References</h2>
              {chapter.citations.length > 0 ? (
                <ol>
                  {chapter.citations.map((c) => (
                    <li key={c.n} id={`ref-${c.n}`} value={c.n}>
                      <span>
                        {c.author ? `${c.author}. ` : null}
                        <a href={c.href}>{c.title}</a>
                        {c.year ? `. ${c.year}` : null}.
                      </span>
                    </li>
                  ))}
                </ol>
              ) : null}
              {chapter.references.length > 0 ? (
                <>
                  <h3 id="further-reading">Further reading</h3>
                  <ul>
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
            <section aria-labelledby="revision-history" className="end-section font-ui text-sm">
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
            <nav aria-label="Chapter navigation" className="pager print-hide">
              {previous ? (
                <Link href={`/chapters/${previous.slug}`} className="pager-card" data-dir="previous">
                  <span className="pager-label">
                    <Icon name="arrowLeft" size={14} />
                    Previous
                  </span>
                  <span className="pager-title">{previous.title}</span>
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link href={`/chapters/${next.slug}`} className="pager-card" data-dir="next">
                  <span className="pager-label">
                    Next
                    <Icon name="arrowRight" size={14} />
                  </span>
                  <span className="pager-title">{next.title}</span>
                </Link>
              ) : null}
            </nav>
          ) : null}
        </div>
      </article>
    </div>
  );
}
