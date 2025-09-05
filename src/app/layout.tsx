import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Footer from '@/components/Footer'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import Header from '@/components/Header'
import OfflineIndicator from '@/components/OfflineIndicator'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'
import PWAUpdateBanner from '@/components/PWAUpdateBanner'
import ReadingProgress from '@/components/ReadingProgress'
import ResourcePreloader from '@/components/ResourcePreloader'
import ScrollToTop from '@/components/ScrollToTop'
import SEOOptimizer from '@/components/SEOOptimizer'
import { ThemeProvider } from '@/components/ThemeProvider'
import { siteConfig } from '@/lib/config'
import { getDefaultMetadata } from '@/lib/metadata'
import { viewport as defaultViewport } from '@/lib/viewport'

const inter = Inter({ subsets: ['latin'] })

// 使用增强的元数据生成系统
export const metadata: Metadata = {
  ...getDefaultMetadata(),
  metadataBase: new URL(process.env.SITE_URL || siteConfig.url),

  // 模板设置 - 允许子页面自定义标题
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },

  // 增强的robots设置
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // RSS和替代格式
  alternates: {
    canonical: process.env.SITE_URL || siteConfig.url,
    ...(siteConfig.features.enableRss && {
      types: {
        'application/rss+xml': `${process.env.SITE_URL || siteConfig.url}/feed.xml`,
      },
    }),
    languages: {
      'zh-CN': process.env.SITE_URL || siteConfig.url,
    },
  },

  // 验证标签
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    other: {
      'baidu-site-verification': [process.env.BAIDU_SITE_VERIFICATION || ''],
      'msvalidate.01': [process.env.BING_SITE_VERIFICATION || ''],
    },
  },

  // 分类
  category: 'Technology',

  // 应用程序信息
  applicationName: siteConfig.name,

  // 引用策略
  referrer: 'origin-when-cross-origin',

  // 格式检测
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false,
    url: false,
  },

  // 其他有用的元数据
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'format-detection': 'telephone=no',
    'msapplication-TileColor': '#3b82f6',
    'msapplication-config': '/browserconfig.xml',
  },
}

// 导出viewport配置 (Next.js 15+)
export const viewport: Viewport = defaultViewport

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='zh-CN' suppressHydrationWarning>
      <head>
        {/* 预连接重要资源 */}
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link
          rel='preconnect'
          href='https://fonts.gstatic.com'
          crossOrigin='anonymous'
        />
        <link rel='preconnect' href='https://www.googletagmanager.com' />
        <link rel='preconnect' href='https://giscus.app' />

        {/* DNS预取 */}
        <link rel='dns-prefetch' href='https://cdn.jsdelivr.net' />

        {/* 关键CSS预加载 */}
        <link
          rel='preload'
          href='https://cdn.jsdelivr.net/npm/lxgw-wenkai-lite-webfont@1.1.0/style.css'
          as='style'
        />

        {/* 性能优化和主题设置 */}
        <meta
          name='theme-color'
          content='#3b82f6'
          media='(prefers-color-scheme: light)'
        />
        <meta
          name='theme-color'
          content='#1e293b'
          media='(prefers-color-scheme: dark)'
        />
        <meta name='color-scheme' content='light dark' />

        {/* PWA支持 */}
        <link rel='manifest' href='/site.webmanifest' />
        <meta name='mobile-web-app-capable' content='yes' />
        <meta name='apple-mobile-web-app-capable' content='yes' />
        <meta
          name='apple-mobile-web-app-status-bar-style'
          content='black-translucent'
        />
        <meta name='apple-mobile-web-app-title' content={siteConfig.name} />

        {/* Microsoft Tiles */}
        <meta name='msapplication-TileColor' content='#3b82f6' />
        <meta name='msapplication-TileImage' content='/ms-icon-144x144.png' />
      </head>
      <body className={inter.className}>
        <GoogleAnalytics />
        <SEOOptimizer />
        <ResourcePreloader />
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <PWAUpdateBanner />
          <ReadingProgress color='#3b82f6' height={3} />
          <div className='relative min-h-screen flex flex-col'>
            <Header />
            <main
              id='main-content'
              className='flex-1'
              role='main'
              aria-label='主要内容'
            >
              {children}
            </main>
            <Footer />
            <ScrollToTop threshold={300} />
            <OfflineIndicator />
            <PWAInstallPrompt />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
