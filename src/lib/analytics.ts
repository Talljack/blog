import { event as gtag } from '@/components/GoogleAnalytics'

// 发送页面浏览事件到Google Analytics
export const sendPageView = (slug: string, viewCount: number) => {
  gtag({
    action: 'page_view',
    category: 'Blog',
    label: slug,
    value: viewCount,
  })
}

// 发送浏览量统计事件到Google Analytics
export const sendViewCountEvent = (
  slug: string,
  viewCount: number,
  isNewView: boolean = false
) => {
  gtag({
    action: isNewView ? 'view_increment' : 'view_count',
    category: 'Blog Metrics',
    label: slug,
    value: viewCount,
  })
}

// 批量同步所有浏览量数据到Google Analytics
export const syncViewsToAnalytics = async () => {
  try {
    const response = await fetch('/api/views')
    if (response.ok) {
      const data = await response.json()
      const viewsData = data.success ? data.data : data

      // 为每个文章发送浏览量数据到GA
      Object.entries(viewsData).forEach(([slug, views]) => {
        gtag({
          action: 'bulk_sync',
          category: 'Blog Metrics',
          label: slug,
          value: views as number,
        })
      })

      console.log('Views data synced to Google Analytics:', viewsData)
    }
  } catch (error) {
    console.error('Error syncing views to Analytics:', error)
  }
}

// 发送自定义维度数据（如果需要更详细的分析）
export const sendCustomDimensions = (
  slug: string,
  metadata: {
    readTime?: number
    wordCount?: number
    tags?: string[]
    author?: string
  }
) => {
  gtag({
    action: 'page_metadata',
    category: 'Content Analysis',
    label: slug,
    value: metadata.wordCount || 0,
  })
}
