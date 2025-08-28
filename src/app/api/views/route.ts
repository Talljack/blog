import {
  createErrorResponse,
  createSuccessResponse,
  rateLimit,
  sanitizeInput,
  setCorsHeaders,
  validateApiRequest,
  validateSlug,
} from '@/lib/security'
import { promises as fs } from 'fs'
import { NextRequest } from 'next/server'
import path from 'path'

// 存储统计数据的文件路径
const STATS_FILE = path.join(process.cwd(), 'data', 'views.json')

interface ViewsData {
  [slug: string]: number
}

// 配置速率限制
const viewsRateLimit = rateLimit({
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15分钟
})

// 确保数据目录和文件存在
async function ensureStatsFile(): Promise<ViewsData> {
  try {
    const dataDir = path.dirname(STATS_FILE)

    // 确保目录存在
    try {
      await fs.mkdir(dataDir, { recursive: true })
    } catch (error) {
      console.error('Error creating data directory:', error)
      // 目录可能已存在，忽略错误
    }

    // 尝试读取现有文件
    try {
      const data = await fs.readFile(STATS_FILE, 'utf-8')
      const parsed = JSON.parse(data)

      // 验证数据结构
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('Invalid data structure')
      }

      return parsed
    } catch (_error) {
      console.warn(
        'Error reading stats file, creating new:',
        _error instanceof Error ? _error.message : String(_error)
      )
      // 文件不存在或格式错误，创建空的统计数据
      const initialData: ViewsData = {}
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

// 获取文章浏览量
export async function GET(request: NextRequest) {
  // 应用速率限制
  const rateLimitResult = viewsRateLimit(request)
  if (!rateLimitResult.allowed) {
    return createErrorResponse('Rate limit exceeded', 429, {
      resetTime: rateLimitResult.resetTime
        ? new Date(rateLimitResult.resetTime).toISOString()
        : new Date().toISOString(),
    })
  }

  // 验证请求
  const validation = validateApiRequest(request)
  if (!validation.valid) {
    return createErrorResponse(validation.error || 'Invalid request', 400)
  }

  const searchParams = request.nextUrl.searchParams
  const slug = searchParams.get('slug')

  try {
    const viewsData = await ensureStatsFile()

    if (slug) {
      // 验证 slug
      if (!validateSlug(slug)) {
        return createErrorResponse('Invalid slug format', 400)
      }

      const sanitizedSlug = sanitizeInput(slug)
      const response = createSuccessResponse({
        slug: sanitizedSlug,
        views: viewsData[sanitizedSlug] || 0,
      })

      return setCorsHeaders(response, request.headers.get('origin'))
    } else {
      // 返回所有文章的浏览量（限制数量以防止数据泄露）
      const limitedData = Object.fromEntries(
        Object.entries(viewsData).slice(0, 100)
      )

      const response = createSuccessResponse(limitedData)
      return setCorsHeaders(response, request.headers.get('origin'))
    }
  } catch (_error) {
    console.error('Error reading views:', _error)
    return createErrorResponse('Failed to get views', 500)
  }
}

// 增加文章浏览量
export async function POST(request: NextRequest) {
  // 应用速率限制（POST请求更严格的限制）
  const rateLimitResult = rateLimit({
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '50'),
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15分钟
  })(request)

  if (!rateLimitResult.allowed) {
    return createErrorResponse('Rate limit exceeded', 429, {
      resetTime: rateLimitResult.resetTime
        ? new Date(rateLimitResult.resetTime).toISOString()
        : new Date().toISOString(),
    })
  }

  // 验证请求
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

    // 验证 slug 格式
    if (!validateSlug(slug)) {
      return createErrorResponse('Invalid slug format', 400)
    }

    const viewsData = await ensureStatsFile()

    // 增加浏览量（防止整数溢出）
    const currentViews = viewsData[slug] || 0
    if (currentViews >= Number.MAX_SAFE_INTEGER - 1) {
      return createErrorResponse('Views count overflow', 400)
    }

    viewsData[slug] = currentViews + 1

    // 原子性保存数据
    const tempFile = `${STATS_FILE}.tmp`
    try {
      await fs.writeFile(tempFile, JSON.stringify(viewsData, null, 2), 'utf-8')
      await fs.rename(tempFile, STATS_FILE)
    } catch (_error) {
      // 清理临时文件
      try {
        await fs.unlink(tempFile)
      } catch (_cleanupError) {
        // 忽略清理错误
      }

      // 如果原子操作失败，直接写入原文件
      await fs.writeFile(
        STATS_FILE,
        JSON.stringify(viewsData, null, 2),
        'utf-8'
      )
    }

    const response = createSuccessResponse({
      slug,
      views: viewsData[slug],
    })

    return setCorsHeaders(response, request.headers.get('origin'))
  } catch (_error) {
    console.error('Error updating views:', _error)
    return createErrorResponse('Failed to update views', 500)
  }
}

// 处理 OPTIONS 请求（用于 CORS 预检）
export async function OPTIONS(request: NextRequest) {
  const response = new Response(null, { status: 200 })
  return setCorsHeaders(response, request.headers.get('origin'))
}
