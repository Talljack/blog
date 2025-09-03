// Service Worker for PWA
const CACHE_NAME = 'blog-pwa-v1.0.0'
const RUNTIME_CACHE = 'runtime-cache-v1'

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
]

// 安装事件 - 缓存核心资源
self.addEventListener('install', event => {
  console.log('Service Worker installing...')

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache => {
        console.log('Caching static resources')
        return cache.addAll(STATIC_CACHE_URLS)
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
