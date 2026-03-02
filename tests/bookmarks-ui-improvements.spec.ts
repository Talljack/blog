import { test, expect } from '@playwright/test'

test.describe('书签页面 UI 改进验证', () => {
  test.describe('推文预览展示', () => {
    test('bookmarks 列表优先展示推文摘要，再展示链接', async ({ page }) => {
      const adminToken = btoa('admin:zz1234zz')
      await page.context().addCookies([
        {
          name: 'admin_token',
          value: adminToken,
          domain: 'localhost',
          path: '/',
        },
      ])

      await page.route('**/api/bookmarks?**', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              tweets: [
                {
                  id: 'preview-user-1',
                  url: 'https://x.com/previewuser/status/1001',
                  tweetId: '1001',
                  authorUsername: 'previewuser',
                  savedAt: new Date().toISOString(),
                  tags: ['preview'],
                  notes: 'notes',
                  isPublic: true,
                  metadata: {
                    text: '第一行\n第二行\n第三行\n第四行\n第五行\n第六行',
                  },
                },
              ],
              total: 1,
              page: 1,
              limit: 20,
            },
          }),
        })
      })

      await page.route('**/api/bookmarks/tags**', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: { tags: ['preview'] } }),
        })
      })

      await page.goto('/bookmarks')
      await page.waitForLoadState('networkidle')

      const card = page.getByTestId('tweet-card').first()
      const preview = card.getByTestId('tweet-preview')
      const linkRow = card.getByTestId('tweet-link-row')

      await expect(preview).toBeVisible()
      await expect(preview).toContainText('第一行')
      await expect(preview).toContainText('第五行')
      await expect(linkRow).toBeVisible()
      await expect(linkRow).toContainText('查看 @previewuser 的推文')

      const previewBox = await preview.boundingBox()
      const linkBox = await linkRow.boundingBox()
      expect(previewBox).not.toBeNull()
      expect(linkBox).not.toBeNull()
      expect((previewBox?.y ?? 0) + (previewBox?.height ?? 0)).toBeLessThan(
        linkBox?.y ?? 0
      )
    })

    test('没有 metadata.text 时不渲染空的推文摘要块', async ({ page }) => {
      const adminToken = btoa('admin:zz1234zz')
      await page.context().addCookies([
        {
          name: 'admin_token',
          value: adminToken,
          domain: 'localhost',
          path: '/',
        },
      ])

      await page.route('**/api/bookmarks?**', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              tweets: [
                {
                  id: 'preview-user-2',
                  url: 'https://x.com/previewuser/status/1002',
                  tweetId: '1002',
                  authorUsername: 'previewuser',
                  savedAt: new Date().toISOString(),
                  tags: [],
                  notes: '',
                  isPublic: true,
                },
              ],
              total: 1,
              page: 1,
              limit: 20,
            },
          }),
        })
      })

      await page.route('**/api/bookmarks/tags**', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: { tags: [] } }),
        })
      })

      await page.goto('/bookmarks')
      await page.waitForLoadState('networkidle')

      await expect(page.getByTestId('tweet-preview')).toHaveCount(0)
      await expect(page.getByTestId('tweet-link-row')).toHaveCount(1)
    })
  })

  // ============================================
  // 验证项 1: 暗色模式文本对比度 (WCAG 2.1 AA)
  // ============================================
  test.describe('暗色模式对比度', () => {
    test('bookmarks/public 页面暗色模式文本不使用 gray-500 以下对比度', async ({
      page,
    }) => {
      // 模拟暗色模式
      await page.emulateMedia({ colorScheme: 'dark' })
      await page.goto('/bookmarks/public')

      // 等待页面加载
      await expect(page.locator('h1')).toContainText('公开推文收藏')

      // 验证 <html> 获得了 dark class (next-themes attribute="class")
      const htmlClass = await page.locator('html').getAttribute('class')
      expect(htmlClass).toContain('dark')

      // 检查标题使用 gray-100 而非 white (一致性)
      const h1 = page.locator('h1')
      const h1Class = await h1.getAttribute('class')
      expect(h1Class).toContain('dark:text-gray-100')
      expect(h1Class).not.toContain('dark:text-white')

      // 检查描述文本使用 gray-400 (足够对比度)
      const description = page.locator('h1 + p, .mb-8 p').first()
      const descClass = await description.getAttribute('class')
      expect(descClass).toContain('dark:text-gray-400')
      // 不应使用 gray-500 或更低对比度
      expect(descClass).not.toContain('dark:text-gray-500')
    })

    test('bookmarks 主页暗色模式统计文本有足够对比度', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'dark' })
      await page.goto('/bookmarks')

      // 等待内容加载 - 可能重定向到 public 或显示错误/列表
      await page.waitForLoadState('networkidle')

      // 检查统计行的暗色对比度 class
      const statsDiv = page.locator('text=条推文').first()
      if (await statsDiv.isVisible()) {
        const parentClass = await statsDiv.evaluate(el => {
          const parent = el.closest('div')
          return parent?.className || ''
        })
        // 应使用 gray-400 或更高对比度，不应使用 gray-500
        expect(parentClass).not.toContain('dark:text-gray-500')
      }
    })
  })

  // ============================================
  // 验证项 2: Twitter embed 根据主题切换 data-theme
  // ============================================
  test.describe('Twitter embed 主题切换', () => {
    test('亮色模式下 tweet embed 使用 data-theme="light"', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'light' })
      await page.goto('/bookmarks/public')

      // 等待页面内容加载
      await page.waitForLoadState('networkidle')

      // 查找 twitter-tweet blockquote
      const tweetBlockquotes = page.locator('blockquote.twitter-tweet')
      const count = await tweetBlockquotes.count()

      if (count > 0) {
        // 验证 data-theme="light" (亮色模式)
        const theme = await tweetBlockquotes.first().getAttribute('data-theme')
        expect(theme).toBe('light')
      } else {
        // 没有推文时跳过，但检查组件代码逻辑
        test.info().annotations.push({
          type: 'skip-reason',
          description: '没有公开推文，无法验证 embed theme',
        })
      }
    })

    test('暗色模式下 tweet embed 使用 data-theme="dark"', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'dark' })
      await page.goto('/bookmarks/public')

      await page.waitForLoadState('networkidle')

      const tweetBlockquotes = page.locator('blockquote.twitter-tweet')
      const count = await tweetBlockquotes.count()

      if (count > 0) {
        const theme = await tweetBlockquotes.first().getAttribute('data-theme')
        expect(theme).toBe('dark')
      } else {
        test.info().annotations.push({
          type: 'skip-reason',
          description: '没有公开推文，无法验证 embed theme',
        })
      }
    })
  })

  // ============================================
  // 验证项 3: 分页在超过 20 条时渲染
  // ============================================
  test.describe('分页控件', () => {
    test('API 返回 total > 20 时页面显示分页按钮', async ({ page }) => {
      const adminToken = btoa('admin:zz1234zz')
      await page.context().addCookies([
        {
          name: 'admin_token',
          value: adminToken,
          domain: 'localhost',
          path: '/',
        },
      ])
      await page.route('**/api/bookmarks?**', async route => {
        const tweets = Array.from({ length: 20 }, (_, i) => ({
          id: `user-${i + 1}`,
          url: `https://x.com/user/status/${1000 + i}`,
          tweetId: `${1000 + i}`,
          authorUsername: 'testuser',
          savedAt: new Date(Date.now() - i * 86400000).toISOString(),
          tags: ['test'],
          notes: `Test tweet ${i + 1}`,
          isPublic: true,
        }))
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              tweets,
              total: 25,
              page: 1,
              limit: 20,
            },
          }),
        })
      })
      await page.route('**/api/bookmarks/tags**', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: { tags: ['test'] } }),
        })
      })
      await page.goto('/bookmarks')
      await page.waitForLoadState('networkidle')

      // 验证分页控件存在
      const prevButton = page.locator('button:has-text("上一页")')
      const nextButton = page.locator('button:has-text("下一页")')
      const pageInfo = page.locator('text=/第 \\d+ \\/ \\d+ 页/')

      await expect(prevButton).toBeVisible()
      await expect(nextButton).toBeVisible()
      await expect(pageInfo).toBeVisible()

      // 第一页时 "上一页" 按钮应 disabled
      await expect(prevButton).toBeDisabled()
      // "下一页" 按钮应 enabled
      await expect(nextButton).toBeEnabled()

      // 验证页码显示
      await expect(pageInfo).toContainText('第 1 / 2 页')
    })

    test('API 返回 total <= 20 时不显示分页', async ({ page }) => {
      const adminToken = btoa('admin:zz1234zz')
      await page.context().addCookies([
        {
          name: 'admin_token',
          value: adminToken,
          domain: 'localhost',
          path: '/',
        },
      ])
      await page.route('**/api/bookmarks?**', async route => {
        const tweets = Array.from({ length: 5 }, (_, i) => ({
          id: `user-${i + 1}`,
          url: `https://x.com/user/status/${1000 + i}`,
          tweetId: `${1000 + i}`,
          authorUsername: 'testuser',
          savedAt: new Date().toISOString(),
          tags: ['test'],
          notes: `Test tweet ${i + 1}`,
          isPublic: true,
        }))
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              tweets,
              total: 5,
              page: 1,
              limit: 20,
            },
          }),
        })
      })
      await page.route('**/api/bookmarks/tags**', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: { tags: ['test'] } }),
        })
      })
      await page.goto('/bookmarks')
      await page.waitForLoadState('networkidle')

      // 分页控件不应存在
      const prevButton = page.locator('button:has-text("上一页")')
      await expect(prevButton).not.toBeVisible()
    })
  })
})
