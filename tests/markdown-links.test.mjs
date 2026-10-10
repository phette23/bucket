import assert from 'node:assert/strict'
import { fileURLToPath, URL } from 'node:url'
import test from 'node:test'
import markdownLinks from '../src/remark-markdown-links.mjs'

function rewrite(
  url,
  { base = '/bucket', source = 'faq.md', type = 'link' } = {},
) {
  const node = { type, url }
  const tree = {
    type: 'root',
    children: [{ type: 'paragraph', children: [node] }],
  }
  markdownLinks({ base })(tree, {
    path: fileURLToPath(new URL(`../content/${source}`, import.meta.url)),
  })
  return node.url
}

test('rewrites relative and nested Markdown links, preserving queries and fragments', () => {
  assert.equal(rewrite('./buckets.md'), '/bucket/buckets/')
  assert.equal(
    rewrite('../dogma.md?view=full#belief', { source: 'guide/index.md' }),
    '/bucket/dogma/?view=full#belief',
  )
  assert.equal(
    rewrite('./topic.md', { source: 'guide/index.md', type: 'definition' }),
    '/bucket/guide/topic/',
  )
})

test('resolves root-relative Markdown links from the content root', () => {
  assert.equal(
    rewrite('/dogma.md', { source: 'guide/index.md' }),
    '/bucket/dogma/',
  )
})

test('supports root deployments and trailing slashes in the base', () => {
  assert.equal(rewrite('dogma.md', { base: '/' }), '/dogma/')
  assert.equal(rewrite('dogma.md', { base: '/bucket/' }), '/bucket/dogma/')
})

test('leaves external links, anchors, assets, and existing page URLs alone', () => {
  for (const url of [
    'https://example.com/a.md',
    '//example.com/a.md',
    'git+ssh://example.com/a.md',
    '#heading',
    './photo.png',
    '/bucket/dogma/',
  ]) {
    assert.equal(rewrite(url), url)
  }
})

test('rejects Markdown links that escape the content directory', () => {
  assert.throws(() => rewrite('../outside.md'), /escapes content directory/)
})
