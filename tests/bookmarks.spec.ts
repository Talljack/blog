import { test, expect } from '@playwright/test'

test.describe('X 推文收藏功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000')
  })

  test('1. 主页导航包含收藏链接', async ({ page }) => {
    const bookmarksLink = page.locator('nav a:has-text("收藏")').first()
    await expect(bookmarksLink).toBeVisible()
    await expect(bookmarksLink).toHaveAttribute('href', '/bookmarks')
  })

  test('2. 访问公开收藏页面', async ({ page }) => {
    await page.goto('http://localhost:3000/bookmarks/public')
    await expect(page).toHaveURL(/.*bookmarks\/public/)
    await expect(page.locator('h1')).toContainText('公开推文收藏')
  })

  test('3. 访问保存推文页面', async ({ page }) => {
    // Set admin token to access the full form
    await page.goto('http://localhost:3000/bookmarks/save')
    await page.evaluate(() => {
      localStorage.setItem('admin_token', btoa('admin:zz1234zz'))
    })
    await page.goto('http://localhost:3000/bookmarks/save')
    await expect(page).toHaveURL(/.*bookmarks\/save/)

    const heading = page.locator('text=保存推文').first()
    await expect(heading).toBeVisible()

    // 检查 Bookmarklet 说明
    const bookmarkletSection = page.locator('text=快速保存书签')
    await expect(bookmarkletSection).toBeVisible()
  })

  test('4. 保存推文表单验证', async ({ page }) => {
    await page.goto('http://localhost:3000/bookmarks/save')
    await page.evaluate(() => {
      localStorage.setItem('admin_token', btoa('admin:zz1234zz'))
    })
    await page.goto('http://localhost:3000/bookmarks/save')

    // 检查表单字段
    await expect(page.locator('input[type="url"]')).toBeVisible()
    await expect(page.locator('input#tags')).toBeVisible()
    await expect(page.locator('textarea#notes')).toBeVisible()
    await expect(page.locator('input[type="checkbox"]#isPublic')).toBeVisible()

    // 检查提交按钮
    const submitButton = page.locator('button[type="submit"]')
    await expect(submitButton).toBeVisible()
    await expect(submitButton).toContainText('保存')
  })

  test('5. 未认证访问私有页面重定向', async ({ page }) => {
    await page.goto('http://localhost:3000/bookmarks')
    // 应该重定向到公开页面
    await page.waitForURL(/.*bookmarks\/public/, { timeout: 5000 })
    await expect(page).toHaveURL(/.*bookmarks\/public/)
  })

  test('6. 搜索和筛选组件存在', async ({ page }) => {
    await page.goto('http://localhost:3000/bookmarks/public')

    const searchInput = page.locator('#bookmark-search')
    await expect(searchInput).toBeVisible()
  })

  test('7. API - 获取公开推文', async ({ request }) => {
    const response = await request.get(
      'http://localhost:3000/api/bookmarks?public=true'
    )
    expect(response.status()).toBe(200)

    const json = await response.json()

    expect(json).toHaveProperty('success', true)
    expect(json).toHaveProperty('data')
    expect(json.data).toHaveProperty('tweets')
    expect(json.data).toHaveProperty('total')
    expect(json.data).toHaveProperty('page')
    expect(json.data).toHaveProperty('limit')
  })

  test('8. API - 保存推文需要认证', async ({ request }) => {
    const response = await request.post('http://localhost:3000/api/bookmarks', {
      data: {
        url: 'https://x.com/test/status/123',
        tags: ['test'],
        notes: 'Test note',
        isPublic: false,
      },
    })
    expect(response.status()).toBe(401)
  })

  test('9. API - 使用认证保存推文', async ({ request }) => {
    const uniqueSuffix = Date.now()
    const url = `https://x.com/elonmusk/status/${uniqueSuffix}`
    const previewText = `Playwright metadata roundtrip ${uniqueSuffix}`

    const response = await request.post(
      'http://localhost:3000/api/bookmarks?username=admin&password=zz1234zz',
      {
        data: {
          url,
          tags: ['tech', 'ai'],
          notes: 'Playwright 测试推文',
          isPublic: true,
          metadata: {
            text: previewText,
          },
        },
      }
    )

    expect(response.status()).toBe(201)
    const json = await response.json()

    expect(json).toHaveProperty('success', true)
    expect(json.data).toHaveProperty('id')
    expect(json.data).toHaveProperty('url', url)
    expect(json.data.tags).toContain('tech')
    expect(json.data.tags).toContain('ai')

    const queryResponse = await request.get(
      `http://localhost:3000/api/bookmarks?username=admin&password=zz1234zz&q=${encodeURIComponent(previewText)}`
    )

    expect(queryResponse.status()).toBe(200)
    const queryJson = await queryResponse.json()
    const savedTweet = queryJson.data.tweets.find(
      (tweet: { id: string }) => tweet.id === json.data.id
    )

    expect(savedTweet).toBeTruthy()
    expect(savedTweet.metadata?.text).toBe(previewText)
  })

  test('10. 响应式设计 - 移动端视图', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('http://localhost:3000/bookmarks/public')

    // 页面应该正常显示
    await expect(page.locator('h1')).toBeVisible()
  })
})
