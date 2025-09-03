import { test, expect } from '@playwright/test'

test.describe('PWA Installation', () => {
  test('should show PWA install prompt and handle installation', async ({
    page,
    context,
  }) => {
    // 设置用户代理为支持PWA的Chrome
    await context.setExtraHTTPHeaders({
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    })

    // 监听控制台日志
    const consoleLogs: string[] = []
    page.on('console', msg => {
      consoleLogs.push(`${msg.type()}: ${msg.text()}`)
    })

    // 模拟beforeinstallprompt事件
    await page.goto('http://localhost:3002')

    // 等待页面完全加载
    await page.waitForLoadState('networkidle')

    // 等待Service Worker注册
    await page.waitForFunction(() => {
      return 'serviceWorker' in navigator
    })

    // 手动触发beforeinstallprompt事件来模拟PWA安装条件
    await page.evaluate(() => {
      // 创建模拟的beforeinstallprompt事件
      const mockPromptEvent = {
        preventDefault: () => {},
        prompt: async () => {
          console.log('Mock prompt() called')
          return Promise.resolve()
        },
        userChoice: Promise.resolve({ outcome: 'accepted' as const }),
      }

      // 触发事件
      const event = new Event('beforeinstallprompt') as any
      event.preventDefault = mockPromptEvent.preventDefault
      event.prompt = mockPromptEvent.prompt
      event.userChoice = mockPromptEvent.userChoice

      window.dispatchEvent(event)
    })

    // 等待一下让事件处理
    await page.waitForTimeout(1000)

    // 检查是否显示了PWA安装提示
    const installPrompt = page.locator('text=安装博客应用')
    console.log('查找安装提示...')

    if (await installPrompt.isVisible()) {
      console.log('找到安装提示!')

      // 检查安装按钮是否存在
      const installButton = page.locator('button:has-text("安装")')
      await expect(installButton).toBeVisible()

      console.log('点击安装按钮...')
      await installButton.click()

      // 等待一下处理
      await page.waitForTimeout(2000)

      // 检查控制台日志
      console.log('控制台日志:', consoleLogs)
    } else {
      console.log('没有找到安装提示，可能需要满足PWA安装条件')

      // 检查manifest文件是否存在
      const manifestResponse = await page.goto(
        'http://localhost:3002/site.webmanifest'
      )
      expect(manifestResponse?.status()).toBe(200)

      // 检查service worker是否注册
      const swResponse = await page.goto('http://localhost:3002/sw.js')
      expect(swResponse?.status()).toBe(200)

      // 回到主页
      await page.goto('http://localhost:3002')

      // 检查页面是否有PWA相关的meta标签
      const manifestLink = page.locator('link[rel="manifest"]')
      await expect(manifestLink).toHaveCount(1)

      const themeColor = page.locator('meta[name="theme-color"]')
      await expect(themeColor).toHaveCount(2) // light and dark theme
    }

    // 输出所有控制台日志以便调试
    console.log('=== 控制台日志汇总 ===')
    consoleLogs.forEach(log => console.log(log))
  })

  test('should check PWA manifest and service worker', async ({ page }) => {
    // 检查manifest文件
    const manifestResponse = await page.goto(
      'http://localhost:3002/site.webmanifest'
    )
    expect(manifestResponse?.status()).toBe(200)

    const manifestContent = await manifestResponse?.json()
    expect(manifestContent.name).toBe('我的博客')
    expect(manifestContent.short_name).toBe('博客')
    expect(manifestContent.display).toBe('standalone')

    // 检查Service Worker
    const swResponse = await page.goto('http://localhost:3002/sw.js')
    expect(swResponse?.status()).toBe(200)

    const swContent = await swResponse?.text()
    expect(swContent).toContain('Service Worker')
    expect(swContent).toContain('CACHE_NAME')

    console.log('✅ PWA基础文件检查通过')
  })

  test('should test PWA installation flow in homepage', async ({ page }) => {
    await page.goto('http://localhost:3002')

    // 监听控制台
    const logs: string[] = []
    page.on('console', msg => logs.push(`${msg.type()}: ${msg.text()}`))

    // 等待页面加载
    await page.waitForLoadState('networkidle')

    // 检查是否有PWA安装提示相关的元素
    const pwaElements = await page
      .locator('[class*="pwa"], [class*="install"], text=安装')
      .all()

    if (pwaElements.length > 0) {
      console.log(`找到 ${pwaElements.length} 个PWA相关元素`)
      for (const element of pwaElements) {
        const text = await element.textContent()
        const className = await element.getAttribute('class')
        console.log(`元素: "${text}", 类名: "${className}"`)
      }
    }

    // 检查页面HTML中是否包含PWA相关代码
    const pageContent = await page.content()
    const hasPWACode =
      pageContent.includes('PWAInstallPrompt') ||
      pageContent.includes('安装博客应用') ||
      pageContent.includes('OfflineIndicator')

    console.log('页面包含PWA组件:', hasPWACode)

    // 输出控制台日志
    console.log('控制台日志:')
    logs.forEach(log => console.log('  ', log))
  })
})
