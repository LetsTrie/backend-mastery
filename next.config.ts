import { withContentCollections } from "@content-collections/next";
import type { NextConfig } from "next";
import { getAliasRedirects } from "./src/lib/content/aliases";

// Fully static site: Cache Components stay off (see docs/adr/0002).
const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return getAliasRedirects();
  },
};

// withContentCollections must stay the outermost plugin.
export default withContentCollections(nextConfig);
