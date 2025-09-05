'use client'

import Link from 'next/link'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { TrendingUp, ExternalLink } from 'lucide-react'

interface PopularPost {
  slug: string
  title: string
  views: number
  date: string
  tags?: string[]
}

interface PopularPostsChartProps {
  posts: PopularPost[]
  title?: string
  className?: string
  showChart?: boolean
  limit?: number
}

export default function PopularPostsChart({
  posts,
  title = '热门文章',
  className = '',
  showChart = true,
  limit = 10,
}: PopularPostsChartProps) {
  const displayPosts = posts.slice(0, limit)

  // 准备图表数据
  const chartData = displayPosts.map((post, index) => ({
    name:
      post.title.length > 15 ? `${post.title.substring(0, 15)}...` : post.title,
    fullTitle: post.title,
    views: post.views,
    slug: post.slug,
    rank: index + 1,
  }))

  // 自定义工具提示
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className='bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-w-xs'>
          <p className='text-sm font-medium text-gray-900 dark:text-gray-100 mb-1'>
            {data.fullTitle}
          </p>
          <p className='text-sm text-blue-600 dark:text-blue-400'>
            浏览量: {data.views.toLocaleString()}
          </p>
          <p className='text-xs text-gray-500 dark:text-gray-400'>
            排名第 {data.rank}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div
      className={`bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm ${className}`}
    >
      {/* 头部 */}
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center space-x-3'>
          <div className='p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg'>
            <TrendingUp className='w-5 h-5 text-orange-600 dark:text-orange-400' />
          </div>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
            {title}
          </h3>
        </div>
        <div className='text-sm text-gray-500 dark:text-gray-400'>
          Top {displayPosts.length}
        </div>
      </div>

      {/* 图表视图 */}
      {showChart && (
        <div className='h-64 mb-6'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              layout='horizontal'
            >
              <CartesianGrid strokeDasharray='3 3' stroke='#E5E7EB' />
              <XAxis
                type='number'
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B7280' }}
              />
              <YAxis
                type='category'
                dataKey='name'
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#6B7280' }}
                width={100}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey='views'
                fill='#F97316'
                radius={[0, 4, 4, 0]}
                opacity={0.8}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 列表视图 */}
      <div className='space-y-3'>
        {displayPosts.map((post, index) => {
          const maxViews = Math.max(...displayPosts.map(p => p.views))
          const widthPercent = maxViews > 0 ? (post.views / maxViews) * 100 : 0

          return (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className='block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group'
            >
              <div className='flex items-start justify-between mb-2'>
                <div className='flex items-center space-x-3 flex-1 min-w-0'>
                  <span className='w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0'>
                    {index + 1}
                  </span>
                  <div className='min-w-0 flex-1'>
                    <p className='text-sm font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors'>
                      {post.title}
                    </p>
                    <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                      {new Date(post.date).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                </div>
                <div className='flex items-center space-x-2 flex-shrink-0'>
                  <div className='text-right'>
                    <p className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                      {post.views.toLocaleString()}
                    </p>
                    <p className='text-xs text-gray-500 dark:text-gray-400'>
                      浏览量
                    </p>
                  </div>
                  <ExternalLink className='w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity' />
                </div>
              </div>

              {/* 可视化进度条 */}
              <div className='w-full bg-gray-100 dark:bg-gray-700 h-1 rounded-full overflow-hidden'>
                <div
                  className='h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500 ease-out'
                  style={{ width: `${widthPercent}%` }}
                />
              </div>

              {/* 标签 */}
              {post.tags && post.tags.length > 0 && (
                <div className='flex flex-wrap gap-1 mt-2'>
                  {post.tags.slice(0, 3).map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className='px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full'
                    >
                      {tag}
                    </span>
                  ))}
                  {post.tags.length > 3 && (
                    <span className='px-2 py-1 text-xs text-gray-500 dark:text-gray-400'>
                      +{post.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </Link>
          )
        })}
      </div>

      {/* 底部统计 */}
      <div className='mt-6 pt-4 border-t border-gray-200 dark:border-gray-700'>
        <div className='flex items-center justify-between text-sm text-gray-500 dark:text-gray-400'>
          <span>显示前 {displayPosts.length} 篇热门文章</span>
          <span>
            总浏览量:{' '}
            {displayPosts
              .reduce((sum, post) => sum + post.views, 0)
              .toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  )
}
