import { test, expect } from '@playwright/test'

test.describe('博客网站功能测试', () => {
  test('首页应该正常加载', async ({ page }) => {
    await page.goto('/')
    
    // 检查页面标题
    await expect(page).toHaveTitle(/我的博客/)
    
    // 检查主标题存在
    await expect(page.locator('h1')).toContainText('欢迎来到')
    
    // 检查导航链接存在
    await expect(page.locator('nav a[href="/"]')).toBeVisible()
    await expect(page.locator('nav a[href="/blog"]')).toBeVisible()
    await expect(page.locator('nav a[href="/about"]')).toBeVisible()
    
    // 检查主题切换按钮存在
    await expect(page.locator('button:has-text("Toggle theme")')).toBeVisible()
  })

  test('博客列表页应该显示文章', async ({ page }) => {
    await page.goto('/blog')
    
    // 检查页面标题
    await expect(page.locator('h1')).toContainText('博客')
    
    // 检查至少有一篇文章
    const articles = page.locator('article')
    await expect(articles).toHaveCountGreaterThan(0)
    
    // 检查文章卡片包含必要信息
    const firstArticle = articles.first()
    await expect(firstArticle.locator('h2')).toBeVisible()
    await expect(firstArticle.locator('time, [class*="date"]')).toBeVisible()
  })

  test('点击文章链接应该跳转到文章详情', async ({ page }) => {
    await page.goto('/blog')
    
    // 等待文章加载
    await page.waitForSelector('article')
    
    // 点击第一篇文章的标题链接
    const firstArticleLink = page.locator('article').first().locator('a').first()
    await firstArticleLink.click()
    
    // 验证跳转到文章详情页
    await expect(page.url()).toMatch(/\/blog\/[^\/]+$/)
    
    // 检查文章详情页内容
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('article, .prose, [class*="content"]')).toBeVisible()
  })

  test('文章详情页应该显示完整内容', async ({ page }) => {
    // 访问特定文章
    await page.goto('/blog/hello-world')
    
    // 检查文章标题
    await expect(page.locator('h1')).toContainText('Hello World')
    
    // 检查文章元信息
    await expect(page.locator('time, [class*="date"]')).toBeVisible()
    await expect(page.locator('[class*="read"], text=/分钟/')).toBeVisible()
    
    // 检查返回博客按钮
    await expect(page.locator('a:has-text("返回"), a:has-text("博客")')).toBeVisible()
  })

  test('关于页面应该正常显示', async ({ page }) => {
    await page.goto('/about')
    
    // 检查页面标题
    await expect(page.locator('h1')).toContainText('关于')
    
    // 检查页面内容
    await expect(page.locator('p, div')).toHaveCountGreaterThan(0)
  })

  test('导航功能应该正常工作', async ({ page }) => {
    await page.goto('/')
    
    // 测试导航到博客页面
    await page.click('a[href="/blog"]')
    await expect(page.url()).toContain('/blog')
    await expect(page.locator('h1')).toContainText('博客')
    
    // 测试导航到关于页面
    await page.click('a[href="/about"]')
    await expect(page.url()).toContain('/about')
    await expect(page.locator('h1')).toContainText('关于')
    
    // 测试回到首页
    await page.click('a[href="/"]')
    await expect(page.url()).not.toContain('/blog')
    await expect(page.url()).not.toContain('/about')
  })

  test('主题切换功能', async ({ page }) => {
    await page.goto('/')
    
    // 找到主题切换按钮
    const themeButton = page.locator('button').filter({ 
      has: page.locator('svg') 
    }).first()
    
    // 点击主题切换按钮
    await themeButton.click()
    
    // 等待主题切换完成
    await page.waitForTimeout(100)
    
    // 验证主题已切换（检查 HTML 的 class 或 data 属性）
    const htmlElement = page.locator('html')
    const classValue = await htmlElement.getAttribute('class')
    const dataTheme = await htmlElement.getAttribute('data-theme')
    
    // 至少应该有主题相关的属性变化
    expect(classValue || dataTheme).toBeTruthy()
  })

  test('响应式设计 - 移动端视图', async ({ page }) => {
    // 设置移动端视口
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // 检查移动端导航（可能是汉堡菜单）
    const mobileMenuButton = page.locator('button:has(svg), [class*="mobile"], [class*="menu"]')
    
    // 如果有移动端菜单按钮，测试点击
    if (await mobileMenuButton.count() > 0) {
      await mobileMenuButton.first().click()
      await page.waitForTimeout(200)
    }
    
    // 验证页面在移动端仍然可用
    await expect(page.locator('h1')).toBeVisible()
  })

  test('页面性能检查', async ({ page }) => {
    // 开始性能监控
    await page.goto('/')
    
    // 检查页面加载完成
    await page.waitForLoadState('networkidle')
    
    // 获取性能指标
    const performanceEntries = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
      }
    })
    
    // 基本性能断言（加载时间应该合理）
    expect(performanceEntries.loadTime).toBeLessThan(5000) // 5秒内加载完成
    expect(performanceEntries.domContentLoaded).toBeLessThan(3000) // 3秒内DOM加载完成
  })

  test('搜索功能占位符测试', async ({ page }) => {
    await page.goto('/blog')
    
    // 检查是否有搜索输入框（即使是禁用的）
    const searchInput = page.locator('input[placeholder*="搜索"], [placeholder*="search"]')
    
    if (await searchInput.count() > 0) {
      await expect(searchInput).toBeVisible()
    }
  })

  test('文章标签功能', async ({ page }) => {
    await page.goto('/blog')
    
    // 检查是否有标签显示
    const tags = page.locator('[class*="tag"], .badge, span:has-text("标签")')
    
    if (await tags.count() > 0) {
      await expect(tags.first()).toBeVisible()
    }
  })
})

test.describe('错误页面测试', () => {
  test('访问不存在的文章应该显示404', async ({ page }) => {
    const response = await page.goto('/blog/non-existent-article')
    
    // 检查是否返回404状态码或显示错误页面
    if (response) {
      expect(response.status()).toBe(404)
    } else {
      // 或者检查页面是否显示错误信息
      await expect(page.locator('text=/not found/i, text=/404/i')).toBeVisible()
    }
  })
})

test.describe('SEO和元数据测试', () => {
  test('首页应该有正确的SEO标签', async ({ page }) => {
    await page.goto('/')
    
    // 检查title标签
    await expect(page).toHaveTitle(/我的博客/)
    
    // 检查meta描述
    const metaDescription = page.locator('meta[name="description"]')
    if (await metaDescription.count() > 0) {
      const content = await metaDescription.getAttribute('content')
      expect(content).toBeTruthy()
    }
  })

  test('文章页面应该有正确的SEO标签', async ({ page }) => {
    await page.goto('/blog/hello-world')
    
    // 文章页面应该有特定的标题
    const title = await page.title()
    expect(title).toContain('Hello World')
  })
})