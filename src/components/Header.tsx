'use client'

import { siteConfig } from '@/lib/config'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  const pathname = usePathname()

  return (
    <header className="w-full py-8">
      <div className="max-w-2xl mx-auto px-6">
        {/* 顶部导航栏 - 完全按照参考网站 */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-6">
            {/* 小鸟图标 */}
            <div className="text-xl">🐥</div>
            
            {/* 导航菜单 */}
            <nav>
              <ul className="flex space-x-6 text-sm">
                <li>
                  <Link
                    href="/"
                    className={`transition-colors ${
                      pathname === '/'
                        ? 'text-gray-900 dark:text-gray-100' 
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                  >
                    文章
                  </Link>
                </li>
                <li>
                  <Link
                    href="/course"
                    className={`transition-colors ${
                      pathname === '/course'
                        ? 'text-gray-900 dark:text-gray-100' 
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                  >
                    课程
                  </Link>
                </li>
                <li>
                  <Link
                    href="/template"
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                  >
                    模板🔥
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* 右侧图标组 */}
          <div className="flex items-center space-x-4">
            <Link 
              href={siteConfig.author.social.github || '#'} 
              target="_blank" 
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </Link>
            <Link 
              href="#" 
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </Link>
            <Link 
              href="#" 
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 text-sm"
            >
              小红书
            </Link>
            <ThemeToggle />
          </div>
        </div>

        {/* 主标题区域 */}
        <div className="mb-4">
          <Link href="/">
            <h1 className="heading-font text-2xl font-normal text-gray-900 dark:text-gray-100 hover:opacity-80 transition-opacity">
              Guangzheng Li
            </h1>
          </Link>
        </div>

        {/* 个人简介 */}
        <div className="mb-6 space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            阅读与思考，真理与自由
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            一个还在重新学习，重塑思想的开发者
          </p>
        </div>

        {/* 社交链接 */}
        <div className="flex items-center flex-wrap text-sm text-gray-600 dark:text-gray-400">
          <Link href="/rss" className="elegant-link hover:text-gray-900 dark:hover:text-gray-100">
            RSS订阅
          </Link>
          <span className="mx-2">·</span>
          <Link href="#" className="elegant-link hover:text-gray-900 dark:hover:text-gray-100">
            算筹
          </Link>
          <span className="mx-2">·</span>
          <Link href="#" className="elegant-link hover:text-gray-900 dark:hover:text-gray-100">
            X
          </Link>
          <span className="mx-2">·</span>
          <Link href="#" className="elegant-link hover:text-gray-900 dark:hover:text-gray-100">
            小红书
          </Link>
          <span className="mx-2">·</span>
          <Link href="#" className="elegant-link hover:text-gray-900 dark:hover:text-gray-100">
            微信公众号
          </Link>
        </div>
      </div>
    </header>
  )
}