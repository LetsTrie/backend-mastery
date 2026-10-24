import Link from "next/link";
import { getParts } from "@/lib/content";
import { site } from "@/lib/site";
import { LogoMark } from "./icons";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer print-hide">
      <div className="container-page grid gap-12 py-14 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <div className="max-w-sm">
          <Link href="/" className="brand">
            <LogoMark />
            {site.name}
          </Link>
          <p className="mt-4 font-body text-muted">{site.description}</p>
        </div>

        <nav aria-label="The book">
          <p className="footer-heading">The book</p>
          <ul className="space-y-2.5">
            <li>
              <Link href="/chapters" className="footer-link">
                All chapters
              </Link>
            </li>
            {getParts().map((part) => (
              <li key={part.key}>
                <Link href={`/parts/${part.key}`} className="footer-link">
                  {part.title}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/glossary" className="footer-link">
                Glossary
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Follow">
          <p className="footer-heading">Follow</p>
          <ul className="space-y-2.5">
            <li>
              <a href="/feed.xml" className="footer-link">
                RSS
              </a>
            </li>
            <li>
              <a href="/atom.xml" className="footer-link">
                Atom
              </a>
            </li>
            <li>
              <a href="/llms.txt" className="footer-link">
                llms.txt
              </a>
            </li>
          </ul>
        </nav>

        <nav aria-label="Project">
          <p className="footer-heading">Project</p>
          <ul className="space-y-2.5">
            {site.repoUrl ? (
              <li>
                <a href={site.repoUrl} className="footer-link">
                  Source
                </a>
              </li>
            ) : null}
            {site.license ? (
              <li>
                <a href={site.license.url} rel="license" className="footer-link">
                  {site.license.name}
                </a>
              </li>
            ) : null}
          </ul>
        </nav>
      </div>

      <div className="border-t border-border">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 py-6 text-sm text-muted">
          <p>
            © {year} {site.name}.{" "}
            {site.license ? (
              <>
                Text and diagrams under{" "}
                <a href={site.license.url} rel="license" className="link">
                  {site.license.name}
                </a>
                .
              </>
            ) : null}
          </p>
          <p>{site.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
