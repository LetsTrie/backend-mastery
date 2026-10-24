import { getChapters } from "@/lib/content";
import { absoluteUrl, site } from "@/lib/site";

const escape = (value: string) =>
  value.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c] ?? c);

function feedItems() {
  return getChapters({ includeDrafts: false })
    .filter((c) => c.published)
    .sort((a, b) => (b.published ?? "").localeCompare(a.published ?? ""))
    .slice(0, 50)
    .map((c) => ({ ...c, url: absoluteUrl(`/chapters/${c.slug}`) }));
}

/** RSS 2.0. Item GUID is the permanent chapter URL. */
export function rssFeed() {
  const items = feedItems()
    .map(
      (c) => `    <item>
      <title>${escape(c.title)}</title>
      <link>${c.url}</link>
      <guid isPermaLink="true">${c.url}</guid>
      <pubDate>${new Date(`${c.published}T00:00:00Z`).toUTCString()}</pubDate>
      <description>${escape(c.description)}</description>
${c.tags.map((t) => `      <category>${escape(t)}</category>`).join("\n")}
    </item>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(site.name)}</title>
    <link>${site.url}</link>
    <description>${escape(site.description)}</description>
    <language>en-us</language>
    <atom:link href="${absoluteUrl("/feed.xml")}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;
}

/** Atom 1.0. Entry id is the permanent chapter URL. */
export function atomFeed() {
  const items = feedItems();
  const updated = items.map((c) => c.updated).sort().at(-1) ?? "2026-01-01";
  const entries = items
    .map(
      (c) => `  <entry>
    <title>${escape(c.title)}</title>
    <link href="${c.url}"/>
    <id>${c.url}</id>
    <published>${c.published}T00:00:00Z</published>
    <updated>${c.updated}T00:00:00Z</updated>
    <summary>${escape(c.description)}</summary>
  </entry>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escape(site.name)}</title>
  <subtitle>${escape(site.description)}</subtitle>
  <link href="${site.url}"/>
  <link href="${absoluteUrl("/atom.xml")}" rel="self"/>
  <id>${site.url}/</id>
  <updated>${updated}T00:00:00Z</updated>
${entries}
</feed>
`;
}
