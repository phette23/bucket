import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import markdownLinks from './src/remark-markdown-links.mjs';

export default defineConfig({
  site: 'https://phette23.github.io',
  base: '/bucket',
  output: 'static',
  markdown: {
    processor: unified({
      remarkPlugins: [[markdownLinks, { base: '/bucket' }]],
    }),
  },
});
