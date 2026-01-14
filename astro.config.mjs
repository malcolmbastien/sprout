// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import remarkDirective from "remark-directive";
import { remarkCallouts } from "./src/lib/remark-callouts.mjs";
import { remarkDraftContainer } from "./src/lib/remark-draft.mjs";
import { remarkWikiLinks } from "./src/lib/remark-wiki-links.mjs";
import { remarkLinkDistinction } from "./src/lib/remark-link-distinction.mjs";
import { remarkHashtags } from "./src/lib/remark-hashtags.mjs";
import { remarkAssetShortcuts } from "./src/lib/remark-asset-shortcuts.mjs";

// https://astro.build/config
export default defineConfig({
  // site: 'https://your-domain.com', // Uncomment and set your site URL for production
  // base: '/', // Set base path if deploying to a subdirectory
  integrations: [sitemap()],
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "hover",
  },
  markdown: {
    remarkPlugins: [
      remarkDirective,
      remarkDraftContainer,
      remarkCallouts,
      remarkWikiLinks,
      remarkLinkDistinction,
      remarkHashtags,
      remarkAssetShortcuts,
    ],
  },
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    format: "directory",
  },
});
