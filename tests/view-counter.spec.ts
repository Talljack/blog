import { test, expect } from '@playwright/test'

test.describe('View Counter', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage and sessionStorage to ensure clean state
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
  })

  test('should increment view count when visiting blog post', async ({
    page,
  }) => {
    // Go to a specific blog post
    await page.goto('/blog/playwright-e2e-testing')

    // Wait for the page to load and ViewCounter to appear
    await page.waitForSelector(
      '[data-testid="view-counter"], span:has-text("次阅读")',
      { timeout: 10000 }
    )

    // Get initial view count
    const viewCounterElement = page.locator('span:has-text("次阅读")').first()
    await expect(viewCounterElement).toBeVisible()

    const initialText = await viewCounterElement.textContent()
    const initialCount = parseInt(initialText?.match(/(\d+)/)?.[1] || '0')

    console.log(`Initial view count: ${initialCount}`)

    // Clear session storage to allow another increment
    await page.evaluate(() => {
      sessionStorage.clear()
    })

    // Refresh the page to trigger view increment
    await page.reload()
    await page.waitForSelector('span:has-text("次阅读")', { timeout: 10000 })

    // Wait a bit for the API call to complete
    await page.waitForTimeout(2000)

    // Get updated view count
    const updatedText = await viewCounterElement.textContent()
    const updatedCount = parseInt(updatedText?.match(/(\d+)/)?.[1] || '0')

    console.log(`Updated view count: ${updatedCount}`)

    // Check that view count increased
    expect(updatedCount).toBeGreaterThan(initialCount)
  })

  test('should not increment view count on same session', async ({ page }) => {
    // Go to a specific blog post
    await page.goto('/blog/playwright-e2e-testing')

    // Wait for the ViewCounter to appear
    await page.waitForSelector('span:has-text("次阅读")', { timeout: 10000 })

    // Get initial view count
    const viewCounterElement = page.locator('span:has-text("次阅读")').first()
    const initialText = await viewCounterElement.textContent()
    const initialCount = parseInt(initialText?.match(/(\d+)/)?.[1] || '0')

    console.log(`Initial view count: ${initialCount}`)

    // Refresh the page (same session)
    await page.reload()
    await page.waitForSelector('span:has-text("次阅读")', { timeout: 10000 })

    // Wait a bit
    await page.waitForTimeout(2000)

    // Get view count after refresh
    const afterRefreshText = await viewCounterElement.textContent()
    const afterRefreshCount = parseInt(
      afterRefreshText?.match(/(\d+)/)?.[1] || '0'
    )

    console.log(`After refresh view count: ${afterRefreshCount}`)

    // Should be the same count (no increment in same session)
    expect(afterRefreshCount).toBe(initialCount)
  })

  test('should display view counter on blog post page', async ({ page }) => {
    // Go to a blog post
    await page.goto('/blog/nextjs-blog-guide')

    // Check that view counter is visible
    const viewCounter = page.locator('span:has-text("次阅读")').first()
    await expect(viewCounter).toBeVisible()

    // Check that it contains a number
    const text = await viewCounter.textContent()
    expect(text).toMatch(/\d+\s*次阅读/)
  })

  test('should make API call to increment views', async ({ page }) => {
    let viewsApiCalled = false

    // Listen for API calls
    page.on('request', request => {
      if (request.url().includes('/api/views') && request.method() === 'POST') {
        viewsApiCalled = true
        console.log('Views API called:', request.url())
      }
    })

    // Go to a blog post with increment=true (fresh session)
    await page.goto('/blog/playwright-e2e-testing')

    // Wait for the API call to be made
    await page.waitForTimeout(3000)

    // Verify API was called
    expect(viewsApiCalled).toBe(true)
  })
})
