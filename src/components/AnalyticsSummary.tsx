'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Eye, FileText, TrendingUp, BarChart3 } from 'lucide-react'

// 简化的分析数据接口
interface AnalyticsSummary {
  totalViews: number
  totalPosts: number
  averageViews: number
  monthlyGrowth: number
}

interface AnalyticsSummaryProps {
  className?: string
  showViewAllLink?: boolean
}

export default function AnalyticsSummary({
  className = '',
  showViewAllLink = true,
}: AnalyticsSummaryProps) {
  const [data, setData] = useState<AnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await fetch('/api/analytics')
        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setData({
              totalViews: result.data.totalViews,
              totalPosts: result.data.totalPosts,
              averageViews: result.data.averageViews,
              monthlyGrowth: result.data.monthlyStats.growth,
            })
          }
        }
      } catch (error) {
        console.error('获取分析摘要失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSummary()
  }, [])

  if (loading) {
    return (
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}
      >
        <div className='animate-pulse'>
          <div className='h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4' />
          <div className='grid grid-cols-2 gap-4'>
            {[...Array(4)].map((_, i) => (
              <div key={i} className='space-y-2'>
                <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-16' />
                <div className='h-8 bg-gray-200 dark:bg-gray-700 rounded w-20' />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}
      >
        <p className='text-gray-500 dark:text-gray-400 text-center'>暂无数据</p>
      </div>
    )
  }

  const stats = [
    {
      label: '总浏览量',
      value: data.totalViews.toLocaleString(),
      icon: Eye,
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: '文章数',
      value: data.totalPosts.toString(),
      icon: FileText,
      color: 'text-green-600 dark:text-green-400',
    },
    {
      label: '平均浏览',
      value: data.averageViews.toString(),
      icon: BarChart3,
      color: 'text-purple-600 dark:text-purple-400',
    },
    {
      label: '月增长',
      value: `${data.monthlyGrowth > 0 ? '+' : ''}${data.monthlyGrowth}%`,
      icon: TrendingUp,
      color:
        data.monthlyGrowth > 0
          ? 'text-green-600 dark:text-green-400'
          : 'text-red-600 dark:text-red-400',
    },
  ]

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}
    >
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
          访问统计
        </h3>
        {showViewAllLink && (
          <Link
            href='/analytics'
            className='text-sm text-blue-600 dark:text-blue-400 hover:underline'
          >
            查看详情
          </Link>
        )}
      </div>

      <div className='grid grid-cols-2 gap-4'>
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className='text-center'>
              <div className='flex items-center justify-center mb-2'>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className='text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1'>
                {stat.value}
              </p>
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                {stat.label}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
