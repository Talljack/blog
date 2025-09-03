'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  TrendingUp,
  TrendingDown,
  Eye,
  FileText,
  Calendar,
  Tag,
  BarChart3,
  Users,
  Clock,
  RefreshCw,
  ArrowRight,
  Activity,
  Download,
} from 'lucide-react'

// 分析数据接口
interface AnalyticsData {
  totalViews: number
  totalPosts: number
  averageViews: number
  topPosts: Array<{
    slug: string
    title: string
    views: number
    date: string
    tags: string[]
  }>
  recentPosts: Array<{
    slug: string
    title: string
    views: number
    date: string
  }>
  viewsGrowth: Array<{
    date: string
    views: number
  }>
  tagAnalytics: Array<{
    tag: string
    postCount: number
    totalViews: number
    averageViews: number
  }>
  monthlyStats: {
    currentMonth: number
    lastMonth: number
    growth: number
  }
}

interface AnalyticsDashboardProps {
  className?: string
  showTitle?: boolean
}

// 统计卡片组件
function StatCard({
  title,
  value,
  change,
  icon: Icon,
  trend,
}: {
  title: string
  value: string | number
  change?: string
  icon: any
  trend?: 'up' | 'down' | 'neutral'
}) {
  return (
    <div className='bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-3'>
          <div className='p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full'>
            <Icon className='w-6 h-6 text-blue-600 dark:text-blue-400' />
          </div>
          <div>
            <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
              {title}
            </p>
            <p className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
          </div>
        </div>

        {change && (
          <div
            className={`flex items-center space-x-1 ${
              trend === 'up'
                ? 'text-green-600 dark:text-green-400'
                : trend === 'down'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {trend === 'up' && <TrendingUp className='w-4 h-4' />}
            {trend === 'down' && <TrendingDown className='w-4 h-4' />}
            <span className='text-sm font-medium'>{change}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// 简化版本的图表组件
function SimpleChart({
  data,
}: {
  data: Array<{ date: string; views: number }>
}) {
  const maxViews = Math.max(...data.map(d => d.views))

  return (
    <div className='bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
          浏览量趋势
        </h3>
        <Activity className='w-5 h-5 text-gray-400' />
      </div>

      <div className='space-y-2'>
        {data.slice(-7).map((item, index) => {
          const width = maxViews > 0 ? (item.views / maxViews) * 100 : 0
          const date = new Date(item.date).toLocaleDateString('zh-CN', {
            month: 'short',
            day: 'numeric',
          })

          return (
            <div key={item.date} className='flex items-center space-x-3'>
              <span className='text-xs text-gray-500 w-12 flex-shrink-0'>
                {date}
              </span>
              <div className='flex-1 bg-gray-100 dark:bg-gray-700 h-6 rounded-full overflow-hidden'>
                <div
                  className='h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500 ease-out'
                  style={{ width: `${width}%` }}
                />
              </div>
              <span className='text-xs text-gray-600 dark:text-gray-400 w-8 text-right'>
                {item.views}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function AnalyticsDashboard({
  className = '',
  showTitle = true,
}: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [exporting, setExporting] = useState(false)

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)

      // 获取认证token
      const authToken = localStorage.getItem('admin_auth')
      const url = authToken
        ? `/api/analytics?auth=${encodeURIComponent(authToken)}`
        : '/api/analytics'

      const response = await fetch(url)
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('访问被拒绝，请重新登录')
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      if (result.success) {
        setData(result.data)
        setLastUpdated(new Date())
      } else {
        throw new Error(result.message || '获取数据失败')
      }
    } catch (err) {
      console.error('获取分析数据失败:', err)
      setError(err instanceof Error ? err.message : '获取数据失败')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (format: 'json' | 'csv' = 'json') => {
    try {
      setExporting(true)

      // 获取认证token
      const authToken = localStorage.getItem('admin_auth')
      const params = new URLSearchParams({
        format,
        download: 'true',
      })
      if (authToken) {
        params.append('auth', authToken)
      }

      const url = `/api/analytics/export?${params.toString()}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error('导出失败')
      }

      // 创建下载链接
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `blog-analytics-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('导出失败:', error)
      alert('导出失败，请稍后重试')
    } finally {
      setExporting(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        {showTitle && (
          <div className='flex items-center justify-between'>
            <h2 className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
              访问分析
            </h2>
            <div className='animate-spin'>
              <RefreshCw className='w-5 h-5 text-gray-400' />
            </div>
          </div>
        )}

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className='bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 animate-pulse'
            >
              <div className='flex items-center space-x-3'>
                <div className='w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full' />
                <div className='space-y-2'>
                  <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-20' />
                  <div className='h-6 bg-gray-200 dark:bg-gray-700 rounded w-16' />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md mx-auto'>
          <h3 className='text-lg font-medium text-red-900 dark:text-red-100 mb-2'>
            加载失败
          </h3>
          <p className='text-red-600 dark:text-red-400 mb-4'>{error}</p>
          <button
            onClick={fetchAnalytics}
            className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors'
          >
            重新加载
          </button>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <p className='text-gray-600 dark:text-gray-400'>暂无分析数据</p>
      </div>
    )
  }

  const growthTrend =
    data.monthlyStats.growth > 0
      ? 'up'
      : data.monthlyStats.growth < 0
        ? 'down'
        : 'neutral'

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 头部 */}
      {showTitle && (
        <div className='flex items-center justify-between'>
          <h2 className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
            访问分析
          </h2>
          <div className='flex items-center space-x-4'>
            {lastUpdated && (
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                最后更新: {lastUpdated.toLocaleTimeString('zh-CN')}
              </p>
            )}

            {/* 导出按钮组 */}
            <div className='flex items-center space-x-2'>
              <div className='relative group'>
                <button
                  className='p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors'
                  title='导出数据'
                >
                  <Download
                    className={`w-5 h-5 ${exporting ? 'animate-bounce' : ''}`}
                  />
                </button>

                {/* 导出选项下拉菜单 */}
                <div className='absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10'>
                  <button
                    onClick={() => handleExport('json')}
                    disabled={exporting}
                    className='w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-lg disabled:opacity-50'
                  >
                    JSON 格式
                  </button>
                  <button
                    onClick={() => handleExport('csv')}
                    disabled={exporting}
                    className='w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 last:rounded-b-lg disabled:opacity-50'
                  >
                    CSV 格式
                  </button>
                </div>
              </div>

              <button
                onClick={fetchAnalytics}
                className='p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors'
                title='刷新数据'
              >
                <RefreshCw className='w-5 h-5' />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 统计卡片 */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <StatCard
          title='总浏览量'
          value={data.totalViews}
          change={`${Math.abs(data.monthlyStats.growth)}%`}
          icon={Eye}
          trend={growthTrend}
        />
        <StatCard title='文章总数' value={data.totalPosts} icon={FileText} />
        <StatCard
          title='平均浏览量'
          value={data.averageViews}
          icon={BarChart3}
        />
        <StatCard
          title='本月浏览'
          value={data.monthlyStats.currentMonth}
          change={`${Math.abs(data.monthlyStats.growth)}%`}
          icon={Calendar}
          trend={growthTrend}
        />
      </div>

      {/* 图表和列表 */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* 趋势图 */}
        <SimpleChart data={data.viewsGrowth} />

        {/* 热门标签 */}
        <div className='bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
              热门标签
            </h3>
            <Tag className='w-5 h-5 text-gray-400' />
          </div>

          <div className='space-y-3'>
            {data.tagAnalytics.slice(0, 5).map((tag, index) => (
              <div key={tag.tag} className='flex items-center justify-between'>
                <div className='flex items-center space-x-3'>
                  <span className='w-6 h-6 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-medium'>
                    {index + 1}
                  </span>
                  <span className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                    {tag.tag}
                  </span>
                </div>
                <div className='text-right'>
                  <p className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                    {tag.totalViews.toLocaleString()}
                  </p>
                  <p className='text-xs text-gray-500 dark:text-gray-400'>
                    {tag.postCount} 篇文章
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 热门文章和最新文章 */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* 热门文章 */}
        <div className='bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
              热门文章
            </h3>
            <TrendingUp className='w-5 h-5 text-gray-400' />
          </div>

          <div className='space-y-4'>
            {data.topPosts.slice(0, 5).map((post, index) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className='block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group'
              >
                <div className='flex items-start justify-between'>
                  <div className='flex-1 min-w-0 mr-3'>
                    <div className='flex items-center space-x-2 mb-1'>
                      <span className='w-5 h-5 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded text-xs font-bold flex items-center justify-center'>
                        {index + 1}
                      </span>
                      <p className='text-sm font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400'>
                        {post.title}
                      </p>
                    </div>
                    <p className='text-xs text-gray-500 dark:text-gray-400'>
                      {new Date(post.date).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                  <div className='text-right flex-shrink-0'>
                    <p className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                      {post.views.toLocaleString()}
                    </p>
                    <p className='text-xs text-gray-500 dark:text-gray-400'>
                      浏览
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* 最新文章 */}
        <div className='bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
              最新文章
            </h3>
            <Clock className='w-5 h-5 text-gray-400' />
          </div>

          <div className='space-y-4'>
            {data.recentPosts.map(post => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className='block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group'
              >
                <div className='flex items-start justify-between'>
                  <div className='flex-1 min-w-0 mr-3'>
                    <p className='text-sm font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-1'>
                      {post.title}
                    </p>
                    <p className='text-xs text-gray-500 dark:text-gray-400'>
                      {new Date(post.date).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                  <div className='text-right flex-shrink-0'>
                    <p className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                      {post.views.toLocaleString()}
                    </p>
                    <p className='text-xs text-gray-500 dark:text-gray-400'>
                      浏览
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
