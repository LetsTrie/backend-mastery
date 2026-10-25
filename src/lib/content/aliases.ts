import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { parse } from "yaml";

/**
 * Permanent redirects from old slugs (`aliases` frontmatter) to current chapter URLs.
 * Reads frontmatter directly because next.config runs before content-collections output exists.
 */
export function getAliasRedirects() {
  const dir = path.join(process.cwd(), "content", "chapters");
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("_"))
    // A chapter folder holds only outline.md until its outline is approved.
    .filter((entry) => existsSync(path.join(dir, entry.name, "index.mdx")))
    .flatMap((entry) => {
      const source = readFileSync(path.join(dir, entry.name, "index.mdx"), "utf8");
      const frontmatter = /^---\n([\s\S]*?)\n---/.exec(source)?.[1];
      const data = (frontmatter ? parse(frontmatter) : {}) as { slug?: string; aliases?: string[] };
      return (data.aliases ?? []).map((alias) => ({
        source: `/chapters/${alias}/:path*`,
        destination: `/chapters/${data.slug ?? entry.name}/:path*`,
        permanent: true,
      }));
    });
}
