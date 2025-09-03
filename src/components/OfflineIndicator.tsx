'use client'

import { useState, useEffect } from 'react'
import { WifiOff, Wifi } from 'lucide-react'

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [showOfflineMessage, setShowOfflineMessage] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowOfflineMessage(false)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowOfflineMessage(true)
    }

    // 初始状态
    setIsOnline(navigator.onLine)
    if (!navigator.onLine) {
      setShowOfflineMessage(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // 在线时自动隐藏提示
  useEffect(() => {
    if (isOnline && showOfflineMessage) {
      const timer = setTimeout(() => {
        setShowOfflineMessage(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isOnline, showOfflineMessage])

  if (!showOfflineMessage) {
    return null
  }

  return (
    <div
      className={`fixed top-16 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-40 transition-all duration-300 ${
        isOnline ? 'translate-y-0' : 'translate-y-0'
      }`}
    >
      <div
        className={`rounded-lg shadow-lg p-4 border ${
          isOnline
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        }`}
      >
        <div className='flex items-center gap-3'>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isOnline
                ? 'bg-green-100 dark:bg-green-900/30'
                : 'bg-red-100 dark:bg-red-900/30'
            }`}
          >
            {isOnline ? (
              <Wifi className='w-4 h-4 text-green-600 dark:text-green-400' />
            ) : (
              <WifiOff className='w-4 h-4 text-red-600 dark:text-red-400' />
            )}
          </div>

          <div className='flex-1'>
            <p
              className={`text-sm font-medium ${
                isOnline
                  ? 'text-green-900 dark:text-green-100'
                  : 'text-red-900 dark:text-red-100'
              }`}
            >
              {isOnline ? '网络连接已恢复' : '网络连接断开'}
            </p>
            <p
              className={`text-xs mt-0.5 ${
                isOnline
                  ? 'text-green-700 dark:text-green-300'
                  : 'text-red-700 dark:text-red-300'
              }`}
            >
              {isOnline ? '您现在可以访问最新内容' : '您仍可以浏览已缓存的内容'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
