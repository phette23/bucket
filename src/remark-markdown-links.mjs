import path from 'node:path'
import { fileURLToPath, URL } from 'node:url'

const contentRoot = fileURLToPath(new URL('../content/', import.meta.url))

// Resolve links between source Markdown files to the generated page URLs.
export default function markdownLinks({ base = '/' } = {}) {
  const prefix = base.replace(/\/+$/, '')

  return (tree, file) => {
    const source = path
      .relative(contentRoot, file.path)
      .split(path.sep)
      .join('/')
    const visit = (node) => {
      if (node.type === 'link' || node.type === 'definition') {
        const match = node.url.match(/^([^?#]+)\.md([?#].*)?$/)
        if (match && !/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(node.url)) {
          const target = match[1]
          const slug = path.posix.normalize(
            target.startsWith('/')
              ? target.slice(1)
              : path.posix.join(path.posix.dirname(source), target),
          )
          if (slug === '..' || slug.startsWith('../')) {
            throw new Error(
              `Markdown link escapes content directory: ${node.url}`,
            )
          }
          node.url = `${prefix}/${slug}/${match[2] ?? ''}`
        }
      }
      node.children?.forEach(visit)
    }
    visit(tree)
  }
}
