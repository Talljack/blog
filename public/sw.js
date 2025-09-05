// Enhanced Service Worker for PWA with intelligent preloading
const CACHE_NAME = 'blog-pwa-v1.1.0'
const RUNTIME_CACHE = 'runtime-cache-v1.1'
const PRELOAD_CACHE = 'preload-cache-v1'

// 需要缓存的静态资源
const STATIC_CACHE_URLS = [
  '/',
  '/blog',
  '/about',
  '/favicon.ico',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/apple-touch-icon.png',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/site.webmanifest',
]

// 预加载策略配置
const PRELOAD_STRATEGIES = {
  // 关键CSS和JS - 高优先级
  critical: [
    /_next\/static\/css\/.*/,
    /_next\/static\/chunks\/framework-.*/,
    /_next\/static\/chunks\/main-.*/,
    /_next\/static\/chunks\/pages\/_app-.*/,
  ],

  // 字体文件 - 中优先级
  fonts: [/fonts\.googleapis\.com/, /fonts\.gstatic\.com/, /\.woff2?$/],

  // 图片资源 - 低优先级
  images: [/\.(png|jpg|jpeg|gif|svg|webp|avif)$/, /\/images\/.*/],

  // API接口预热
  api: ['/api/views', '/api/search?q='],
}

// 智能预加载队列
let preloadQueue = []
let isPreloading = false

// 安装事件 - 缓存核心资源并启动智能预加载
self.addEventListener('install', event => {
  console.log('Service Worker installing...')

  event.waitUntil(
    Promise.all([
      // 缓存静态资源
      caches.open(CACHE_NAME).then(cache => {
        console.log('Caching static resources')
        return cache.addAll(STATIC_CACHE_URLS)
      }),
      // 初始化预加载缓存
      caches.open(PRELOAD_CACHE),
    ])
      .then(() => {
        console.log('Static resources cached successfully')
        // 启动智能预加载
        startIntelligentPreloading()
      })
      .catch(error => {
        console.error('Failed to cache static resources:', error)
      })
  )

  // 强制激活新的 Service Worker
  self.skipWaiting()
})

// 激活事件 - 清理旧缓存
self.addEventListener('activate', event => {
  console.log('Service Worker activating...')

  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => {
              // 删除不是当前版本的缓存
              return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE
            })
            .map(cacheName => {
              console.log('Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            })
        )
      })
      .then(() => {
        // 立即控制所有客户端
        return self.clients.claim()
      })
  )
})

// 获取事件 - 缓存策略
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // 只处理 HTTP/HTTPS 请求
  if (!url.protocol.startsWith('http')) {
    return
  }

  // 处理 API 请求 - 网络优先策略
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request))
    return
  }

  // 处理静态资源 - 缓存优先策略
  if (
    request.destination === 'image' ||
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font'
  ) {
    event.respondWith(handleStaticAssets(request))
    return
  }

  // 处理页面请求 - 网络优先，缓存备用策略
  if (request.destination === 'document') {
    event.respondWith(handlePageRequest(request))
    return
  }

  // 其他请求使用默认的网络优先策略
  event.respondWith(handleOtherRequests(request))
})

