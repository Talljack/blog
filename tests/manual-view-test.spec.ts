import { test, expect } from '@playwright/test'

test.describe('Manual View Counter Test', () => {
  test('debug view counter behavior', async ({ page }) => {
    // 完全清除所有存储
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
      // 清除所有相关的sessionStorage键
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key && key.includes('viewed-')) {
          sessionStorage.removeItem(key)
        }
      }
    })

    console.log('=== Initial visit ===')

    // 第一次访问文章
    await page.goto('/blog/playwright-e2e-testing')
    await page.waitForSelector('span:has-text("次阅读")', { timeout: 10000 })

    const viewCounter = page.locator('span:has-text("次阅读")').first()
    const initialText = await viewCounter.textContent()
    const initialCount = parseInt(initialText?.match(/(\d+)/)?.[1] || '0')
    console.log(`First visit count: ${initialCount}`)

    // 等待一秒让API调用完成
    await page.waitForTimeout(2000)

    // 检查sessionStorage
    const sessionKeys = await page.evaluate(() => {
      const keys = []
      for (let i = 0; i < sessionStorage.length; i++) {
        keys.push(sessionStorage.key(i))
      }
      return keys
    })
    console.log('SessionStorage keys after first visit:', sessionKeys)

    console.log('=== Clear session and revisit ===')

    // 清除sessionStorage并重新访问
    await page.evaluate(() => {
      sessionStorage.clear()
    })

    await page.goto('/blog/playwright-e2e-testing')
    await page.waitForSelector('span:has-text("次阅读")', { timeout: 10000 })
    await page.waitForTimeout(3000) // 等待API调用

    const secondText = await viewCounter.textContent()
    const secondCount = parseInt(secondText?.match(/(\d+)/)?.[1] || '0')
    console.log(`Second visit count: ${secondCount}`)

    console.log('=== Same session refresh ===')

    // 同个session刷新
    await page.reload()
    await page.waitForSelector('span:has-text("次阅读")', { timeout: 10000 })
    await page.waitForTimeout(2000)

    const thirdText = await viewCounter.textContent()
    const thirdCount = parseInt(thirdText?.match(/(\d+)/)?.[1] || '0')
    console.log(`Same session refresh count: ${thirdCount}`)

    // 输出总结
    console.log('=== Summary ===')
    console.log(
      `Initial: ${initialCount}, After clearing: ${secondCount}, After refresh: ${thirdCount}`
    )
    console.log(`Should increment: ${secondCount > initialCount}`)
    console.log(
      `Should not increment on same session: ${thirdCount === secondCount}`
    )
  })
})
