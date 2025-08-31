// Upstash Redis版本的Views API
import { Redis } from '@upstash/redis'
import {
  createErrorResponse,
  createSuccessResponse,
  rateLimit,
  sanitizeInput,
  setCorsHeaders,
  validateApiRequest,
  validateSlug,
} from '@/lib/security'
import { NextRequest } from 'next/server'

// 本地开发时的文件存储fallback
import { promises as fs } from 'fs'
import path from 'path'

const STATS_FILE = path.join(process.cwd(), 'data', 'views.json')
const KV_PREFIX = 'blog:views:'

// 配置速率限制
const viewsRateLimit = rateLimit({
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15分钟
})

// 判断是否在Vercel环境中并配置Redis客户端
const redis = Redis.fromEnv()

const isVercelEnvironment = () => {
  return process.env.VERCEL === '1' && process.env.KV_REST_API_URL
}

// Upstash Redis存储操作
async function getViewsFromKV(
  slug?: string
): Promise<number | Record<string, number>> {
  if (slug) {
    const views = await redis.get(`${KV_PREFIX}${slug}`)
    return typeof views === 'number' ? views : 0
  } else {
    // 获取所有浏览量数据
    const keys = await redis.keys(`${KV_PREFIX}*`)
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
  }
}

async function incrementViewsInKV(slug: string): Promise<number> {
  const newViews = await redis.incr(`${KV_PREFIX}${slug}`)
  return newViews
}

// 本地文件存储操作（开发环境fallback）
async function ensureStatsFile(): Promise<Record<string, number>> {
  try {
    const dataDir = path.dirname(STATS_FILE)

    try {
      await fs.mkdir(dataDir, { recursive: true })
    } catch (error) {
      // 目录可能已存在，忽略错误
    }

    try {
      const data = await fs.readFile(STATS_FILE, 'utf-8')
      const parsed = JSON.parse(data)

      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('Invalid data structure')
      }

      return parsed
    } catch (_error) {
      const initialData: Record<string, number> = {}
      await fs.writeFile(
        STATS_FILE,
        JSON.stringify(initialData, null, 2),
        'utf-8'
      )
      return initialData
    }
  } catch (_error) {
    console.error('Error ensuring stats file:', _error)
    return {}
  }
}

async function getViewsFromFile(
  slug?: string
): Promise<number | Record<string, number>> {
  const viewsData = await ensureStatsFile()

  if (slug) {
    return viewsData[slug] || 0
  } else {
    return viewsData
  }
}

async function incrementViewsInFile(slug: string): Promise<number> {
  const viewsData = await ensureStatsFile()
  const currentViews = viewsData[slug] || 0

  if (currentViews >= Number.MAX_SAFE_INTEGER - 1) {
    throw new Error('Views count overflow')
  }

  viewsData[slug] = currentViews + 1

  // 原子性保存
  const tempFile = `${STATS_FILE}.tmp`
  try {
    await fs.writeFile(tempFile, JSON.stringify(viewsData, null, 2), 'utf-8')
    await fs.rename(tempFile, STATS_FILE)
  } catch (_error) {
    try {
      await fs.unlink(tempFile)
    } catch (_cleanupError) {
      // 忽略清理错误
    }

    await fs.writeFile(STATS_FILE, JSON.stringify(viewsData, null, 2), 'utf-8')
  }

  return viewsData[slug]
}

// 统一的存储接口
async function getViews(
  slug?: string
): Promise<number | Record<string, number>> {
  if (isVercelEnvironment()) {
    return await getViewsFromKV(slug)
  } else {
    return await getViewsFromFile(slug)
  }
}

async function incrementViews(slug: string): Promise<number> {
  if (isVercelEnvironment()) {
    return await incrementViewsInKV(slug)
  } else {
    return await incrementViewsInFile(slug)
  }
}

// GET: 获取浏览量
export async function GET(request: NextRequest) {
  const rateLimitResult = viewsRateLimit(request)
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

  const searchParams = request.nextUrl.searchParams
  const slug = searchParams.get('slug')

  try {
    if (slug) {
      if (!validateSlug(slug)) {
        return createErrorResponse('Invalid slug format', 400)
      }

      const sanitizedSlug = sanitizeInput(slug)
      const views = (await getViews(sanitizedSlug)) as number

      const response = createSuccessResponse({
        slug: sanitizedSlug,
        views,
        storage: isVercelEnvironment() ? 'redis' : 'file',
      })

      return setCorsHeaders(response, request.headers.get('origin'))
    } else {
      const allViews = (await getViews()) as Record<string, number>
      const limitedData = Object.fromEntries(
        Object.entries(allViews).slice(0, 100)
      )

      const response = createSuccessResponse({
        ...limitedData,
        storage: isVercelEnvironment() ? 'redis' : 'file',
      })
      return setCorsHeaders(response, request.headers.get('origin'))
    }
  } catch (_error) {
    console.error('Error reading views:', _error)
    return createErrorResponse('Failed to get views', 500)
  }
}

// POST: 增加浏览量
export async function POST(request: NextRequest) {
  const rateLimitResult = rateLimit({
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '50'),
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  })(request)

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
    let body
    try {
      body = await request.json()
    } catch (_error) {
      return createErrorResponse('Invalid JSON in request body', 400)
    }

    const { slug } = sanitizeInput(body)

    if (!slug) {
      return createErrorResponse('Slug is required', 400)
    }

    if (!validateSlug(slug)) {
      return createErrorResponse('Invalid slug format', 400)
    }

    const newViews = await incrementViews(slug)

    const response = createSuccessResponse({
      slug,
      views: newViews,
      storage: isVercelEnvironment() ? 'redis' : 'file',
    })

    return setCorsHeaders(response, request.headers.get('origin'))
  } catch (_error) {
    console.error('Error updating views:', _error)
    return createErrorResponse('Failed to update views', 500)
  }
}

// OPTIONS: CORS预检
export async function OPTIONS(request: NextRequest) {
  const response = new Response(null, { status: 200 })
  return setCorsHeaders(response, request.headers.get('origin'))
}
