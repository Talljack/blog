import { test, expect } from '@playwright/test'

test('PWA 安装提示快速测试', async ({ page }) => {
  console.log('🚀 开始PWA快速测试...')

  // 访问首页
  await page.goto('http://localhost:3002')
  await page.waitForLoadState('networkidle')

  console.log('✅ 页面加载成功')

  // 检查基本的PWA元素是否存在
  const hasManifestLink = await page.locator('link[rel="manifest"]').count()
  console.log(`📋 Manifest链接数量: ${hasManifestLink}`)

  // 检查页面内容
  const pageTitle = await page.title()
  console.log(`📄 页面标题: ${pageTitle}`)

  // 检查是否有PWA相关的React组件渲染
  const bodyText = await page.locator('body').textContent()
  const hasBlogContent =
    bodyText?.includes('博客') || bodyText?.includes('文章')
  console.log(`📝 页面包含博客内容: ${hasBlogContent}`)

  // 检查PWA安装提示是否存在（可能在某些条件下显示）
  const installPrompts = await page.locator('text=安装').count()
  console.log(`📱 找到安装提示数量: ${installPrompts}`)

  if (installPrompts > 0) {
    console.log('🎉 找到PWA安装提示!')
    const installButton = page.locator('button:has-text("安装")').first()

    if (await installButton.isVisible()) {
      console.log('👁️ 安装按钮可见，尝试点击...')

      // 监听控制台日志
      const logs: string[] = []
      page.on('console', msg => logs.push(`${msg.type()}: ${msg.text()}`))

      await installButton.click()
      await page.waitForTimeout(1000)

      console.log('📋 点击后的控制台日志:')
      logs.forEach(log => console.log(`  ${log}`))
    }
  }

  // 测试Service Worker注册
  const swRegistered = await page.evaluate(async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js')
        return { success: true, scope: registration.scope }
      } catch (error) {
        return { success: false, error: (error as Error).message }
      }
    }
    return { success: false, error: 'Service Worker not supported' }
  })

  console.log(
    '🔧 Service Worker注册结果:',
    JSON.stringify(swRegistered, null, 2)
  )

  console.log('🏁 PWA快速测试完成!')
})
