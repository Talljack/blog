import { test, expect } from '@playwright/test'

test('PWA 安装提示等待测试', async ({ page }) => {
  console.log('🚀 开始PWA安装提示等待测试...')

  // 访问首页
  await page.goto('/')

  console.log('✅ 页面加载成功')

  // 等待更长时间让组件初始化
  await page.waitForTimeout(6000) // 等待6秒，超过组件的5秒延迟

  console.log('⏰ 等待6秒完成')

  // 检查页面内容
  const title = await page.title()
  console.log('📄 页面标题:', title)

  // 查找所有可能的安装提示相关元素
  const installButtons = await page.locator('button:has-text("安装")').count()
  const installPrompts = await page.locator('[class*="install"]').count()
  const pwaElements = await page.locator('[class*="pwa"]').count()

  console.log('📱 找到"安装"按钮数量:', installButtons)
  console.log('🔍 找到包含"install"的元素数量:', installPrompts)
  console.log('🔍 找到包含"pwa"的元素数量:', pwaElements)

  // 检查console日志
  const consoleLogs: string[] = []
  page.on('console', msg => {
    if (
      msg.type() === 'info' ||
      msg.type() === 'log' ||
      msg.type() === 'warning'
    ) {
      consoleLogs.push(`${msg.type()}: ${msg.text()}`)
    }
  })

  // 刷新页面并重新等待，收集日志
  await page.reload()
  await page.waitForTimeout(6000)

  console.log('📋 收集到的控制台日志:')
  consoleLogs.forEach(log => console.log('  ' + log))

  // 再次检查安装按钮
  const finalInstallButtons = await page
    .locator('button:has-text("安装")')
    .count()
  console.log('📱 最终找到"安装"按钮数量:', finalInstallButtons)

  // 查找所有固定定位的元素（PWA提示通常是固定定位）
  const fixedElements = await page.locator('[style*="fixed"], .fixed').count()
  console.log('📌 找到固定定位元素数量:', fixedElements)

  // 截图保存当前状态
  await page.screenshot({
    path: 'test-results/pwa-install-wait-screenshot.png',
    fullPage: true,
  })
  console.log('📸 截图已保存到: test-results/pwa-install-wait-screenshot.png')

  console.log('🏁 PWA安装提示等待测试完成!')
})
