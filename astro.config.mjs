import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.easyequate.com',
  trailingSlash: 'never',
  redirects: {
    '/solver': '/equation-solver-with-steps',
  },
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap({
      filter: (page) =>
        !page.includes('/test-sandbox') &&
        !page.includes('/404') &&
        !page.includes('/test'),
    }),
  ],
  vite: {
    ssr: {
      noExternal: ['nerdamer', 'katex'],
    },
  },
});
