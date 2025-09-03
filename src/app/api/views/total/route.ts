// 总访问量API
import { NextRequest } from 'next/server'
import {
  createErrorResponse,
  createSuccessResponse,
  rateLimit,
  setCorsHeaders,
  validateApiRequest,
} from '@/lib/security'

// 引入现有的views路由逻辑
import { Redis } from '@upstash/redis'
import { promises as fs } from 'fs'
import path from 'path'

const STATS_FILE = path.join(process.cwd(), 'data', 'views.json')
const KV_PREFIX = 'blog:views:'

const totalViewsRateLimit = rateLimit({
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '200'),
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15分钟
})

const redis = Redis.fromEnv()

const isVercelEnvironment = () => {
  return process.env.VERCEL === '1' && process.env.KV_REST_API_URL
}

// 从Redis获取总访问量
async function getTotalViewsFromKV(): Promise<number> {
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
}

// 从文件获取总访问量
async function getTotalViewsFromFile(): Promise<number> {
  try {
    const data = await fs.readFile(STATS_FILE, 'utf-8')
    const viewsData = JSON.parse(data)

    if (typeof viewsData !== 'object' || viewsData === null) {
      return 0
    }

    let total = 0
    Object.values(viewsData).forEach(views => {
      if (typeof views === 'number' && views > 0) {
        total += views
      }
    })

    return total
  } catch (error) {
    console.error('Error getting total views from file:', error)
    return 0
  }
}

// 统一接口
async function getTotalViews(): Promise<number> {
  if (isVercelEnvironment()) {
    return await getTotalViewsFromKV()
  } else {
    return await getTotalViewsFromFile()
  }
}

// GET: 获取总访问量
export async function GET(request: NextRequest) {
  const rateLimitResult = totalViewsRateLimit(request)
  if (!rateLimitResult.allowed) {
    return createErrorResponse('Rate limit exceeded', 429, {
      resetTime: rateLimitResult.resetTime
        ? new Date(rateLimitResult.resetTime).toISOString()
        : new Date().toISOString(),
    })
  }

  const validation = validateApiRequest(request)
  if (!validation.valid) {
    return createErrorResponse(validation.error || 'Invalid request', 400)
  }

  try {
    const totalViews = await getTotalViews()

    const response = createSuccessResponse({
      totalViews,
      storage: isVercelEnvironment() ? 'redis' : 'file',
      timestamp: new Date().toISOString(),
    })

    return setCorsHeaders(response, request.headers.get('origin'))
  } catch (error) {
    console.error('Error getting total views:', error)
    return createErrorResponse('Failed to get total views', 500)
  }
}

// OPTIONS: CORS预检
export async function OPTIONS(request: NextRequest) {
  const response = new Response(null, { status: 200 })
  return setCorsHeaders(response, request.headers.get('origin'))
}
