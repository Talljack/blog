// 分析摘要API - 提供简化的统计数据
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
import { getAllPosts } from '@/lib/blog'

const STATS_FILE = path.join(process.cwd(), 'data', 'views.json')
const KV_PREFIX = 'blog:views:'

const summaryRateLimit = rateLimit({
  maxRequests: 10,
  windowMs: 300000, // 5分钟窗口 - 适配Vercel KV免费版限制
})

const redis = Redis.fromEnv()

const isVercelEnvironment = () => {
  return process.env.VERCEL === '1' && process.env.KV_REST_API_URL
}

// 获取所有浏览量数据
async function getAllViews(): Promise<Record<string, number>> {
  if (isVercelEnvironment()) {
    try {
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
    } catch (error) {
      console.error('Error getting views from KV:', error)
      return {}
    }
  } else {
    try {
      const data = await fs.readFile(STATS_FILE, 'utf-8')
      const parsed = JSON.parse(data)
      return typeof parsed === 'object' && parsed !== null ? parsed : {}
    } catch (error) {
      return {}
    }
  }
}

// GET: 获取分析摘要
export async function GET(request: NextRequest) {
  const rateLimitResult = summaryRateLimit(request)
  if (!rateLimitResult.allowed) {
    return createErrorResponse('Rate limit exceeded', 429)
  }

  const validation = validateApiRequest(request)
  if (!validation.valid) {
    return createErrorResponse(validation.error || 'Invalid request', 400)
  }

  try {
    const [posts, allViews] = await Promise.all([getAllPosts(), getAllViews()])

    const totalViews = Object.values(allViews).reduce(
      (sum, views) => sum + views,
      0
    )
    const totalPosts = posts.length
    const averageViews =
      totalPosts > 0 ? Math.round(totalViews / totalPosts) : 0

    // 模拟月度增长率
    const currentMonthViews = Math.floor(totalViews * 0.3)
    const lastMonthViews = Math.floor(totalViews * 0.25)
    const monthlyGrowth =
      lastMonthViews > 0
        ? Math.round(
            ((currentMonthViews - lastMonthViews) / lastMonthViews) * 100
          )
        : 0

    const response = createSuccessResponse({
      totalViews,
      totalPosts,
      averageViews,
      monthlyGrowth,
      storage: isVercelEnvironment() ? 'redis' : 'file',
      generatedAt: new Date().toISOString(),
    })

    return setCorsHeaders(response, request.headers.get('origin'))
  } catch (error) {
    console.error('Error generating summary:', error)
    return createErrorResponse('Failed to generate summary', 500)
  }
}

export async function OPTIONS(request: NextRequest) {
  const response = new Response(null, { status: 200 })
  return setCorsHeaders(response, request.headers.get('origin'))
}
