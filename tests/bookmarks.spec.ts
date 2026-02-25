import { test, expect } from '@playwright/test'

test.describe('X 推文收藏功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000')
  })

  test('1. 主页导航包含收藏链接', async ({ page }) => {
    const bookmarksLink = page.locator('nav a:has-text("收藏")')
    await expect(bookmarksLink).toBeVisible()
    await expect(bookmarksLink).toHaveAttribute('href', '/bookmarks')
  })

  test('2. 访问公开收藏页面', async ({ page }) => {
    await page.goto('http://localhost:3000/bookmarks/public')
    await expect(page).toHaveURL(/.*bookmarks\/public/)
    await expect(page.locator('h1')).toContainText('公开推文收藏')
  })

  test('3. 访问保存推文页面', async ({ page }) => {
    await page.goto('http://localhost:3000/bookmarks/save')
    await expect(page).toHaveURL(/.*bookmarks\/save/)
    await expect(page.locator('h1')).toContainText('保存推文')
    
    // 检查 Bookmarklet 说明
    const bookmarkletSection = page.locator('text=快速保存书签')
    await expect(bookmarkletSection).toBeVisible()
  })

  test('4. 保存推文表单验证', async ({ page }) => {
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
    
    // 检查搜索框
    const searchInput = page.locator('input[placeholder*="搜索"]')
    await expect(searchInput).toBeVisible()
  })

  test('7. API - 获取公开推文', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/bookmarks?public=true')
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    expect(data).toHaveProperty('tweets')
    expect(data).toHaveProperty('total')
    expect(data).toHaveProperty('page')
    expect(data).toHaveProperty('limit')
  })

  test('8. API - 保存推文需要认证', async ({ request }) => {
    const response = await request.post('http://localhost:3000/api/bookmarks', {
      data: {
        url: 'https://x.com/test/status/123',
        tags: ['test'],
        notes: 'Test note',
        isPublic: false
      }
    })
    expect(response.status()).toBe(401)
  })

  test('9. API - 使用认证保存推文', async ({ request }) => {
    const response = await request.post(
      'http://localhost:3000/api/bookmarks?username=admin&password=zz1234zz',
      {
        data: {
          url: 'https://x.com/elonmusk/status/1234567890',
          tags: ['tech', 'ai'],
          notes: 'Playwright 测试推文',
          isPublic: true
        }
      }
    )
    
    expect(response.status()).toBe(201)
    const data = await response.json()
    expect(data).toHaveProperty('id')
    expect(data).toHaveProperty('url')
    expect(data.tags).toContain('tech')
    expect(data.tags).toContain('ai')
  })

  test('10. 响应式设计 - 移动端视图', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('http://localhost:3000/bookmarks/public')
    
    // 页面应该正常显示
    await expect(page.locator('h1')).toBeVisible()
  })
})
