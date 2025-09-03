'use client'

import { useState, useEffect } from 'react'

export interface PWAStatus {
  isInstalled: boolean
  isOnline: boolean
  canInstall: boolean
  isSupported: boolean
  installPrompt: BeforeInstallPromptEvent | null
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export interface ServiceWorkerStatus {
  isRegistered: boolean
  isUpdating: boolean
  needsRefresh: boolean
  registration: ServiceWorkerRegistration | null
}

export function usePWA() {
  const [status, setStatus] = useState<PWAStatus>({
    isInstalled: false,
    isOnline: true,
    canInstall: false,
    isSupported: false,
    installPrompt: null,
  })

  const [serviceWorker, setServiceWorker] = useState<ServiceWorkerStatus>({
    isRegistered: false,
    isUpdating: false,
    needsRefresh: false,
    registration: null,
  })

  useEffect(() => {
    // 检查PWA支持
    const checkPWASupport = () => {
      const isSupported =
        'serviceWorker' in navigator && 'PushManager' in window
      setStatus(prev => ({ ...prev, isSupported }))
    }

    // 检查安装状态
    const checkInstallStatus = () => {
      const isStandalone = window.matchMedia(
        '(display-mode: standalone)'
      ).matches
      const isInWebAppChrome =
        (window.navigator as unknown as { standalone?: boolean }).standalone ===
        true
      const isInstalled = isStandalone || isInWebAppChrome

      setStatus(prev => ({ ...prev, isInstalled }))
    }

    // 检查网络状态
    const checkOnlineStatus = () => {
      setStatus(prev => ({ ...prev, isOnline: navigator.onLine }))
    }

    checkPWASupport()
    checkInstallStatus()
    checkOnlineStatus()

    // 监听安装提示事件
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setStatus(prev => ({
        ...prev,
        canInstall: true,
        installPrompt: e,
      }))
    }

    // 监听应用安装事件
    const handleAppInstalled = () => {
      setStatus(prev => ({
        ...prev,
        isInstalled: true,
        canInstall: false,
        installPrompt: null,
      }))
    }

    // 监听网络状态变化
    const handleOnline = () => {
      setStatus(prev => ({ ...prev, isOnline: true }))
    }

    const handleOffline = () => {
      setStatus(prev => ({ ...prev, isOnline: false }))
    }

    // 监听显示模式变化
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      setStatus(prev => ({ ...prev, isInstalled: e.matches }))
    }

    // 添加事件监听器
    window.addEventListener(
      'beforeinstallprompt',
      handleBeforeInstallPrompt as EventListener
    )
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    mediaQuery.addListener(handleDisplayModeChange)

    // 注册Service Worker
    if ('serviceWorker' in navigator) {
      registerServiceWorker()
    }

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt as EventListener
      )
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      mediaQuery.removeListener(handleDisplayModeChange)
    }
  }, [])

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      })

      setServiceWorker(prev => ({
        ...prev,
        isRegistered: true,
        registration,
      }))

      // 监听Service Worker更新
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          setServiceWorker(prev => ({ ...prev, isUpdating: true }))

          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              // 有新版本可用
              setServiceWorker(prev => ({
                ...prev,
                needsRefresh: true,
                isUpdating: false,
              }))
            }
          })
        }
      })

      console.info('Service Worker 注册成功')
    } catch (error) {
      console.error('Service Worker 注册失败:', error)
    }
  }

  // 安装PWA
  const installPWA = async () => {
    if (!status.installPrompt) {
      throw new Error('没有可用的安装提示')
    }

    try {
      await status.installPrompt.prompt()
      const choiceResult = await status.installPrompt.userChoice

      if (choiceResult.outcome === 'accepted') {
        setStatus(prev => ({
          ...prev,
          canInstall: false,
          installPrompt: null,
        }))
        return true
      }

      return false
    } catch (error) {
      console.error('PWA 安装失败:', error)
      throw error
    }
  }

  // 刷新应用（激活新的Service Worker）
  const refreshApp = () => {
    if (serviceWorker.registration && serviceWorker.registration.waiting) {
      serviceWorker.registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    }
  }

  // 清理缓存
  const clearCache = async (pattern?: string) => {
    if (serviceWorker.registration) {
      const messageChannel = new MessageChannel()

      return new Promise<void>(resolve => {
        messageChannel.port1.onmessage = () => resolve()
        if (serviceWorker.registration && serviceWorker.registration.active) {
          serviceWorker.registration.active.postMessage(
            { type: 'CACHE_CLEAN', payload: { pattern } },
            [messageChannel.port2]
          )
        }
      })
    }
  }

  // 获取缓存状态
  const getCacheStatus = async (): Promise<
    Record<string, number> | undefined
  > => {
    if (serviceWorker.registration) {
      const messageChannel = new MessageChannel()

      return new Promise<Record<string, number>>(resolve => {
        messageChannel.port1.onmessage = event => {
          resolve(event.data.payload)
        }
        if (serviceWorker.registration && serviceWorker.registration.active) {
          serviceWorker.registration.active.postMessage(
            { type: 'CACHE_STATUS' },
            [messageChannel.port2]
          )
        }
      })
    }
  }

  return {
    status,
    serviceWorker,
    installPWA,
    refreshApp,
    clearCache,
    getCacheStatus,
  }
}

// PWA更新通知Hook
export function usePWAUpdate() {
  const [showUpdateBanner, setShowUpdateBanner] = useState(false)
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(reg => {
        setRegistration(reg)

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (
                newWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                setShowUpdateBanner(true)
              }
            })
          }
        })
      })
    }
  }, [])

  const updateApp = () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      setShowUpdateBanner(false)
      window.location.reload()
    }
  }

  const dismissUpdate = () => {
    setShowUpdateBanner(false)
  }

  return {
    showUpdateBanner,
    updateApp,
    dismissUpdate,
  }
}
