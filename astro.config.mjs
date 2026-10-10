import { defineConfig } from 'astro/config'
import { unified } from '@astrojs/markdown-remark'
import markdownLinks from './src/remark-markdown-links.mjs'

const base = '/bucket'

export default defineConfig({
  site: 'https://phette23.github.io',
  base,
  output: 'static',
  markdown: {
    processor: unified({
      remarkPlugins: [[markdownLinks, { base }]],
    }),
  },
})
