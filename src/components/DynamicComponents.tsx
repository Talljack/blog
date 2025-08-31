import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

// 动态导入重型组件，减少初始包大小
export const DynamicRelatedPosts = dynamic(() => import('./RelatedPosts'), {
  loading: () => (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div className='h-6 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse' />
        <Loader2 className='w-4 h-4 text-gray-400 animate-spin' />
      </div>
      <div className='space-y-3'>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className='animate-pulse'>
            <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2' />
            <div className='h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2' />
          </div>
        ))}
      </div>
    </div>
  ),
  ssr: false, // 禁用服务端渲染，提升首屏性能
})

export const DynamicNewsletter = dynamic(() => import('./Newsletter'), {
  loading: () => (
    <div className='bg-gray-100 dark:bg-gray-800 rounded-lg p-6 animate-pulse'>
      <div className='text-center mb-6'>
        <div className='w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto mb-4' />
        <div className='h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mx-auto mb-2' />
        <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto' />
      </div>
      <div className='space-y-4'>
        <div className='h-12 bg-gray-200 dark:bg-gray-700 rounded' />
        <div className='h-12 bg-gray-200 dark:bg-gray-700 rounded' />
      </div>
    </div>
  ),
  ssr: false,
})

export const DynamicTableOfContents = dynamic(
  () => import('./TableOfContents'),
  {
    loading: () => (
      <div className='space-y-2 animate-pulse'>
        <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4' />
        <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 ml-4' />
        <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 ml-8' />
        <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 ml-4' />
        <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4' />
      </div>
    ),
    ssr: false,
  }
)

export const DynamicShareButtons = dynamic(() => import('./ShareButtons'), {
  loading: () => (
    <div className='flex items-center gap-2 animate-pulse'>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className='w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded' />
      ))}
    </div>
  ),
  ssr: false,
})

export const DynamicComments = dynamic(() => import('./Comments'), {
  loading: () => (
    <div className='space-y-4 animate-pulse'>
      <div className='h-6 bg-gray-200 dark:bg-gray-700 rounded w-24' />
      <div className='h-32 bg-gray-200 dark:bg-gray-700 rounded' />
    </div>
  ),
  ssr: false,
})

export const DynamicMobileReadingMode = dynamic(
  () => import('./MobileReadingMode'),
  {
    loading: () => (
      <div className='fixed bottom-4 right-4 w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse' />
    ),
    ssr: false,
  }
)

export const DynamicScrollToTop = dynamic(() => import('./ScrollToTop'), {
  loading: () => null, // 滚动按钮可以无loading状态
  ssr: false,
})

export const DynamicReadingProgress = dynamic(
  () => import('./ReadingProgress'),
  {
    loading: () => null, // 进度条可以无loading状态
    ssr: false,
  }
)

// 高阶组件：为动态组件添加错误边界和Suspense
export function withDynamicLoading<T extends {}>(
  Component: React.ComponentType<T>,
  fallback?: React.ReactNode
) {
  return function DynamicWrapper(props: T) {
    return (
      <Suspense
        fallback={
          fallback || (
            <div className='animate-pulse h-20 bg-gray-200 dark:bg-gray-700 rounded' />
          )
        }
      >
        <Component {...props} />
      </Suspense>
    )
  }
}

// 预加载函数：在用户交互前预加载重要组件
export const preloadComponents = {
  relatedPosts: () => import('./RelatedPosts'),
  newsletter: () => import('./Newsletter'),
  tableOfContents: () => import('./TableOfContents'),
  shareButtons: () => import('./ShareButtons'),
  comments: () => import('./Comments'),
}

// 智能预加载：基于用户行为预加载组件
export function useIntelligentPreloading() {
  const preloadOnScroll = (threshold = 0.7) => {
    const handleScroll = () => {
      const scrollPercent =
        window.scrollY / (document.body.scrollHeight - window.innerHeight)
      if (scrollPercent > threshold) {
        // 用户滚动超过70%时预加载相关组件
        preloadComponents.relatedPosts()
        preloadComponents.newsletter()
        window.removeEventListener('scroll', handleScroll)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }

  const preloadOnIdle = (timeout = 2000) => {
    const timeoutId = setTimeout(() => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          preloadComponents.tableOfContents()
          preloadComponents.shareButtons()
        })
      } else {
        // 降级方案
        setTimeout(() => {
          preloadComponents.tableOfContents()
          preloadComponents.shareButtons()
        }, 0)
      }
    }, timeout)

    return () => clearTimeout(timeoutId)
  }

  return { preloadOnScroll, preloadOnIdle }
}
