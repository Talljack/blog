// 趋势分析API - 提供访问趋势数据
import { NextRequest } from 'next/server'
import { Redis } from '@upstash/redis'
import { promises as fs } from 'fs'
import path from 'path'
import {
  createErrorResponse,
  createSuccessResponse,
  rateLimit,
  setCorsHeaders,
  validateApiRequest,
} from '@/lib/security'

const STATS_FILE = path.join(process.cwd(), 'data', 'views.json')
const KV_PREFIX = 'blog:views:'

const trendsRateLimit = rateLimit({
  maxRequests: 10,
  windowMs: 300000, // 5分钟窗口 - 适配Vercel KV免费版限制
})

const redis = Redis.fromEnv()

const isVercelEnvironment = () => {
  return process.env.VERCEL === '1' && process.env.KV_REST_API_URL
}

// 获取总浏览量
async function getTotalViews(): Promise<number> {
  if (isVercelEnvironment()) {
    try {
      const keys = await redis.keys(`${KV_PREFIX}*`)
      if (keys.length === 0) return 0

      const pipeline = redis.pipeline()
      keys.forEach(key => pipeline.get(key))
      const values = await pipeline.exec()

      let total = 0
      values.forEach(value => {
        if (typeof value === 'number' && value > 0) {
          total += value
        }
      })

      return total
    } catch (error) {
      console.error('Error getting total views from KV:', error)
      return 0
    }
  } else {
    try {
      const data = await fs.readFile(STATS_FILE, 'utf-8')
      const parsed = JSON.parse(data)

      if (typeof parsed !== 'object' || parsed === null) {
        return 0
      }

      let total = 0
      Object.values(parsed).forEach(views => {
        if (typeof views === 'number' && views > 0) {
          total += views
        }
      })

      return total
    } catch (error) {
      return 0
    }
  }
}

// 生成趋势数据 (模拟数据，实际项目中需要记录历史数据)
function generateTrendData(totalViews: number, days: number = 30) {
  const trends = []
  const today = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    // 生成合理的日访问量 - 基于总浏览量的分布
    const baseDaily = Math.max(1, Math.floor(totalViews / (days * 2)))
    const randomFactor = 0.6 + Math.random() * 0.8 // 0.6-1.4倍波动
    const weekdayBoost = [0, 6].includes(date.getDay()) ? 0.8 : 1.2 // 工作日更高
    const dailyViews = Math.floor(baseDaily * randomFactor * weekdayBoost)

    trends.push({
      date: date.toISOString().split('T')[0],
      views: Math.max(dailyViews, 0),
      dayOfWeek: date.getDay(),
      isWeekend: [0, 6].includes(date.getDay()),
    })
  }

  return trends
}

// 生成周数据统计
function generateWeeklyData(
  dailyData: Array<{ date: string; views: number; dayOfWeek: number }>
) {
  const weeklyData = []
  const weeks = Math.ceil(dailyData.length / 7)

  for (let i = 0; i < weeks; i++) {
    const weekStart = i * 7
    const weekEnd = Math.min(weekStart + 7, dailyData.length)
    const weekData = dailyData.slice(weekStart, weekEnd)

    if (weekData.length > 0) {
      const weekViews = weekData.reduce((sum, day) => sum + day.views, 0)
      const startDate = weekData[0].date
      const endDate = weekData[weekData.length - 1].date

      weeklyData.push({
        weekStart: startDate,
        weekEnd: endDate,
        totalViews: weekViews,
        averageDaily: Math.round(weekViews / weekData.length),
        daysInWeek: weekData.length,
      })
    }
  }

  return weeklyData
}

// GET: 获取趋势数据
export async function GET(request: NextRequest) {
  const rateLimitResult = trendsRateLimit(request)
  if (!rateLimitResult.allowed) {
    return createErrorResponse('Rate limit exceeded', 429)
  }

  const validation = validateApiRequest(request)
  if (!validation.valid) {
    return createErrorResponse(validation.error || 'Invalid request', 400)
  }

  try {
    const searchParams = request.nextUrl.searchParams
    const days = parseInt(searchParams.get('days') || '30')
    const period = searchParams.get('period') || 'daily' // daily, weekly

    const validDays = Math.min(Math.max(days, 7), 365) // 限制在7-365天之间

    const totalViews = await getTotalViews()
    const dailyTrends = generateTrendData(totalViews, validDays)

    const responseData: {
      period: string
      days: number
      totalViews: number
      daily: typeof dailyTrends
      weekly?: ReturnType<typeof generateWeeklyData>
      statistics?: {
        avgDailyViews: number
        maxDailyViews: number
        minDailyViews: number
        totalPeriodViews: number
      }
    } = {
      period,
      days: validDays,
      totalViews,
      daily: dailyTrends,
    }

    // 如果请求周数据，生成周统计
    if (period === 'weekly') {
      responseData.weekly = generateWeeklyData(dailyTrends)
    }

    // 添加统计信息
    const avgDailyViews =
      dailyTrends.length > 0
        ? Math.round(
            dailyTrends.reduce((sum, day) => sum + day.views, 0) /
              dailyTrends.length
          )
        : 0

    const maxDailyViews =
      dailyTrends.length > 0
        ? Math.max(...dailyTrends.map(day => day.views))
        : 0

    const minDailyViews =
      dailyTrends.length > 0
        ? Math.min(...dailyTrends.map(day => day.views))
        : 0

    responseData.statistics = {
      avgDailyViews,
      maxDailyViews,
      minDailyViews,
      totalPeriodViews: dailyTrends.reduce((sum, day) => sum + day.views, 0),
    }

    const response = createSuccessResponse({
      ...responseData,
      storage: isVercelEnvironment() ? 'redis' : 'file',
      generatedAt: new Date().toISOString(),
    })

    return setCorsHeaders(response, request.headers.get('origin'))
  } catch (error) {
    console.error('Error generating trends:', error)
    return createErrorResponse('Failed to generate trends', 500)
  }
}

export async function OPTIONS(request: NextRequest) {
  const response = new Response(null, { status: 200 })
  return setCorsHeaders(response, request.headers.get('origin'))
}
