import path from 'node:path'

// Resolve links between source Markdown files to the generated page URLs.
export default function markdownLinks({ base }) {
  return (tree, file) => {
    const source = path.relative(path.resolve('content'), file.path)
    const visit = (node) => {
      if (node.type === 'link' || node.type === 'definition') {
        const match = node.url.match(/^([^?#]+)\.md([?#].*)?$/)
        if (match && !/^(?:[a-z]+:|\/\/)/i.test(node.url)) {
          const slug = path.posix.normalize(path.posix.join(path.dirname(source), match[1]))
          node.url = `${base}/${slug}/${match[2] ?? ''}`
        }
      }
      node.children?.forEach(visit)
    }
    visit(tree)
  }
}
