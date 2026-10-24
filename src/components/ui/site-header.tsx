import Link from "next/link";
import { site } from "@/lib/site";
import { Icon, LogoMark } from "./icons";
import { NavLink } from "./nav-link";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  return (
    <header className="site-header print-hide">
      <div className="container-page flex h-full items-center justify-between gap-4">
        <Link href="/" className="brand" aria-label={`${site.name} home`}>
          <LogoMark />
          <span className="max-[30rem]:sr-only">{site.name}</span>
        </Link>
        <nav aria-label="Main" className="flex items-center gap-1">
          <NavLink href="/chapters">Chapters</NavLink>
          <NavLink href="/glossary">Glossary</NavLink>
          <span className="mx-1.5 h-5 w-px bg-border max-sm:hidden" aria-hidden="true" />
          <a href="/feed.xml" className="icon-button max-sm:hidden" aria-label="RSS feed" title="RSS feed">
            <Icon name="rss" />
          </a>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
