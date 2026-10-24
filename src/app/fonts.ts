import { Geist, Geist_Mono, Newsreader } from "next/font/google";

// Self-hosted at build time by next/font. Max two families + mono (design-system rules).

/** Reading and display serif; the opsz axis gives text and display cuts from one family. */
export const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
});

/** Interface sans: navigation, labels, tables, captions. */
export const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

export const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});
