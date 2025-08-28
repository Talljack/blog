'use client'

import { useEffect } from 'react'

interface SEOOptimizerProps {
  title?: string
  description?: string
}

export default function SEOOptimizer({
  title,
  description,
}: SEOOptimizerProps) {
  useEffect(() => {
    // Core Web Vitals 优化
    const optimizeCoreWebVitals = () => {
      // 预连接重要资源
      const preconnectLinks = [
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com',
        'https://www.googletagmanager.com',
      ]

      preconnectLinks.forEach(href => {
        if (!document.querySelector(`link[href="${href}"]`)) {
          const link = document.createElement('link')
          link.rel = 'preconnect'
          link.href = href
          if (href.includes('gstatic')) {
            link.crossOrigin = 'anonymous'
          }
          document.head.appendChild(link)
        }
      })

      // 添加资源提示
      const resourceHints = [
        { rel: 'dns-prefetch', href: 'https://cdn.jsdelivr.net' },
        { rel: 'dns-prefetch', href: 'https://unpkg.com' },
        { rel: 'preconnect', href: 'https://giscus.app' },
      ]

      resourceHints.forEach(({ rel, href }) => {
        if (!document.querySelector(`link[href="${href}"]`)) {
          const link = document.createElement('link')
          link.rel = rel
          link.href = href
          document.head.appendChild(link)
        }
      })
    }

    // 页面加载性能优化
    const optimizePageLoad = () => {
      // 延迟加载非关键资源
      const lazyImages = document.querySelectorAll('img[loading="lazy"]')

      if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement
              if (img.dataset.src) {
                img.src = img.dataset.src
                img.removeAttribute('data-src')
                imageObserver.unobserve(img)
              }
            }
          })
        })

        lazyImages.forEach(img => imageObserver.observe(img))
      }
    }

    // SEO结构化数据验证
    const validateStructuredData = () => {
      const structuredDataScripts = document.querySelectorAll(
        'script[type="application/ld+json"]'
      )

      structuredDataScripts.forEach(script => {
        try {
          const data = JSON.parse(script.textContent || '')

          // 基本验证
          if (!data['@context'] || !data['@type']) {
            console.warn('Invalid structured data detected')
          }

          // 文章特定验证
          if (data['@type'] === 'BlogPosting') {
            const requiredFields = [
              'headline',
              'datePublished',
              'author',
              'publisher',
            ]
            requiredFields.forEach(field => {
              if (!data[field]) {
                console.warn(`Missing required field for BlogPosting: ${field}`)
              }
            })
          }
        } catch (error) {
          console.error('Error parsing structured data:', error)
        }
      })
    }

    // 可访问性增强
    const enhanceAccessibility = () => {
      // 确保所有图片都有alt属性
      const images = document.querySelectorAll('img:not([alt])')
      images.forEach(img => {
        const altText =
          img.getAttribute('title') || img.getAttribute('data-alt') || '图片'
        img.setAttribute('alt', altText)
      })

      // 确保链接有描述性文本
      const links = document.querySelectorAll('a')
      links.forEach(link => {
        const text = link.textContent?.trim()
        if (!text || text.length < 2) {
          const ariaLabel =
            link.getAttribute('aria-label') ||
            link.getAttribute('title') ||
            '链接'
          link.setAttribute('aria-label', ariaLabel)
        }
      })

      // 添加跳转到主内容的链接
      if (!document.querySelector('.skip-to-main')) {
        const skipLink = document.createElement('a')
        skipLink.className =
          'skip-to-main sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50'
        skipLink.href = '#main-content'
        skipLink.textContent = '跳转到主内容'
        document.body.insertBefore(skipLink, document.body.firstChild)
      }

      // 确保主内容区域有ID
      const main = document.querySelector('main')
      if (main && !main.id) {
        main.id = 'main-content'
      }
    }

    // 执行优化
    const runOptimizations = () => {
      optimizeCoreWebVitals()
      optimizePageLoad()
      validateStructuredData()
      enhanceAccessibility()
    }

    // 页面加载完成后执行
    if (document.readyState === 'complete') {
      runOptimizations()
    } else {
      window.addEventListener('load', runOptimizations)
    }

    // 清理函数
    return () => {
      window.removeEventListener('load', runOptimizations)
    }
  }, [title, description])

  return null // 这是一个功能组件，不渲染任何内容
}

// SEO性能监控Hook
export function useSEOMetrics() {
  useEffect(() => {
    // 监控Core Web Vitals - 使用现有的 web-vitals 实现
    if (typeof window !== 'undefined') {
      // Web Vitals 监控已在其他地方实现
      console.info('SEO metrics monitoring enabled')
    }
  }, [])

  return null
}
