import { Metadata } from 'next'
import AnalyticsDashboard from '@/components/AnalyticsDashboard'
import { generatePageMetadata } from '@/lib/metadata'
import { hasAdminAccess } from '@/lib/auth'
import { headers } from 'next/headers'

export const metadata: Metadata = generatePageMetadata(
  '访问分析',
  '博客访问数据分析面板，查看文章浏览量、热门内容、标签统计等详细数据',
  {
    path: '/analytics',
    keywords: ['分析', '统计', '浏览量', '数据'],
    noIndex: true, // 分析页面通常不需要被搜索引擎索引
  }
)

import AdminAuthSuspense from '@/components/AdminAuthSuspense'

export default function AnalyticsPage() {
  return (
    <AdminAuthSuspense>
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2'>
            访问分析
          </h1>
          <p className='text-gray-600 dark:text-gray-400'>
            查看博客的访问数据、热门文章和趋势分析
          </p>
        </div>

        <AnalyticsDashboard showTitle={false} />
      </main>
    </AdminAuthSuspense>
  )
}
