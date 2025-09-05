'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import {
  Eye,
  FileText,
  TrendingUp,
  Calendar,
  BarChart3,
  RefreshCw,
  Download,
  Lock,
  Unlock,
} from 'lucide-react'

// 动态导入图表组件以提高初始加载性能
const TrendChart = dynamic(() => import('@/components/charts/TrendChart'), {
  loading: () => (
    <div className='animate-pulse bg-gray-200 dark:bg-gray-700 h-64 rounded-lg' />
  ),
})

const PopularPostsChart = dynamic(
  () => import('@/components/charts/PopularPostsChart'),
  {
    loading: () => (
      <div className='animate-pulse bg-gray-200 dark:bg-gray-700 h-64 rounded-lg' />
    ),
  }
)

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

// 统计卡片组件
function StatCard({
  title,
  value,
  change,
  icon: Icon,
  trend,
  loading = false,
}: {
  title: string
  value: string | number
  change?: string
  icon: React.ComponentType<{ className?: string }>
  trend?: 'up' | 'down' | 'neutral'
  loading?: boolean
}) {
  if (loading) {
    return (
      <div className='bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm animate-pulse'>
        <div className='flex items-center space-x-3'>
          <div className='w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full' />
          <div className='space-y-2'>
            <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-20' />
            <div className='h-6 bg-gray-200 dark:bg-gray-700 rounded w-16' />
          </div>
        </div>
      </div>
    )
  }

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
            {trend === 'down' && <TrendingUp className='w-4 h-4 rotate-180' />}
            <span className='text-sm font-medium'>{change}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  // 检查认证状态
  useEffect(() => {
    const storedAuth = localStorage.getItem('admin_auth')
    if (storedAuth) {
      try {
        const credentials = JSON.parse(atob(storedAuth))
        if (credentials.username && credentials.password) {
          setUsername(credentials.username)
          setPassword(credentials.password)
          setIsAuthenticated(true)
        }
      } catch (error) {
        localStorage.removeItem('admin_auth')
      }
    }
  }, [])

  // 获取分析数据
  const fetchAnalytics = async (user?: string, pass?: string) => {
    try {
      setLoading(true)
      setError(null)

      let url = '/api/analytics'
      if (user && pass) {
        const params = new URLSearchParams({
          username: user,
          password: pass,
        })
        url = `/api/analytics?${params.toString()}`
      } else if (username && password) {
        const params = new URLSearchParams({
          username: username,
          password: password,
        })
        url = `/api/analytics?${params.toString()}`
      }

      const response = await fetch(url)

      if (response.status === 403) {
        setIsAuthenticated(false)
        setError('需要管理员权限访问分析数据')
        return
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      if (result.success) {
        setData(result.data)
        setLastUpdated(new Date())
        setIsAuthenticated(true)

        // 保存认证信息
        if (user && pass) {
          const authData = btoa(
            JSON.stringify({ username: user, password: pass })
          )
          localStorage.setItem('admin_auth', authData)
          setUsername(user)
          setPassword(pass)
        }
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

  // 认证处理
  const handleAuth = () => {
    if (username.trim() && password.trim()) {
      fetchAnalytics(username.trim(), password.trim())
    }
  }

  // 登出
  const handleLogout = () => {
    localStorage.removeItem('admin_auth')
    setUsername('')
    setPassword('')
    setIsAuthenticated(false)
    setData(null)
  }

  // 初始加载
  useEffect(() => {
    if (isAuthenticated && username && password) {
      fetchAnalytics(username, password)
    } else {
      // 尝试无认证访问
      fetchAnalytics()
    }
  }, [isAuthenticated, username, password])

  // 导出数据
  const handleExport = async (format: 'json' | 'csv' = 'json') => {
    try {
      const params = new URLSearchParams({
        format,
        download: 'true',
      })
      if (username && password) {
        params.append('username', username)
        params.append('password', password)
      }

      const url = `/api/analytics/export?${params.toString()}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error('导出失败')
      }

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
    }
  }

  // 认证界面
  if (!isAuthenticated && error?.includes('认证')) {
    return (
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4'>
        <div className='max-w-md w-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm'>
          <div className='text-center mb-6'>
            <div className='mx-auto w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4'>
              <Lock className='w-6 h-6 text-blue-600 dark:text-blue-400' />
            </div>
            <h2 className='text-xl font-bold text-gray-900 dark:text-gray-100'>
              访问分析
            </h2>
            <p className='text-gray-600 dark:text-gray-400 mt-2'>
              请输入管理员账号查看分析数据
            </p>
          </div>

          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                用户名
              </label>
              <input
                type='text'
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder='请输入用户名'
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                密码
              </label>
              <input
                type='password'
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder='请输入密码'
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                onKeyPress={e => e.key === 'Enter' && handleAuth()}
              />
            </div>

            <button
              onClick={handleAuth}
              disabled={!username.trim() || !password.trim()}
              className='w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            >
              登入管理后台
            </button>

            {error && (
              <div className='text-sm text-red-600 dark:text-red-400 text-center'>
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // 加载状态
  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900 py-8'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between mb-8'>
            <h1 className='text-3xl font-bold text-gray-900 dark:text-gray-100'>
              访问分析
            </h1>
            <div className='animate-spin'>
              <RefreshCw className='w-5 h-5 text-gray-400' />
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
            {[...Array(4)].map((_, i) => (
              <StatCard
                key={i}
                title='加载中...'
                value='--'
                icon={Eye}
                loading={true}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // 错误状态
  if (error && !error.includes('认证')) {
    return (
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4'>
        <div className='text-center max-w-md'>
          <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6'>
            <h3 className='text-lg font-medium text-red-900 dark:text-red-100 mb-2'>
              加载失败
            </h3>
            <p className='text-red-600 dark:text-red-400 mb-4'>{error}</p>
            <button
              onClick={() => fetchAnalytics(username, password)}
              className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors'
            >
              重新加载
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4'>
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
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 py-8'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* 页面头部 */}
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900 dark:text-gray-100'>
              访问分析
            </h1>
            {lastUpdated && (
              <p className='text-sm text-gray-500 dark:text-gray-400 mt-2'>
                最后更新: {lastUpdated.toLocaleString('zh-CN')}
              </p>
            )}
          </div>

          <div className='flex items-center space-x-4'>
            {/* 导出按钮 */}
            <div className='relative group'>
              <button className='p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors border border-gray-200 dark:border-gray-600 rounded-lg'>
                <Download className='w-5 h-5' />
              </button>
              <div className='absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10'>
                <button
                  onClick={() => handleExport('json')}
                  className='w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-lg'
                >
                  JSON 格式
                </button>
                <button
                  onClick={() => handleExport('csv')}
                  className='w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 last:rounded-b-lg'
                >
                  CSV 格式
                </button>
              </div>
            </div>

            {/* 刷新按钮 */}
            <button
              onClick={() => fetchAnalytics(username, password)}
              className='p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors border border-gray-200 dark:border-gray-600 rounded-lg'
              title='刷新数据'
            >
              <RefreshCw className='w-5 h-5' />
            </button>

            {/* 登出按钮 */}
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className='p-2 text-gray-400 hover:text-red-600 transition-colors border border-gray-200 dark:border-gray-600 rounded-lg'
                title='退出登录'
              >
                <Unlock className='w-5 h-5' />
              </button>
            )}
          </div>
        </div>

        {/* 统计卡片 */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
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

        {/* 图表区域 */}
        <div className='grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8'>
          {/* 趋势图表 */}
          <TrendChart data={data.viewsGrowth} className='xl:col-span-2' />
        </div>

        {/* 热门内容 */}
        <div className='grid grid-cols-1 xl:grid-cols-2 gap-6'>
          <PopularPostsChart posts={data.topPosts} limit={10} />

          {/* 标签分析 */}
          <div className='bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4'>
              热门标签
            </h3>
            <div className='space-y-3'>
              {data.tagAnalytics.slice(0, 10).map((tag, index) => {
                const maxViews = Math.max(
                  ...data.tagAnalytics.map(t => t.totalViews)
                )
                const widthPercent =
                  maxViews > 0 ? (tag.totalViews / maxViews) * 100 : 0

                return (
                  <div
                    key={tag.tag}
                    className='flex items-center justify-between'
                  >
                    <div className='flex items-center space-x-3'>
                      <span className='w-6 h-6 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center text-xs font-medium'>
                        {index + 1}
                      </span>
                      <div>
                        <p className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                          {tag.tag}
                        </p>
                        <div className='w-32 bg-gray-100 dark:bg-gray-700 h-1 rounded-full overflow-hidden mt-1'>
                          <div
                            className='h-full bg-purple-500 rounded-full transition-all duration-300'
                            style={{ width: `${widthPercent}%` }}
                          />
                        </div>
                      </div>
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
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