// API 请求处理 - 网络优先
async function handleApiRequest(request) {
  try {
    const response = await fetch(request)

    // 对于成功的 API 响应，缓存一段时间
    if (response.ok && request.method === 'GET') {
      const cache = await caches.open(RUNTIME_CACHE)
      cache.put(request, response.clone())
    }

    return response
  } catch (error) {
    console.error('API request failed, trying cache:', error)

    // 网络失败时尝试从缓存获取
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // 如果是获取文章浏览量的请求，返回默认值
    if (request.url.includes('/api/views')) {
      return new Response(JSON.stringify({ views: 0 }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    throw error
  }
}

// 静态资源处理 - 缓存优先
async function handleStaticAssets(request) {
  const cachedResponse = await caches.match(request)

  if (cachedResponse) {
    // 后台更新缓存 (stale-while-revalidate)
    fetchAndCache(request)
    return cachedResponse
  }

  return fetchAndCache(request)
}

// 页面请求处理 - 网络优先，缓存备用
async function handlePageRequest(request) {
  try {
    const response = await fetch(request)

    // 缓存成功的页面响应
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE)
      cache.put(request, response.clone())
    }

    return response
  } catch (error) {
    console.error('Page request failed, trying cache:', error)

    // 网络失败时尝试从缓存获取
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // 如果没有缓存且是根路径，返回离线页面
    if (request.url === self.location.origin + '/') {
      return getOfflinePage()
    }

    throw error
  }
}

// 其他请求处理
async function handleOtherRequests(request) {
  try {
    const response = await fetch(request)

    // 缓存成功的 GET 请求
    if (response.ok && request.method === 'GET') {
      const cache = await caches.open(RUNTIME_CACHE)
      cache.put(request, response.clone())
    }

    return response
  } catch (error) {
    const cachedResponse = await caches.match(request)
    return cachedResponse || Response.error()
  }
}

// 获取并缓存资源
async function fetchAndCache(request) {
  try {
    const response = await fetch(request)

    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE)
      cache.put(request, response.clone())
    }

    return response
  } catch (error) {
    console.error('Failed to fetch and cache:', error)
    throw error
  }
}

// 离线页面
function getOfflinePage() {
  return new Response(
    `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>离线模式 - 博客</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin: 0;
          padding: 20px;
          background: #f9fafb;
          color: #374151;
          text-align: center;
        }
        .container {
          max-width: 400px;
          margin: 50px auto;
          background: white;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .icon {
          width: 64px;
          height: 64px;
          margin: 0 auto 20px;
          background: #ddd6fe;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }
        h1 {
          margin: 0 0 12px;
          font-size: 24px;
          font-weight: 600;
        }
        p {
          margin: 0 0 24px;
          color: #6b7280;
          line-height: 1.5;
        }
        .retry-btn {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-size: 16px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .retry-btn:hover {
          background: #2563eb;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">📱</div>
        <h1>当前处于离线模式</h1>
        <p>无法连接到网络，但您仍可以浏览已缓存的内容。</p>
        <button class="retry-btn" onclick="window.location.reload()">
          重试连接
        </button>
      </div>
    </body>
    </html>
  `,
    {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache',
      },
    }
  )
}

// 消息处理 - 用于清理缓存等操作
self.addEventListener('message', event => {
  const { type, payload } = event.data

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting()
      break

    case 'CACHE_CLEAN':
      cleanCache(payload?.pattern)
      break

    case 'CACHE_STATUS':
      getCacheStatus().then(status => {
        event.ports[0].postMessage({ type: 'CACHE_STATUS', payload: status })
      })
      break

    default:
      console.log('Unknown message type:', type)
  }
})

// 清理缓存
async function cleanCache(pattern) {
  const caches = await caches.keys()
  const cachesToDelete = pattern
    ? caches.filter(cache => cache.includes(pattern))
    : [RUNTIME_CACHE]

  await Promise.all(cachesToDelete.map(cache => caches.delete(cache)))
}

// 获取缓存状态
async function getCacheStatus() {
  const cacheNames = await caches.keys()
  const status = {}

  for (const name of cacheNames) {
    const cache = await caches.open(name)
    const keys = await cache.keys()
    status[name] = keys.length
  }

  return status
}

// 后台同步 (如果支持)
if ('sync' in self.registration) {
  self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
      event.waitUntil(doBackgroundSync())
    }
  })
}

async function doBackgroundSync() {
  // 这里可以处理离线时的数据同步
  console.log('Background sync triggered')
}

// ============ 智能预加载功能 ============

// 启动智能预加载
async function startIntelligentPreloading() {
  console.log('Starting intelligent preloading...')

  // 预加载关键资源
  await preloadCriticalResources()

  // 延迟预加载次要资源
  setTimeout(() => {
    preloadSecondaryResources()
  }, 3000)
}

// 预加载关键资源
async function preloadCriticalResources() {
  const criticalUrls = [
    '/_next/static/css/app.css',
    '/_next/static/chunks/framework.js',
    '/_next/static/chunks/main.js',
    '/api/views',
  ]

  const cache = await caches.open(PRELOAD_CACHE)

  for (const url of criticalUrls) {
    try {
      if (!(await cache.match(url))) {
        const response = await fetch(url)
        if (response.ok) {
          await cache.put(url, response)
          console.log('Preloaded critical resource:', url)
        }
      }
    } catch (error) {
      console.warn('Failed to preload critical resource:', url, error)
    }
  }
}

