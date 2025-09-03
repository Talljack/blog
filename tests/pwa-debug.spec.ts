import { test, expect } from '@playwright/test'

test.describe('PWA Debug', () => {
  test('should check basic PWA setup', async ({ page }) => {
    console.log('🔍 开始PWA调试测试...')

    // 监听控制台日志
    const logs: string[] = []
    page.on('console', msg => {
      const text = `[${msg.type()}] ${msg.text()}`
      logs.push(text)
      console.log('📋', text)
    })

    // 监听网络请求
    page.on('response', response => {
      if (
        response.url().includes('sw.js') ||
        response.url().includes('manifest')
      ) {
        console.log(`🌐 ${response.status()} ${response.url()}`)
      }
    })

    console.log('📄 访问首页...')
    await page.goto('http://localhost:3002')

    // 等待页面加载完成
    await page.waitForLoadState('networkidle')
    console.log('✅ 页面加载完成')

    // 1. 检查manifest链接
    console.log('🔍 检查manifest链接...')
    const manifestLink = await page.locator('link[rel="manifest"]').count()
    console.log(`📋 Manifest链接数量: ${manifestLink}`)

    if (manifestLink > 0) {
      const manifestHref = await page
        .locator('link[rel="manifest"]')
        .getAttribute('href')
      console.log(`📋 Manifest路径: ${manifestHref}`)
    }

    // 2. 检查Service Worker注册
    console.log('🔍 检查Service Worker...')
    const hasServiceWorker = await page.evaluate(() => {
      return 'serviceWorker' in navigator
    })
    console.log(`🔧 浏览器支持Service Worker: ${hasServiceWorker}`)

    if (hasServiceWorker) {
      try {
        const swStatus = await page.evaluate(async () => {
          try {
            const registration =
              await navigator.serviceWorker.register('/sw.js')
            return {
              registered: true,
              scope: registration.scope,
              state: registration.installing
                ? 'installing'
                : registration.waiting
                  ? 'waiting'
                  : registration.active
                    ? 'active'
                    : 'unknown',
            }
          } catch (error) {
            return { registered: false, error: (error as Error).message }
          }
        })
        console.log('🔧 Service Worker状态:', JSON.stringify(swStatus, null, 2))
      } catch (error) {
        console.log('❌ Service Worker检查失败:', error)
      }
    }

    // 3. 手动触发beforeinstallprompt事件
    console.log('🔍 测试PWA安装提示...')
    await page.evaluate(() => {
      // 创建模拟事件
      const event = new CustomEvent('beforeinstallprompt', {
        detail: {
          preventDefault: () => console.log('preventDefault called'),
          prompt: async () => {
            console.log('prompt() 被调用')
            return Promise.resolve()
          },
          userChoice: Promise.resolve({ outcome: 'accepted' }),
        },
      }) as any

      event.preventDefault = () => console.log('preventDefault called')
      event.prompt = async () => {
        console.log('prompt() 被调用')
        return Promise.resolve()
      }
      event.userChoice = Promise.resolve({ outcome: 'accepted' })

      console.log('触发 beforeinstallprompt 事件')
      window.dispatchEvent(event)
    })

    // 等待事件处理
    await page.waitForTimeout(2000)

    // 4. 检查是否出现了安装提示
    console.log('🔍 查找PWA安装提示...')

    // 尝试多种方式查找安装提示
    const installPromptSelectors = [
      'text=安装博客应用',
      'text=安装',
      'button:has-text("安装")',
      '[data-testid="pwa-install"]',
      '.pwa-install',
    ]

    let found = false
    for (const selector of installPromptSelectors) {
      try {
        const element = page.locator(selector)
        const count = await element.count()
        if (count > 0) {
          console.log(`✅ 找到安装提示: ${selector} (${count}个)`)

          // 尝试获取元素信息
          const isVisible = await element.first().isVisible()
          console.log(`👁️ 可见性: ${isVisible}`)

          if (isVisible) {
            const text = await element.first().textContent()
            console.log(`📝 文本内容: "${text}"`)
            found = true
          }
        }
      } catch (error) {
        // 忽略查找错误，继续下一个选择器
      }
    }

    if (!found) {
      console.log('❌ 未找到PWA安装提示')

      // 打印页面HTML结构以便调试
      const bodyHTML = await page.locator('body').innerHTML()
      console.log('📄 页面HTML结构预览:')
      console.log(bodyHTML.substring(0, 1000) + '...')
    }

    // 5. 检查PWA相关的React组件是否加载
    console.log('🔍 检查React组件...')
    const hasReactComponents = await page.evaluate(() => {
      const body = document.body.innerHTML
      return {
        hasPWAInstall: body.includes('安装博客应用') || body.includes('PWA'),
        hasOfflineIndicator: body.includes('离线') || body.includes('网络'),
        hasServiceWorkerCode:
          body.includes('serviceWorker') || body.includes('sw.js'),
      }
    })
    console.log(
      '⚛️ React组件检查:',
      JSON.stringify(hasReactComponents, null, 2)
    )

    // 输出所有控制台日志汇总
    console.log('\n=== 控制台日志汇总 ===')
    logs.forEach(log => console.log(log))

    console.log('\n🏁 PWA调试测试完成')
  })

  test('should check manifest and SW files directly', async ({ page }) => {
    console.log('🔍 直接检查PWA文件...')

    // 检查manifest文件
    const manifestResp = await page.request.get(
      'http://localhost:3002/site.webmanifest'
    )
    console.log(`📋 Manifest状态: ${manifestResp.status()}`)

    if (manifestResp.ok()) {
      const manifest = await manifestResp.json()
      console.log('📋 Manifest内容:', JSON.stringify(manifest, null, 2))
    }

    // 检查Service Worker文件
    const swResp = await page.request.get('http://localhost:3002/sw.js')
    console.log(`🔧 Service Worker状态: ${swResp.status()}`)

    if (swResp.ok()) {
      const swContent = await swResp.text()
      console.log(`🔧 Service Worker大小: ${swContent.length} 字符`)
      console.log(`🔧 包含CACHE_NAME: ${swContent.includes('CACHE_NAME')}`)
    }
  })
})
