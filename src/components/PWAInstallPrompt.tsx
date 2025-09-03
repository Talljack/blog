'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Download, Smartphone } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [promptUsed, setPromptUsed] = useState(false) // 跟踪prompt是否已被使用

  // 使用useCallback来稳定事件处理函数
  const handleBeforeInstallPrompt = useCallback(
    (e: BeforeInstallPromptEvent) => {
      console.info('✅ 接收到 beforeinstallprompt 事件', e)
      // 阻止自动显示安装提示
      e.preventDefault()
      console.info('✅ 已调用 preventDefault()，保存延迟提示事件')
      setDeferredPrompt(e)
      setPromptUsed(false) // 重置使用状态

      // 检查是否已经显示过安装提示
      const hasShownPrompt = localStorage.getItem('pwa-install-dismissed')
      console.info('📋 检查本地存储:', {
        hasShownPrompt,
        isInstalled,
        promptUsed,
      })

      if (!hasShownPrompt && !isInstalled) {
        console.info('🎯 显示安装横幅')
        setShowInstallBanner(true)
      } else {
        console.info('❌ 不显示安装横幅 - 已显示过或已安装')
      }
    },
    [isInstalled, promptUsed]
  )

  const handleAppInstalled = useCallback(() => {
    console.info('应用已安装')
    setIsInstalled(true)
    setShowInstallBanner(false)
    setDeferredPrompt(null)
    localStorage.removeItem('pwa-install-dismissed')
  }, [])

  const handleDisplayModeChange = useCallback((e: MediaQueryListEvent) => {
    console.info('显示模式改变:', e.matches)
    setIsInstalled(e.matches)
  }, [])

  useEffect(() => {
    // 检查是否已经安装
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia(
        '(display-mode: standalone)'
      ).matches
      const isInWebAppChrome =
        (window.navigator as unknown as { standalone?: boolean }).standalone ===
        true
      const installed = isStandalone || isInWebAppChrome
      console.info('PWA安装状态检查:', {
        isStandalone,
        isInWebAppChrome,
        installed,
      })
      setIsInstalled(installed)
    }

    checkIfInstalled()

    // 开发环境调试：如果没有安装提示事件，延迟显示测试按钮
    const isDev = process.env.NODE_ENV === 'development'
    if (isDev) {
      console.info('开发环境：等待 beforeinstallprompt 事件...')
      const timer = setTimeout(() => {
        console.info(
          '开发环境：5秒后未收到 beforeinstallprompt 事件，显示测试安装提示'
        )
        const hasShownPrompt = localStorage.getItem('pwa-install-dismissed')
        if (!hasShownPrompt) {
          setShowInstallBanner(true)
        }
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    window.addEventListener(
      'beforeinstallprompt',
      handleBeforeInstallPrompt as EventListener
    )
    window.addEventListener('appinstalled', handleAppInstalled)

    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    mediaQuery.addListener(handleDisplayModeChange)

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt as EventListener
      )
      window.removeEventListener('appinstalled', handleAppInstalled)
      mediaQuery.removeListener(handleDisplayModeChange)
    }
  }, [handleBeforeInstallPrompt, handleAppInstalled, handleDisplayModeChange])

  const handleInstallClick = async () => {
    console.info('🔥 handleInstallClick 函数被调用!')
    console.info('🖱️ 用户点击安装按钮')
    console.info('🔍 检查状态:', {
      hasDeferredPrompt: !!deferredPrompt,
      promptUsed,
      isInstalled,
    })

    if (!deferredPrompt) {
      console.warn('❌ 没有可用的安装提示事件')

      // 开发环境提供备用方案
      if (process.env.NODE_ENV === 'development') {
        alert(
          '开发环境：正常的安装提示需要HTTPS环境。\n\n请在生产环境中测试PWA安装功能，或者：\n1. 在Chrome DevTools中启用"Application > Manifest"，点击"安装"\n2. 手动在浏览器地址栏安装PWA'
        )
        setShowInstallBanner(false)
      } else {
        // 生产环境给出更有用的提示
        alert('安装提示不可用。请刷新页面重试。')
      }
      return
    }

    console.info('✅ deferredPrompt 存在，继续执行...')

    if (promptUsed) {
      console.warn('❌ 安装提示已被使用过，需要刷新页面')
      alert('安装提示已失效，请刷新页面后重试。')
      return
    }

    console.info('✅ promptUsed 为 false，继续执行...')

    try {
      console.info('🚀 开始调用 deferredPrompt.prompt()...')
      console.info('📝 deferredPrompt 对象详情:', deferredPrompt)

      setPromptUsed(true) // 标记为已使用
      console.info('✅ 已标记 promptUsed 为 true')

      // 调用安装提示，添加超时处理
      console.info('📞 即将调用 deferredPrompt.prompt()...')

      // 创建超时Promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('PWA安装提示超时 (5秒)')), 5000)
      })

      // 使用Promise.race确保不会无限等待
      const promptResult = await Promise.race([
        deferredPrompt.prompt(),
        timeoutPromise,
      ])

      console.info('✅ prompt() 调用成功，返回结果:', promptResult)

      // 等待用户响应，也添加超时
      console.info('⏳ 等待用户选择...')

      const userChoiceTimeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('等待用户选择超时 (10秒)')), 10000)
      })

      const choiceResult = (await Promise.race([
        deferredPrompt.userChoice,
        userChoiceTimeoutPromise,
      ])) as { outcome: 'accepted' | 'dismissed' }

      console.info('📊 用户选择结果:', choiceResult.outcome)

      if (choiceResult.outcome === 'accepted') {
        console.info('✅ 用户接受了安装提示')
        // 安装成功，隐藏横幅
        setShowInstallBanner(false)
        setIsInstalled(true)
      } else {
        console.info('❌ 用户拒绝了安装提示')
        // 用户拒绝，也隐藏横幅并记录
        setShowInstallBanner(false)
        localStorage.setItem('pwa-install-dismissed', Date.now().toString())
      }

      // 清理状态
      console.info('🧹 清理安装提示状态')
      setDeferredPrompt(null)
    } catch (error) {
      console.error('💥 安装提示失败:', error)
      console.error('💥 错误类型:', typeof error)
      console.error('💥 错误详情:', JSON.stringify(error, null, 2))
      console.error(
        '💥 错误堆栈:',
        error instanceof Error ? error.stack : '无堆栈信息'
      )

      setPromptUsed(false) // 失败时重置状态，允许重试

      // 显示错误给用户
      const errorMessage = error instanceof Error ? error.message : '未知错误'

      // 针对不同错误类型给出不同的解决方案
      if (errorMessage.includes('超时')) {
        // 超时错误：提供备用安装方法
        const userAgent = navigator.userAgent.toLowerCase()
        let installInstructions = ''

        if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
          installInstructions = `Chrome浏览器安装方法：
1. 点击地址栏右侧的"安装"图标 ⊕
2. 或者点击浏览器菜单 ⋮ → "安装博客应用"
3. 或者按 Ctrl+Shift+A 打开应用菜单`
        } else if (userAgent.includes('edg')) {
          installInstructions = `Edge浏览器安装方法：
1. 点击地址栏右侧的"安装应用"图标
2. 或者点击浏览器菜单 ⋯ → "应用" → "安装此站点作为应用"`
        } else if (userAgent.includes('firefox')) {
          installInstructions = `Firefox目前不完全支持PWA安装，建议：
1. 使用Chrome或Edge浏览器获得最佳体验
2. 或者将此页面添加到书签以便快速访问`
        } else {
          installInstructions = `通用安装方法：
1. 查看浏览器地址栏是否有"安装"图标
2. 检查浏览器菜单中的"安装应用"选项
3. 建议使用Chrome或Edge浏览器`
        }

        // 给用户选择：重试或查看安装说明
        const retry = confirm(
          `PWA自动安装超时，请尝试手动安装：\n\n${installInstructions}\n\n点击"确定"隐藏此提示，点击"取消"重试自动安装`
        )

        if (retry) {
          // 用户选择查看说明，隐藏安装提示
          console.info('👀 用户选择查看手动安装说明，隐藏自动安装提示')
          setShowInstallBanner(false)
          localStorage.setItem('pwa-install-dismissed', Date.now().toString())
        } else {
          // 用户选择重试，重置状态
          console.info('🔄 用户选择重试自动安装')
          setPromptUsed(false)
        }
      } else if (
        errorMessage.includes('prompt') ||
        errorMessage.includes('user gesture')
      ) {
        alert('安装提示已失效，请刷新页面后重试。')
      } else if (
        errorMessage.includes('not supported') ||
        errorMessage.includes('denied')
      ) {
        alert(
          '浏览器不支持PWA安装或已被禁用。\n\n请尝试:\n1. 使用Chrome、Edge等支持PWA的浏览器\n2. 检查浏览器设置中的安装权限'
        )
      } else {
        alert(
          `安装失败: ${errorMessage}\n\n请尝试刷新页面或手动在浏览器地址栏安装PWA`
        )
      }
    }
  }

  const handleDismiss = () => {
    setShowInstallBanner(false)
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }

  // 如果已安装，则不显示
  if (isInstalled) {
    return null
  }

  // 正常环境：需要有安装提示事件且显示横幅
  // 开发环境：允许显示测试横幅
  const isDev = process.env.NODE_ENV === 'development'
  if (!showInstallBanner || (!isDev && !deferredPrompt)) {
    return null
  }

  // 渲染时输出当前状态用于调试
  console.info('🎨 PWAInstallPrompt 正在渲染', {
    isInstalled,
    showInstallBanner,
    hasDeferredPrompt: !!deferredPrompt,
    promptUsed,
    isDev,
  })

  return (
    <div className='fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50'>
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4'>
        <div className='flex items-start gap-3'>
          <div className='flex-shrink-0'>
            <div className='w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center'>
              <Smartphone className='w-5 h-5 text-blue-600 dark:text-blue-400' />
            </div>
          </div>

          <div className='flex-1 min-w-0'>
            <h3 className='text-sm font-medium text-gray-900 dark:text-gray-100'>
              安装博客应用
            </h3>
            <p className='text-xs text-gray-600 dark:text-gray-400 mt-1'>
              添加到主屏幕，获得更好的阅读体验
            </p>

            <div className='flex gap-2 mt-3'>
              <button
                onClick={handleInstallClick}
                onMouseDown={() => console.info('🖱️ 鼠标按下安装按钮')}
                onMouseUp={() => console.info('🖱️ 鼠标抬起安装按钮')}
                className='flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors'
              >
                <Download className='w-3 h-3' />
                安装
              </button>
              <button
                onClick={handleDismiss}
                className='px-3 py-1.5 text-gray-600 dark:text-gray-400 text-xs font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
              >
                稍后
              </button>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className='flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
          >
            <X className='w-4 h-4' />
          </button>
        </div>
      </div>
    </div>
  )
}
