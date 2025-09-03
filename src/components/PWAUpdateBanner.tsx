'use client'

import { RefreshCcw, X } from 'lucide-react'
import { usePWAUpdate } from '@/hooks/usePWA'

export default function PWAUpdateBanner() {
  const { showUpdateBanner, updateApp, dismissUpdate } = usePWAUpdate()

  if (!showUpdateBanner) {
    return null
  }

  return (
    <div className='fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white'>
      <div className='max-w-7xl mx-auto px-4 py-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <RefreshCcw className='w-5 h-5 animate-spin' />
            <div>
              <p className='font-medium text-sm'>应用更新可用</p>
              <p className='text-xs text-blue-100'>
                点击刷新以获取最新功能和改进
              </p>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <button
              onClick={updateApp}
              className='bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-md text-sm font-medium transition-colors'
            >
              刷新应用
            </button>
            <button
              onClick={dismissUpdate}
              className='p-1.5 rounded-md hover:bg-white/20 transition-colors'
              aria-label='关闭更新提示'
            >
              <X className='w-4 h-4' />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
