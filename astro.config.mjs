import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Static site. Vercel detects Astro automatically; no adapter is needed.
export default defineConfig({
  site: 'https://davidbennettphd.com',
  vite: { plugins: [tailwindcss()] },
  build: { inlineStylesheets: 'always' },
});
