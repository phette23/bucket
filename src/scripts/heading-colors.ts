const palette = [
  [255, 137, 211],
  [102, 239, 224],
  [195, 153, 255],
] as const

function colorAt(position: number) {
  const progress = (((position % 1) + 1) % 1) * palette.length
  const index = Math.floor(progress)
  const start = palette[index]!
  const end = palette[(index + 1) % palette.length]!
  const channels = start.map((channel, i) =>
    Math.round(channel + (end[i]! - channel) * (progress - index)),
  )
  return `rgb(${channels.join(', ')})`
}

export function animateHeadingColors(root: ParentNode = document) {
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
  const animations: Animation[] = []

  for (const heading of root.querySelectorAll<HTMLHeadingElement>('h1')) {
    if (heading.dataset.colorWave === 'ready') {
      continue
    }
    heading.dataset.colorWave = 'ready'
    // Keep the heading's complete accessible name and preserve nested markup.
    heading.setAttribute(
      'aria-label',
      heading.innerText.replace(/\s+/g, ' ').trim(),
    )
    const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT)
    const textNodes: Text[] = []
    while (walker.nextNode()) {
      textNodes.push(walker.currentNode as Text)
    }
    const letters: HTMLSpanElement[] = []
    const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' })
    for (const node of textNodes) {
      const fragment = document.createDocumentFragment()
      for (const { segment } of segmenter.segment(node.data)) {
        if (/^\s+$/.test(segment)) {
          fragment.append(document.createTextNode(segment))
          continue
        }
        const letter = document.createElement('span')
        letter.className = 'heading-letter'
        letter.textContent = segment
        fragment.append(letter)
        letters.push(letter)
      }
      node.replaceWith(fragment)
    }

    const stagger = 80
    const transition = 1200
    const pause = 3000
    const duration =
      transition + Math.max(0, letters.length - 1) * stagger + pause
    letters.forEach((letter, index) => {
      const position = index / Math.max(1, letters.length - 1)
      const color = colorAt(position * 0.8)
      letter.style.color = color
      animations.push(
        letter.animate(
          [
            { color, offset: 0, easing: 'ease-in-out' },
            {
              color: colorAt(position * 0.8 + 1 / 3),
              offset: transition / duration / 3,
              easing: 'ease-in-out',
            },
            {
              color: colorAt(position * 0.8 + 2 / 3),
              offset: ((transition / duration) * 2) / 3,
              easing: 'ease-in-out',
            },
            { color, offset: transition / duration },
            { color, offset: 1 },
          ],
          {
            duration,
            delay: index * stagger,
            iterations: Infinity,
          },
        ),
      )
    })
  }

  const updateMotion = () => {
    for (const animation of animations) {
      if (motionPreference.matches) {
        animation.cancel()
      } else {
        animation.play()
      }
    }
  }
  updateMotion()
  motionPreference.addEventListener('change', updateMotion)
}
