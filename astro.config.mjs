// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://foothouse-nu.vercel.app', // TODO: change to the custom domain when there is one
  adapter: vercel(),
  integrations: [sitemap()],
  redirects: {
    '/colophon': '/about',
  },
});
