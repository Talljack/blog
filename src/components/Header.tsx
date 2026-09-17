'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { siteConfig } from '@/lib/config'
import Search from './Search'
import ThemeToggle from './ThemeToggle'
import Logo from './Logo'

export default function Header() {
  const pathname = usePathname()

  // 判断是否在需要隐藏个人信息的页面 - 现在所有页面都隐藏个人信息
  const hidePersonalInfo = true

  return (
    <header className='w-full py-6'>
      <div className='max-w-5xl mx-auto px-6 sm:px-8'>
        {/* 顶部导航栏 - 优化布局 */}
        <div className='flex justify-between items-center mb-6'>
          <div className='flex items-center space-x-6'>
            {/* Logo组件 - 点击回到主页 */}
            <div className='flex items-center gap-2.5'>
              <Logo size={28} />
              <Link
                href='/'
                className='code-font hidden text-xs font-bold tracking-[0.12em] text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 dark:text-stone-100 sm:inline'
              >
                TALLJACK
              </Link>
            </div>

            {/* 导航菜单 */}
            <nav className='hidden sm:block'>
              <ul className='flex space-x-6 text-sm'>
                {siteConfig.navigation.map(nav => {
                  const isActive =
                    pathname === nav.href ||
                    (nav.href !== '/' && pathname.startsWith(nav.href))

                  return (
                    <li key={nav.href}>
                      <Link
                        href={nav.href}
                        className={`transition-colors ${
                          isActive
                            ? 'text-gray-900 dark:text-gray-100 font-medium'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                        }`}
                      >
                        {nav.name}
                        {nav.href === '/template' && '🔥'}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </div>

          {/* 右侧功能区 */}
          <div className='flex items-center space-x-3'>
            {/* 全局搜索 */}
            <div className='hidden lg:block'>
              <Search className='w-64' placeholder='搜索文章与构建笔记...' />
            </div>

            <div className='flex items-center space-x-2'>
              {siteConfig.features.enableRss && (
                <Link
                  href='/feed.xml'
                  target='_blank'
                  className='p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors'
                  title='RSS 订阅'
                >
                  <svg
                    className='w-4 h-4'
                    viewBox='0 0 24 24'
                    fill='currentColor'
                  >
                    <path d='M6.503 20.752c0 1.794-1.456 3.248-3.251 3.248-1.796 0-3.252-1.454-3.252-3.248 0-1.794 1.456-3.248 3.252-3.248 1.795.001 3.251 1.454 3.251 3.248zm-6.503-12.572v4.811c6.05.062 10.96 4.966 11.022 11.009h4.817c-.062-8.71-7.118-15.758-15.839-15.82zm0-3.368c10.58.046 19.152 8.594 19.183 19.188h4.817c-.03-13.231-10.755-23.954-24-24v4.812z' />
                  </svg>
                </Link>
              )}
              <Link
                href={siteConfig.author.social.github || '#'}
                target='_blank'
                className='p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors'
                title='GitHub'
              >
                <svg
                  className='w-4 h-4'
                  viewBox='0 0 24 24'
                  fill='currentColor'
                >
                  <path d='M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z' />
                </svg>
              </Link>
              {siteConfig.author.social.twitter && (
                <Link
                  href={siteConfig.author.social.twitter}
                  target='_blank'
                  className='p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors'
                  title='X (Twitter)'
                >
                  <svg
                    className='w-4 h-4'
                    viewBox='0 0 24 24'
                    fill='currentColor'
                  >
                    <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
                  </svg>
                </Link>
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* 中小屏幕的搜索和导航 */}
        <div className='lg:hidden mb-4'>
          <Search className='w-full mb-4' placeholder='搜索文章与构建笔记...' />

          {/* 移动端导航 */}
          <nav className='sm:hidden'>
            <ul className='flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm'>
              {siteConfig.navigation.map(nav => {
                const isActive =
                  pathname === nav.href ||
                  (nav.href !== '/' && pathname.startsWith(nav.href))

                return (
                  <li key={`mobile-${nav.href}`}>
                    <Link
                      href={nav.href}
                      className={`transition-colors ${
                        isActive
                          ? 'text-gray-900 dark:text-gray-100 font-medium'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                      }`}
                    >
                      {nav.name}
                      {nav.href === '/template' && '🔥'}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>

        {/* 条件性显示个人信息区域 */}
        {!hidePersonalInfo && (
          <>
            {/* 主标题区域 */}
            <div className='mb-4'>
              <Link href='/'>
                <h1 className='heading-font text-2xl font-normal text-gray-900 dark:text-gray-100 hover:opacity-80 transition-opacity'>
                  Guangzheng Li
                </h1>
              </Link>
            </div>

            {/* 个人简介 */}
            <div className='mb-6 space-y-2'>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                阅读与思考，真理与自由
              </p>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                一个还在重新学习，重塑思想的开发者
              </p>
            </div>

            {/* 首页搜索框 - 仅在首页且非移动端显示 */}
            <div className='mb-6 hidden lg:block'>
              <Search
                className='max-w-sm'
                placeholder='搜索文章与构建笔记...'
              />
            </div>

            {/* 社交链接 */}
            <div className='flex items-center flex-wrap text-sm text-gray-600 dark:text-gray-400'>
              {siteConfig.features.enableRss && (
                <>
                  <Link
                    href='/feed.xml'
                    className='elegant-link hover:text-gray-900 dark:hover:text-gray-100'
                  >
                    RSS订阅
                  </Link>
                  <span className='mx-2'>·</span>
                </>
              )}
              {siteConfig.author.social.github && (
                <>
                  <Link
                    href={siteConfig.author.social.github}
                    target='_blank'
                    className='elegant-link hover:text-gray-900 dark:hover:text-gray-100'
                  >
                    GitHub
                  </Link>
                  <span className='mx-2'>·</span>
                </>
              )}
              {siteConfig.author.social.twitter && (
                <>
                  <Link
                    href={siteConfig.author.social.twitter}
                    target='_blank'
                    className='elegant-link hover:text-gray-900 dark:hover:text-gray-100'
                  >
                    X
                  </Link>
                  <span className='mx-2'>·</span>
                </>
              )}
              {siteConfig.author.social.email && (
                <Link
                  href={`mailto:${siteConfig.author.social.email}`}
                  className='elegant-link hover:text-gray-900 dark:hover:text-gray-100'
                >
                  联系我
                </Link>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  )
}
