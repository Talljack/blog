import { NextRequest } from 'next/server'
import { Redis } from '@upstash/redis'
import {
  createErrorResponse,
  createSuccessResponse,
  rateLimit,
  validateApiRequest,
} from '@/lib/security'
import { hasAdminAccess } from '@/lib/auth'
import { getAllPosts } from '@/lib/blog'

const redis = Redis.fromEnv()
const KV_PREFIX = 'blog:views:'

// 配置速率限制 - 考虑Vercel KV免费版限制
const analyticsRateLimit = rateLimit({
  maxRequests: 10, // 降低请求频率
  windowMs: 300000, // 5分钟窗口
})

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

// 获取所有浏览量数据
async function getAllViewsData(): Promise<Record<string, number>> {
  try {
    if (process.env.VERCEL === '1' && process.env.KV_REST_API_URL) {
      // Vercel环境使用Redis
      const keys = await redis.keys(`${KV_PREFIX}*`)
      if (keys.length === 0) return {}

      const pipeline = redis.pipeline()
      keys.forEach(key => pipeline.get(key))
      const values = await pipeline.exec()

      const result: Record<string, number> = {}
      keys.forEach((key, index) => {
        const slug = key.replace(KV_PREFIX, '')
        const views = values[index]
        result[slug] = typeof views === 'number' ? views : 0
      })

      return result
    } else {
      // 本地开发环境从文件读取数据
      try {
        const { promises: fs } = require('fs')
        const path = require('path')

        const STATS_FILE = path.join(process.cwd(), 'data', 'views.json')
        const data = await fs.readFile(STATS_FILE, 'utf-8')
        const parsed = JSON.parse(data)

        if (typeof parsed === 'object' && parsed !== null) {
          return parsed
        }

        return {}
      } catch (error) {
        console.info(
          '读取本地浏览量数据失败，使用空数据:',
          error instanceof Error ? error.message : 'Unknown error'
        )
        return {}
      }
    }
  } catch (error) {
    console.error('获取浏览量数据失败:', error)
    return {}
  }
}

// 计算增长趋势 (模拟数据，实际项目中应该从历史记录获取)
function calculateGrowthTrend(
  totalViews: number
): Array<{ date: string; views: number }> {
  const days = 30
  const data = []
  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    // 模拟增长趋势 - 实际应该从历史数据获取
    const baseViews = Math.floor(totalViews * (1 - i / days))
    const variation = Math.random() * 0.2 + 0.9 // 90-110% variation
    const views = Math.floor(baseViews * variation)

    data.push({
      date: date.toISOString().split('T')[0],
      views: Math.max(views, 0),
    })
  }

  return data
}

// 生成分析报告
async function generateAnalyticsReport(): Promise<AnalyticsData> {
  try {
    // 获取所有文章数据
    const allPosts = await getAllPosts()

    // 获取浏览量数据
    const viewsData = await getAllViewsData()

    // 计算基础统计
    const totalViews = Object.values(viewsData).reduce(
      (sum, views) => sum + views,
      0
    )
    const totalPosts = allPosts.length
    const averageViews =
      totalPosts > 0 ? Math.round(totalViews / totalPosts) : 0

    // 获取热门文章 (前10)
    const postsWithViews = allPosts.map(post => ({
      ...post,
      views: viewsData[post.slug] || 0,
    }))

    const topPosts = postsWithViews
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)
      .map(post => ({
        slug: post.slug,
        title: post.title,
        views: post.views,
        date: post.date,
        tags: post.tags || [],
      }))

    // 获取最新文章 (前5)
    const recentPosts = postsWithViews
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map(post => ({
        slug: post.slug,
        title: post.title,
        views: post.views,
        date: post.date,
      }))

    // 标签分析
    const tagStats: Record<string, { postCount: number; totalViews: number }> =
      {}

    postsWithViews.forEach(post => {
      post.tags?.forEach(tag => {
        if (!tagStats[tag]) {
          tagStats[tag] = { postCount: 0, totalViews: 0 }
        }
        tagStats[tag].postCount++
        tagStats[tag].totalViews += post.views
      })
    })

    const tagAnalytics = Object.entries(tagStats)
      .map(([tag, stats]) => ({
        tag,
        postCount: stats.postCount,
        totalViews: stats.totalViews,
        averageViews: Math.round(stats.totalViews / stats.postCount),
      }))
      .sort((a, b) => b.totalViews - a.totalViews)
      .slice(0, 10)

    // 生成增长趋势数据
    const viewsGrowth = calculateGrowthTrend(totalViews)

    // 月度统计 (简化版本)
    const currentMonth = Math.floor(totalViews * 0.3) // 假设30%是当月
    const lastMonth = Math.floor(totalViews * 0.25) // 假设25%是上月
    const growth =
      lastMonth > 0
        ? Math.round(((currentMonth - lastMonth) / lastMonth) * 100)
        : 0

    return {
      totalViews,
      totalPosts,
      averageViews,
      topPosts,
      recentPosts,
      viewsGrowth,
      tagAnalytics,
      monthlyStats: {
        currentMonth,
        lastMonth,
        growth,
      },
    }
  } catch (error) {
    console.error('生成分析报告失败:', error)
    throw new Error('无法生成分析报告')
  }
}

export async function HEAD(request: NextRequest) {
  try {
    // 验证管理员权限
    if (!hasAdminAccess(request)) {
      return new Response(null, { status: 403 })
    }

    return new Response(null, { status: 200 })
  } catch (error) {
    return new Response(null, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // 开发环境下跳过权限检查，生产环境需要管理员权限
    const isDevelopment = process.env.NODE_ENV === 'development'
    if (!isDevelopment && !hasAdminAccess(request)) {
      return createErrorResponse('需要管理员权限访问此资源', 403)
    }

    // 验证请求
    const validationResult = validateApiRequest(request)
    if (!validationResult.valid) {
      return createErrorResponse(
        validationResult.error || 'Invalid request',
        400
      )
    }

    // 应用速率限制
    const rateLimitResult = await analyticsRateLimit(request)
    if (!rateLimitResult.allowed) {
      const headers: Record<string, string> = {
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
      }
      if (rateLimitResult.resetTime) {
        headers['X-RateLimit-Reset'] = rateLimitResult.resetTime.toString()
      }
      return createErrorResponse('请求过于频繁，请稍后再试', 429, headers)
    }

    // 生成分析报告
    const analyticsData = await generateAnalyticsReport()

    const response = createSuccessResponse(analyticsData)

    // 添加缓存头 - 缓存5分钟
    response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=300')
    response.headers.set('CDN-Cache-Control', 'public, max-age=300')

    return response
  } catch (error) {
    console.error('Analytics API错误:', error)
    return createErrorResponse('服务器内部错误', 500)
  }
}

// 支持OPTIONS请求用于CORS
export async function OPTIONS(_request: NextRequest) {
  const response = new Response(null, { status: 200 })
  return response
}
