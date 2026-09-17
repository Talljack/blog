'use client'

import { siteConfig } from '@/lib/config'
import TotalViewsCounter from './TotalViewsCounter'

export default function Footer() {
  const currentDate = '2017 — Present'

  return (
    <footer className='mt-16 py-8 border-t border-gray-200 dark:border-gray-800'>
      <div className='max-w-5xl mx-auto px-6 sm:px-8'>
        <div className='text-center space-y-4'>
          {/* 总访问量和当前日期 */}
          <div className='flex items-center justify-center space-x-4 text-xs text-gray-400 dark:text-gray-600'>
            <TotalViewsCounter />
            <span>·</span>
            <span>{currentDate}</span>
          </div>

          {/* 版权信息 */}
          <div className='text-xs text-gray-500 dark:text-gray-500'>
            <p>
              © {new Date().getFullYear()} {siteConfig.author.name}.
              保留所有权利。
            </p>
          </div>

          {/* RSS 订阅链接 */}
          {siteConfig.features.enableRss && (
            <div className='text-xs text-gray-500 dark:text-gray-500'>
              <a
                href='/feed.xml'
                target='_blank'
                className='hover:text-gray-700 dark:hover:text-gray-300 transition-colors'
              >
                📡 RSS 订阅
              </a>
            </div>
          )}

          {/* 技术栈信息 */}
          <div className='text-xs text-gray-400 dark:text-gray-600'>
            <p>
              使用 <span className='font-medium'>Next.js</span> 构建，部署在{' '}
              <span className='font-medium'>Vercel</span>
            </p>
          </div>

          {/* 优雅的装饰 */}
          <div className='flex justify-center'>
            <div className='w-12 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent' />
          </div>
        </div>
      </div>
    </footer>
  )
}
