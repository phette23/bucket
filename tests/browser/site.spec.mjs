import { test, expect } from '@playwright/test'

const routes = ['', 'dogma/', 'buckets/', 'faq/']

for (const width of [320, 375, 768, 1280]) {
  test(`pages fit a ${width}px viewport and navigation works`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: width === 1280 ? 720 : 667 })
    for (const route of routes) {
      const response = await page.goto(`/bucket/${route}`)
      expect(response.status()).toBe(200)
      await expect(page).toHaveTitle(/\S/)
      await expect(page.locator('h1')).toHaveCount(1)
      expect(await page.locator('html').getAttribute('lang')).toBe('en')
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true)
      const links = page.getByRole('navigation').getByRole('link')
      await expect(links).toHaveCount(3)
      for (const link of await links.all()) {
        const box = await link.boundingBox()
        expect(box.height).toBeGreaterThanOrEqual(44)
        expect(box.width).toBeGreaterThanOrEqual(44)
        const href = await link.getAttribute('href')
        expect(href).toMatch(/^\/bucket\//)
        expect((await page.request.get(href)).status()).toBe(200)
      }
    }
  })
}

test('Markdown links reach the intended pages', async ({ page }) => {
  await page.goto('/bucket/faq/')
  await page
    .getByRole('link', { name: 'Abridged List of Things that are Buckets' })
    .click()
  await expect(page).toHaveURL(/\/bucket\/buckets\/$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Abridged List of Things that are Buckets',
  )
})

test('long content and enlarged text fit narrow screens', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 })
  for (const route of ['', 'faq/']) {
    await page.goto(`/bucket/${route}`)
    await page.addStyleTag({ content: 'html { font-size: 32px; }' })
    await page.locator('main').evaluate((main) => {
      const paragraph = document.createElement('p')
      paragraph.textContent = 'https://example.com/' + 'long-segment'.repeat(30)
      main.append(paragraph)
    })
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true)
  }
})

test('reduced motion disables the background animation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/bucket/')
  expect(
    await page
      .locator('body')
      .evaluate((body) => getComputedStyle(body, '::after').animationName),
  ).toBe('none')
})
