'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

interface PreloadConfig {
  fonts: string[]
  scripts: string[]
  stylesheets: string[]
  images: string[]
  routes: string[]
}

const preloadConfig: PreloadConfig = {
  // 关键字体文件
  fonts: [
    'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyeMZhrib2Bg-4.woff2',
  ],

  // 关键脚本
  scripts: ['https://www.googletagmanager.com/gtag/js'],

  // 关键样式表
  stylesheets: [
    'https://cdn.jsdelivr.net/npm/lxgw-wenkai-lite-webfont@1.1.0/style.css',
  ],

  // 关键图片资源
  images: ['/favicon.ico', '/apple-touch-icon.png', '/og-image.jpg'],

  // 关键路由页面
  routes: ['/', '/blog', '/about'],
}

// 路由预加载配置
const routePreloadMap: Record<string, string[]> = {
  '/': ['/blog', '/about'],
  '/blog': ['/'],
  '/about': ['/blog'],
}

export default function ResourcePreloader() {
  const pathname = usePathname()

  useEffect(() => {
    const preloadResource = (
      href: string,
      as: string,
      crossOrigin?: string
    ) => {
      // 检查是否已存在预加载链接
      const existingLink = document.querySelector(`link[href="${href}"]`)
      if (existingLink) return

      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = href
      link.as = as

      if (crossOrigin) {
        link.crossOrigin = crossOrigin
      }

      // 添加错误处理
      link.onerror = () => {
        console.warn(`Failed to preload resource: ${href}`)
      }

      document.head.appendChild(link)
    }

    const prefetchRoute = (href: string) => {
      // 检查是否已存在预取链接
      const existingLink = document.querySelector(
        `link[href="${href}"][rel="prefetch"]`
      )
      if (existingLink) return

      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = href

      // 添加错误处理
      link.onerror = () => {
        console.warn(`Failed to prefetch route: ${href}`)
      }

      document.head.appendChild(link)
    }

    // 预加载字体
    preloadConfig.fonts.forEach(font => {
      preloadResource(font, 'font', 'anonymous')
    })

    // 预加载样式表
    preloadConfig.stylesheets.forEach(stylesheet => {
      preloadResource(stylesheet, 'style')
    })

    // 预加载关键图片
    preloadConfig.images.forEach(image => {
      preloadResource(image, 'image')
    })

    // 预取相关路由页面（基于当前页面）
    const routesToPrefetch = routePreloadMap[pathname] || []
    routesToPrefetch.forEach(route => {
      prefetchRoute(route)
    })

    // 智能预加载：基于滚动位置预加载下一页内容
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollPercentage = (scrollPosition / documentHeight) * 100

      // 当用户滚动到50%时，开始预取下一页内容
      if (scrollPercentage > 50 && pathname === '/blog') {
        // 预取首页文章的详情页面
        const blogLinks = document.querySelectorAll('a[href*="/blog/"]')
        blogLinks.forEach((link, index) => {
          if (index < 3) {
            // 只预取前3篇文章
            const href = (link as HTMLAnchorElement).href
            prefetchRoute(href)
          }
        })
      }
    }

    // 防抖滚动事件
    let scrollTimeout: NodeJS.Timeout
    const debouncedScroll = () => {
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(handleScroll, 100)
    }

    window.addEventListener('scroll', debouncedScroll, { passive: true })

    // 清理函数
    return () => {
      window.removeEventListener('scroll', debouncedScroll)
      clearTimeout(scrollTimeout)
    }
  }, [pathname])

  // 鼠标悬停时预取链接
  useEffect(() => {
    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target

      // 确保target是Element类型且有closest方法
      if (!target || !(target instanceof Element)) return

      const link = target.closest('a[href]') as HTMLAnchorElement

      if (link && link.hostname === window.location.hostname) {
        const href = link.getAttribute('href')
        if (href && !href.startsWith('#') && !href.includes('mailto:')) {
          // 延迟预取，避免意外的鼠标经过
          setTimeout(() => {
            const prefetchLink = document.createElement('link')
            prefetchLink.rel = 'prefetch'
            prefetchLink.href = href

            // 检查是否已存在
            const existing = document.querySelector(
              `link[href="${href}"][rel="prefetch"]`
            )
            if (!existing) {
              document.head.appendChild(prefetchLink)
            }
          }, 100)
        }
      }
    }

    document.addEventListener('mouseenter', handleMouseEnter, true)

    return () => {
      document.removeEventListener('mouseenter', handleMouseEnter, true)
    }
  }, [])

  return null
}

// 性能监控Hook
export function useResourcePreloadMetrics() {
  useEffect(() => {
    if (typeof window === 'undefined' || !window.performance) return

    const observer = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (
          entry.entryType === 'resource' ||
          entry.entryType === 'navigation'
        ) {
          // 可以在这里收集性能指标
          console.info('Resource loaded:', {
            name: entry.name,
            duration: entry.duration,
            size: (entry as PerformanceResourceTiming).transferSize,
          })
        }
      }
    })

    observer.observe({ entryTypes: ['resource', 'navigation'] })

    return () => {
      observer.disconnect()
    }
  }, [])
}
