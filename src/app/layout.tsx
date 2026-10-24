import type { Metadata, Viewport } from "next";
import { BackToTop } from "@/components/ui/back-to-top";
import { SiteFooter } from "@/components/ui/site-footer";
import { SiteHeader } from "@/components/ui/site-header";
import { prePaintScript } from "@/components/ui/pre-paint";
import { site } from "@/lib/site";
import { geist, geistMono, newsreader } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s — ${site.name}` },
  description: site.description,
  alternates: {
    types: {
      "application/rss+xml": [{ url: "/feed.xml", title: `${site.name} (RSS)` }],
      "application/atom+xml": [{ url: "/atom.xml", title: `${site.name} (Atom)` }],
    },
  },
  openGraph: { siteName: site.name, locale: site.locale.replace("-", "_"), type: "website" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfaf7" },
    { media: "(prefers-color-scheme: dark)", color: "#161513" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${geist.variable} ${geistMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: prePaintScript }} />
      </head>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <BackToTop />
      </body>
    </html>
  );
}