// 预加载次要资源
async function preloadSecondaryResources() {
  const secondaryUrls = [
    '/blog',
    '/about',
    '/api/search?q=react',
    '/api/search?q=next',
  ]

  const cache = await caches.open(PRELOAD_CACHE)

  for (const url of secondaryUrls) {
    try {
      if (!(await cache.match(url))) {
        const response = await fetch(url)
        if (response.ok) {
          await cache.put(url, response)
          console.log('Preloaded secondary resource:', url)
        }
      }
    } catch (error) {
      console.warn('Failed to preload secondary resource:', url, error)
    }

    // 添加延迟避免阻塞
    await new Promise(resolve => setTimeout(resolve, 500))
  }
}

// 智能预加载队列处理
async function processPreloadQueue() {
  if (isPreloading || preloadQueue.length === 0) return

  isPreloading = true
  const cache = await caches.open(PRELOAD_CACHE)

  while (preloadQueue.length > 0) {
    const url = preloadQueue.shift()

    try {
      if (!(await cache.match(url))) {
        const response = await fetch(url)
        if (response.ok) {
          await cache.put(url, response)
          console.log('Preloaded from queue:', url)
        }
      }
    } catch (error) {
      console.warn('Failed to preload from queue:', url, error)
    }

    // 避免阻塞主线程
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  isPreloading = false
}

// 基于用户行为的预加载
function addToPreloadQueue(url) {
  if (!preloadQueue.includes(url) && preloadQueue.length < 10) {
    preloadQueue.push(url)
    // 延迟处理队列
    setTimeout(processPreloadQueue, 1000)
  }
}

// 增强的获取事件处理 - 添加预加载逻辑
const originalFetchListener = self.listeners?.get?.('fetch')?.[0]

// 重新注册fetch事件以包含预加载逻辑
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // 记录用户访问模式用于预加载
  if (request.destination === 'document') {
    recordUserPattern(url.pathname)
  }

  // 执行原有的fetch处理逻辑
  if (originalFetchListener) {
    originalFetchListener(event)
  } else {
    // 备用处理逻辑
    handleEnhancedFetch(event)
  }
})

// 增强的fetch处理
function handleEnhancedFetch(event) {
  const { request } = event
  const url = new URL(request.url)

  // 只处理 HTTP/HTTPS 请求
  if (!url.protocol.startsWith('http')) {
    return
  }

  // 处理 API 请求 - 网络优先策略
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequestWithPreload(request))
    return
  }

  // 处理静态资源 - 缓存优先策略
  if (
    request.destination === 'image' ||
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font'
  ) {
    event.respondWith(handleStaticAssetsWithPreload(request))
    return
  }

  // 处理页面请求 - 网络优先，缓存备用策略
  if (request.destination === 'document') {
    event.respondWith(handlePageRequestWithPreload(request))
    return
  }

  // 其他请求使用默认的网络优先策略
  event.respondWith(handleOtherRequestsWithPreload(request))
}

