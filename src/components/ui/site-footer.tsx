import Link from "next/link";
import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto flex max-w-[90rem] flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm text-muted sm:px-6">
        <p>
          {site.name} · {site.tagline}
        </p>
        <nav aria-label="Footer" className="flex gap-5">
          <Link href="/feed.xml" className="hover:text-text">
            RSS
          </Link>
          <Link href="/atom.xml" className="hover:text-text">
            Atom
          </Link>
          <a href="/llms.txt" className="hover:text-text">
            llms.txt
          </a>
          {site.repoUrl ? (
            <a href={site.repoUrl} className="hover:text-text">
              Source
            </a>
          ) : null}
        </nav>
      </div>
    </footer>
  );
}
