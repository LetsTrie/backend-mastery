function resolveSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return "http://localhost:3000";
}

export const site = {
  name: "Backend Mastery",
  tagline: "System design, explained in depth.",
  description:
    "Long-form, diagram-rich system design chapters for working engineers: requirements, estimates, deep dives, failure modes, and trade-offs.",
  url: resolveSiteUrl().replace(/\/$/, ""),
  /** e.g. https://github.com/org/backend-mastery — enables "Edit" and "Report an error" links. */
  repoUrl: process.env.NEXT_PUBLIC_REPO_URL,
  locale: "en-US",
  /**
   * Content license, shown in the footer, page metadata, Markdown exports, and llms.txt.
   * CC BY 4.0: anyone may share and adapt the content, including commercially, with attribution.
   */
  license: { name: "CC BY 4.0", url: "https://creativecommons.org/licenses/by/4.0/" } as
    | { name: string; url: string }
    | undefined,
} as const;

export function absoluteUrl(path: string) {
  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat(site.locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}
