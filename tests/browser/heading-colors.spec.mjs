import { test, expect } from '@playwright/test'

test('animates individual letters in order while preserving headings and line breaks', async ({
  page,
}) => {
  await page.goto('/bucket/')
  const heading = page.getByRole('heading', { level: 1 })
  await expect(heading).toHaveAttribute('data-color-wave', 'ready')
  await expect(heading).toHaveAccessibleName(
    'EVERYTHING IS A BUCKET IF YOU LOOK AT IT RIGHT',
  )
  await expect(heading.locator('br')).toHaveCount(3)
  const timings = await heading
    .locator('.heading-letter')
    .evaluateAll((letters) =>
      letters.map((letter) => {
        const animation = letter.getAnimations()[0]
        animation.pause()
        return animation.effect.getTiming()
      }),
    )
  expect(timings).toHaveLength(37)
  timings.forEach((timing, index) => {
    expect(timing.delay).toBe(index * 80)
    expect(timing.duration).toBe(timings[0].duration)
    expect(timing.iterations).toBe(Infinity)
  })
  // Each 1.2-second transition overlaps the following letter's 80ms delay.
  expect(timings[1].delay).toBeLessThan(1200)
})

test('letters change through the palette, then pause together before repeating', async ({
  page,
}) => {
  await page.goto('/bucket/dogma/')
  await expect(page.locator('h1')).toHaveAttribute('data-color-wave', 'ready')
  const samples = await page
    .locator('.heading-letter')
    .evaluateAll((letters) => {
      const animations = letters.map((letter) => letter.getAnimations()[0])
      for (const animation of animations) {
        animation.pause()
      }
      const colorsAt = (time) => {
        for (const animation of animations) {
          animation.currentTime = time
        }
        return letters.map((letter) => getComputedStyle(letter).color)
      }
      const duration = animations[0].effect.getTiming().duration
      const waveEnd = (letters.length - 1) * 80 + 1200
      return {
        initial: colorsAt(0),
        changing: colorsAt(400),
        pauseStart: colorsAt(waveEnd + 100),
        pauseEnd: colorsAt(duration - 100),
        repeated: colorsAt(duration + 400),
        pauseLength: duration - waveEnd,
      }
    })
  expect(new Set(samples.initial).size).toBeGreaterThan(1)
  expect(samples.changing[0]).not.toBe(samples.initial[0])
  expect(samples.pauseStart).toEqual(samples.initial)
  expect(samples.pauseEnd).toEqual(samples.initial)
  expect(samples.pauseLength).toBe(3000)
  expect(samples.repeated[0]).toBe(samples.changing[0])
})

test('reduced motion displays static colors and responds to preference changes', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/bucket/faq/')
  await expect(page.locator('h1')).toHaveAttribute('data-color-wave', 'ready')
  const letters = page.locator('.heading-letter')
  expect(await letters.count()).toBe(3)
  expect(
    await letters.evaluateAll(
      (nodes) => nodes.flatMap((node) => node.getAnimations()).length,
    ),
  ).toBe(0)
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await expect
    .poll(() =>
      letters.evaluateAll(
        (nodes) => nodes.flatMap((node) => node.getAnimations()).length,
      ),
    )
    .toBe(3)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect
    .poll(() =>
      letters.evaluateAll(
        (nodes) => nodes.flatMap((node) => node.getAnimations()).length,
      ),
    )
    .toBe(0)
})

test('headings remain readable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto('/bucket/dogma/')
  await expect(page.getByRole('heading', { name: 'Dogma' })).toBeVisible()
  await expect(page.locator('.heading-letter')).toHaveCount(0)
  await context.close()
})