// 带预加载的API请求处理
async function handleApiRequestWithPreload(request) {
  try {
    const response = await fetch(request)

    if (response.ok && request.method === 'GET') {
      const cache = await caches.open(RUNTIME_CACHE)
      cache.put(request, response.clone())

      // 预加载相关API
      predictAndPreloadRelatedAPIs(request.url)
    }

    return response
  } catch (error) {
    console.error('API request failed, trying cache:', error)

    // 先尝试预加载缓存，再尝试运行时缓存
    const preloadCache = await caches.open(PRELOAD_CACHE)
    const preloadedResponse = await preloadCache.match(request)
    if (preloadedResponse) {
      return preloadedResponse
    }

    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    if (request.url.includes('/api/views')) {
      return new Response(JSON.stringify({ views: 0 }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    throw error
  }
}

// 带预加载的静态资源处理
async function handleStaticAssetsWithPreload(request) {
  // 先检查预加载缓存
  const preloadCache = await caches.open(PRELOAD_CACHE)
  const preloadedResponse = await preloadCache.match(request)

  if (preloadedResponse) {
    // 后台更新缓存
    fetchAndCacheWithPriority(request, 'low')
    return preloadedResponse
  }

  const cachedResponse = await caches.match(request)
  if (cachedResponse) {
    fetchAndCacheWithPriority(request, 'low')
    return cachedResponse
  }

  return fetchAndCacheWithPriority(request, 'high')
}

// 带预加载的页面请求处理
async function handlePageRequestWithPreload(request) {
  try {
    const response = await fetch(request)

    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE)
      cache.put(request, response.clone())

      // 预加载页面相关资源
      predictAndPreloadPageResources(request.url)
    }

    return response
  } catch (error) {
    console.error('Page request failed, trying cache:', error)

    // 先尝试预加载缓存
    const preloadCache = await caches.open(PRELOAD_CACHE)
    const preloadedResponse = await preloadCache.match(request)
    if (preloadedResponse) {
      return preloadedResponse
    }

    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    if (request.url === self.location.origin + '/') {
      return getOfflinePage()
    }

    throw error
  }
}

// 带预加载的其他请求处理
async function handleOtherRequestsWithPreload(request) {
  try {
    const response = await fetch(request)

    if (response.ok && request.method === 'GET') {
      const cache = await caches.open(RUNTIME_CACHE)
      cache.put(request, response.clone())
    }

    return response
  } catch (error) {
    // 优先使用预加载缓存
    const preloadCache = await caches.open(PRELOAD_CACHE)
    const preloadedResponse = await preloadCache.match(request)
    if (preloadedResponse) {
      return preloadedResponse
    }

    const cachedResponse = await caches.match(request)
    return cachedResponse || Response.error()
  }
}

// 优先级获取并缓存
async function fetchAndCacheWithPriority(request, priority = 'high') {
  try {
    const response = await fetch(request)

    if (response.ok) {
      const cacheName = priority === 'high' ? PRELOAD_CACHE : RUNTIME_CACHE
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }

    return response
  } catch (error) {
    console.error('Failed to fetch and cache:', error)
    throw error
  }
}

// 预测和预加载相关API
function predictAndPreloadRelatedAPIs(apiUrl) {
  if (apiUrl.includes('/api/views')) {
    addToPreloadQueue('/api/analytics/summary')
  } else if (apiUrl.includes('/api/search')) {
    addToPreloadQueue('/api/analytics/popular')
  }
}

// 预测和预加载页面资源
function predictAndPreloadPageResources(pageUrl) {
  const url = new URL(pageUrl)

  if (url.pathname === '/') {
    // 首页访问，预加载博客列表
    addToPreloadQueue('/blog')
    addToPreloadQueue('/api/views')
  } else if (url.pathname === '/blog') {
    // 博客列表页，预加载热门文章API
    addToPreloadQueue('/api/analytics/popular?limit=5')
  } else if (url.pathname.startsWith('/blog/')) {
    // 文章详情页，预加载相关文章
    addToPreloadQueue('/api/analytics/popular?limit=3')
    addToPreloadQueue('/about')
  }
}

// 用户行为记录和分析
let userPatterns = {}

function recordUserPattern(pathname) {
  userPatterns[pathname] = (userPatterns[pathname] || 0) + 1

  // 基于访问频率调整预加载策略
  if (userPatterns[pathname] > 3) {
    // 频繁访问的页面优先预加载
    addToPreloadQueue(pathname)
  }
}

// 清理预加载缓存的定时任务
setInterval(
  () => {
    cleanupPreloadCache()
  },
  30 * 60 * 1000
) // 每30分钟清理一次

async function cleanupPreloadCache() {
  try {
    const cache = await caches.open(PRELOAD_CACHE)
    const requests = await cache.keys()

    // 保留最近30分钟内的缓存
    const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000

    for (const request of requests) {
      const response = await cache.match(request)
      const cacheTime = response?.headers.get('sw-cache-time')

      if (cacheTime && parseInt(cacheTime) < thirtyMinutesAgo) {
        await cache.delete(request)
        console.log('Cleaned up old preload cache:', request.url)
      }
    }
  } catch (error) {
    console.error('Failed to cleanup preload cache:', error)
  }
}
