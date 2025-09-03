import { test, expect } from '@playwright/test'

test('PWA 安装按钮点击测试', async ({ page }) => {
  console.log('🚀 开始PWA安装按钮点击测试...')

  // 访问首页
  await page.goto('/')

  console.log('✅ 页面加载成功')

  // 等待安装提示显示
  await page.waitForTimeout(6000)
  console.log('⏰ 等待安装提示显示')

  // 查找安装按钮
  const installButton = page.locator('button:has-text("安装")')
  const installButtonCount = await installButton.count()
  console.log('📱 找到安装按钮数量:', installButtonCount)

  if (installButtonCount > 0) {
    console.log('🎯 找到安装按钮，准备点击...')

    // 等待按钮可见并可点击
    await installButton.first().waitFor({ state: 'visible' })
    console.log('👀 安装按钮可见')

    // 设置对话框监听器（开发环境会显示alert）
    let dialogMessage = ''
    page.on('dialog', async dialog => {
      console.log('💬 检测到对话框:', dialog.type(), dialog.message())
      dialogMessage = dialog.message()
      await dialog.accept()
    })

    // 设置console日志监听器
    const clickLogs: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'warning' || msg.type() === 'info') {
        clickLogs.push(`${msg.type()}: ${msg.text()}`)
      }
    })

    // 点击安装按钮
    await installButton.first().click()
    console.log('🖱️ 已点击安装按钮')

    // 等待一下让相关事件处理完成
    await page.waitForTimeout(2000)

    // 输出相关日志
    console.log('📋 点击后的日志:')
    clickLogs.forEach(log => console.log('  ' + log))

    if (dialogMessage) {
      console.log('💬 对话框内容:', dialogMessage)
      console.log('✅ 安装按钮点击响应正常（显示了开发环境提示）')
    }

    // 检查按钮是否还存在（应该在开发环境被隐藏）
    const remainingButtons = await page
      .locator('button:has-text("安装")')
      .count()
    console.log('📱 点击后剩余安装按钮数量:', remainingButtons)

    // 截图保存点击后状态
    await page.screenshot({
      path: 'test-results/pwa-install-after-click.png',
      fullPage: true,
    })
    console.log('📸 点击后截图已保存')
  } else {
    console.log('❌ 未找到安装按钮')
  }

  console.log('🏁 PWA安装按钮点击测试完成!')
})
