import rehypePrettyCode, { type Options as PrettyCodeOptions } from "rehype-pretty-code";
import remarkGfm from "remark-gfm";
import type { Pluggable } from "unified";
import { remarkHeadingIds } from "./headings";

const prettyCode: PrettyCodeOptions = {
  theme: { light: "github-light", dark: "github-dark" },
  keepBackground: false,
  defaultLang: { block: "text" },
};

/**
 * The MDX pipeline. Plugins here must depend only on the MDX source (compiled output is
 * cached by content). Anything that depends on other files — figure numbers, sizes,
 * citations — is computed in the collection transform and injected via components.
 */
export const remarkPlugins: Pluggable[] = [remarkGfm, remarkHeadingIds];
export const rehypePlugins: Pluggable[] = [[rehypePrettyCode, prettyCode]];
