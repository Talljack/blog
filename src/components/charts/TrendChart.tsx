'use client'

import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'
import { TrendingUp, Calendar, BarChart3 } from 'lucide-react'

interface TrendData {
  date: string
  views: number
  dayOfWeek?: number
  isWeekend?: boolean
}

interface TrendChartProps {
  data: TrendData[]
  title?: string
  className?: string
  showPeriodToggle?: boolean
}

type ChartType = 'line' | 'area'

export default function TrendChart({
  data,
  title = '访问趋势',
  className = '',
  showPeriodToggle = true,
}: TrendChartProps) {
  const [chartType, setChartType] = useState<ChartType>('area')
  const [period, setPeriod] = useState<7 | 14 | 30>(30)

  // 根据期间筛选数据
  const filteredData = data.slice(-period).map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
    }),
  }))

  // 计算统计信息
  const totalViews = filteredData.reduce((sum, item) => sum + item.views, 0)
  const avgViews =
    filteredData.length > 0 ? Math.round(totalViews / filteredData.length) : 0
  const maxViews =
    filteredData.length > 0
      ? Math.max(...filteredData.map(item => item.views))
      : 0

  // 自定义工具提示
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className='bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg'>
          <p className='text-sm font-medium text-gray-900 dark:text-gray-100'>
            {label}
          </p>
          <p className='text-sm text-blue-600 dark:text-blue-400'>
            浏览量: {payload[0].value.toLocaleString()}
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
          <div className='p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
            <TrendingUp className='w-5 h-5 text-blue-600 dark:text-blue-400' />
          </div>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
            {title}
          </h3>
        </div>

        {showPeriodToggle && (
          <div className='flex items-center space-x-2'>
            {/* 图表类型切换 */}
            <div className='flex border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden'>
              <button
                onClick={() => setChartType('area')}
                className={`px-3 py-1 text-xs font-medium transition-colors ${
                  chartType === 'area'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <BarChart3 className='w-4 h-4' />
              </button>
              <button
                onClick={() => setChartType('line')}
                className={`px-3 py-1 text-xs font-medium transition-colors ${
                  chartType === 'line'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <TrendingUp className='w-4 h-4' />
              </button>
            </div>

            {/* 时间周期切换 */}
            <div className='flex border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden'>
              {[
                { value: 7, label: '7天' },
                { value: 14, label: '14天' },
                { value: 30, label: '30天' },
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setPeriod(option.value as 7 | 14 | 30)}
                  className={`px-3 py-1 text-xs font-medium transition-colors ${
                    period === option.value
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 统计摘要 */}
      <div className='grid grid-cols-3 gap-4 mb-6'>
        <div className='text-center'>
          <p className='text-2xl font-bold text-blue-600 dark:text-blue-400'>
            {totalViews.toLocaleString()}
          </p>
          <p className='text-xs text-gray-500 dark:text-gray-400'>总浏览量</p>
        </div>
        <div className='text-center'>
          <p className='text-2xl font-bold text-green-600 dark:text-green-400'>
            {avgViews.toLocaleString()}
          </p>
          <p className='text-xs text-gray-500 dark:text-gray-400'>日均浏览</p>
        </div>
        <div className='text-center'>
          <p className='text-2xl font-bold text-purple-600 dark:text-purple-400'>
            {maxViews.toLocaleString()}
          </p>
          <p className='text-xs text-gray-500 dark:text-gray-400'>单日最高</p>
        </div>
      </div>

      {/* 图表 */}
      <div className='h-64'>
        <ResponsiveContainer width='100%' height='100%'>
          {chartType === 'area' ? (
            <AreaChart
              data={filteredData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <defs>
                <linearGradient id='colorViews' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#3B82F6' stopOpacity={0.3} />
                  <stop offset='95%' stopColor='#3B82F6' stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray='3 3' stroke='#E5E7EB' />
              <XAxis
                dataKey='date'
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B7280' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B7280' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type='monotone'
                dataKey='views'
                stroke='#3B82F6'
                strokeWidth={2}
                fillOpacity={1}
                fill='url(#colorViews)'
              />
            </AreaChart>
          ) : (
            <LineChart
              data={filteredData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray='3 3' stroke='#E5E7EB' />
              <XAxis
                dataKey='date'
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B7280' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B7280' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type='monotone'
                dataKey='views'
                stroke='#3B82F6'
                strokeWidth={2}
                dot={{ r: 4, fill: '#3B82F6' }}
                activeDot={{ r: 6, fill: '#3B82F6' }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* 图例说明 */}
      <div className='flex items-center justify-center mt-4 space-x-6 text-sm text-gray-500 dark:text-gray-400'>
        <div className='flex items-center space-x-2'>
          <div className='w-3 h-3 bg-blue-500 rounded-full' />
          <span>日浏览量</span>
        </div>
        <div className='flex items-center space-x-1'>
          <Calendar className='w-3 h-3' />
          <span>过去 {period} 天</span>
        </div>
      </div>
    </div>
  )
}
