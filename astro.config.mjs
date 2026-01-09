// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import remarkDirective from 'remark-directive';
import { remarkCallouts } from './src/lib/remark-callouts.mjs';
import { remarkDraftContainer } from './src/lib/remark-draft.mjs';

// https://astro.build/config
export default defineConfig({
	// site: 'https://your-domain.com', // Uncomment and set your site URL for production
	// base: '/', // Set base path if deploying to a subdirectory
	markdown: {
		remarkPlugins: [remarkDirective, remarkDraftContainer, remarkCallouts],
	},
	vite: {
		plugins: [tailwindcss()]
	}
});
