'use client'

import Script from 'next/script'

interface CriticalResourcePreloaderProps {
  priority?: 'high' | 'low'
}

export default function CriticalResourcePreloader({
  priority = 'high',
}: CriticalResourcePreloaderProps) {
  return (
    <>
      {/* 关键CSS预加载 */}
      <link
        rel='preload'
        href='/fonts/inter-var.woff2'
        as='font'
        type='font/woff2'
        crossOrigin='anonymous'
      />

      {/* 预连接重要的外部域名 */}
      <link rel='preconnect' href='https://fonts.googleapis.com' />
      <link
        rel='preconnect'
        href='https://fonts.gstatic.com'
        crossOrigin='anonymous'
      />
      <link rel='preconnect' href='https://www.googletagmanager.com' />
      <link rel='preconnect' href='https://giscus.app' />
      <link rel='preconnect' href='https://cdn.jsdelivr.net' />

      {/* DNS预取非关键资源 */}
      <link rel='dns-prefetch' href='https://unpkg.com' />
      <link rel='dns-prefetch' href='https://cdnjs.cloudflare.com' />

      {/* 模块预加载 */}
      {priority === 'high' && (
        <>
          <link
            rel='modulepreload'
            href='/_next/static/chunks/framework-*.js'
            as='script'
          />
          <link
            rel='modulepreload'
            href='/_next/static/chunks/main-*.js'
            as='script'
          />
        </>
      )}

      {/* 关键图片预加载 */}
      <link
        rel='preload'
        href='/images/hero-bg.webp'
        as='image'
        type='image/webp'
      />

      {/* Service Worker注册 */}
      <Script
        id='sw-register'
        strategy='afterInteractive'
        dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator && 'PushManager' in window) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js')
                  .then(function(registration) {
                    console.log('SW registered: ', registration);
                  })
                  .catch(function(registrationError) {
                    console.log('SW registration failed: ', registrationError);
                  });
              });
            }
          `,
        }}
      />

      {/* 预加载关键路由 */}
      <Script
        id='route-preloader'
        strategy='afterInteractive'
        dangerouslySetInnerHTML={{
          __html: `
            // 预加载关键路由
            const criticalRoutes = ['/', '/blog', '/about'];
            
            // 使用Intersection Observer延迟预加载
            if ('IntersectionObserver' in window) {
              const preloadRoutes = () => {
                criticalRoutes.forEach(route => {
                  const link = document.createElement('link');
                  link.rel = 'prefetch';
                  link.href = route;
                  document.head.appendChild(link);
                });
              };

              // 页面加载完成后延迟预加载
              setTimeout(preloadRoutes, 2000);
            }
          `,
        }}
      />
    </>
  )
}
