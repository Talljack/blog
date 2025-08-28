/**
 * Web Vitals 性能监控
 * 简化版本，移除与新版 web-vitals 的冲突
 */

export interface PerformanceMetric {
  name: string
  value: number
  id: string
  delta?: number
  rating?: 'good' | 'needs-improvement' | 'poor'
  url?: string
  timestamp?: number
}

/**
 * 初始化 Web Vitals 监控
 */
export function initWebVitals() {
  if (typeof window === 'undefined') return

  console.info('Web Vitals monitoring initialized')

  // 基本性能监控
  monitorBasicPerformance()
}

/**
 * 基本性能监控
 */
function monitorBasicPerformance() {
  // 监控页面加载完成时间
  window.addEventListener('load', () => {
    const navigation = performance.getEntriesByType(
      'navigation'
    )[0] as PerformanceNavigationTiming

    if (navigation) {
      const metrics: PerformanceMetric[] = [
        {
          name: 'DOM Content Loaded',
          value:
            navigation.domContentLoadedEventEnd -
            navigation.domContentLoadedEventStart,
          id: 'dcl-' + Date.now(),
          timestamp: Date.now(),
        },
        {
          name: 'Load Complete',
          value: navigation.loadEventEnd - navigation.loadEventStart,
          id: 'load-' + Date.now(),
          timestamp: Date.now(),
        },
      ]

      metrics.forEach(metric => {
        if (metric.value > 0) {
          reportMetric(metric)
        }
      })
    }
  })

  // 监控资源加载
  monitorResourcePerformance()
}

/**
 * 监控资源性能
 */
function monitorResourcePerformance() {
  // 使用 PerformanceObserver 监控资源
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          // 只监控关键资源
          if (
            entry.entryType === 'resource' &&
            isImportantResource(entry.name)
          ) {
            const metric: PerformanceMetric = {
              name: 'Resource Load Time',
              value: entry.duration,
              id: 'resource-' + Date.now(),
              url: entry.name,
              timestamp: Date.now(),
            }
            reportMetric(metric)
          }
        })
      })

      observer.observe({ entryTypes: ['resource', 'navigation'] })
    } catch (error) {
      console.warn('Performance monitoring not available:', error)
    }
  }
}

/**
 * 判断是否为重要资源
 */
function isImportantResource(url: string): boolean {
  const importantPatterns = [
    '/css/',
    '/js/',
    '/fonts/',
    '.css',
    '.js',
    '.woff',
    '.woff2',
  ]

  return importantPatterns.some(pattern => url.includes(pattern))
}

/**
 * 报告性能指标
 */
function reportMetric(metric: PerformanceMetric) {
  // 发送到分析服务
  if (typeof fetch !== 'undefined') {
    fetch('/api/analytics/web-vitals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: metric.name,
        value: metric.value,
        id: metric.id,
        url: metric.url || window.location.href,
        timestamp: metric.timestamp || Date.now(),
        userAgent: navigator.userAgent,
        rating: calculateRating(metric.name, metric.value),
      }),
    }).catch(error => {
      console.warn('Failed to report metric:', error)
    })
  }

  // 开发环境输出
  if (process.env.NODE_ENV === 'development') {
    console.info('Performance Metric:', metric)
  }
}

/**
 * 计算性能评级
 */
function calculateRating(
  name: string,
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  // 简化的评级逻辑
  switch (name) {
    case 'DOM Content Loaded':
      return value <= 1000
        ? 'good'
        : value <= 2500
          ? 'needs-improvement'
          : 'poor'
    case 'Load Complete':
      return value <= 2000
        ? 'good'
        : value <= 4000
          ? 'needs-improvement'
          : 'poor'
    case 'Resource Load Time':
      return value <= 500
        ? 'good'
        : value <= 1500
          ? 'needs-improvement'
          : 'poor'
    default:
      return 'good'
  }
}

/**
 * 预连接重要资源
 */
export function preconnectResources() {
  if (typeof document === 'undefined') return

  const importantDomains = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://www.googletagmanager.com',
    'https://giscus.app',
  ]

  importantDomains.forEach(domain => {
    if (!document.querySelector(`link[href="${domain}"]`)) {
      const link = document.createElement('link')
      link.rel = 'preconnect'
      link.href = domain
      if (domain.includes('gstatic')) {
        link.crossOrigin = 'anonymous'
      }
      document.head.appendChild(link)
    }
  })
}

/**
 * 监控用户交互性能
 */
export function monitorInteractionPerformance() {
  if (typeof window === 'undefined') return

  let interactionCount = 0
  const interactions = ['click', 'keydown', 'scroll']

  interactions.forEach(eventType => {
    document.addEventListener(
      eventType,
      () => {
        interactionCount++

        // 每100次交互报告一次
        if (interactionCount % 100 === 0) {
          const metric: PerformanceMetric = {
            name: 'User Interactions',
            value: interactionCount,
            id: 'interaction-' + Date.now(),
            timestamp: Date.now(),
          }
          reportMetric(metric)
        }
      },
      { passive: true }
    )
  })
}
