import { NextRequest } from 'next/server'

// 速率限制存储
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

export function rateLimit(config: RateLimitConfig) {
  return (request: NextRequest) => {
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown'
    const now = Date.now()
    const key = `${ip}`

    const record = rateLimitMap.get(key)

    if (!record || now > record.resetTime) {
      // 重置或创建新记录
      rateLimitMap.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      })
      return { allowed: true, remaining: config.maxRequests - 1 }
    }

    if (record.count >= config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime,
      }
    }

    record.count++
    return {
      allowed: true,
      remaining: config.maxRequests - record.count,
    }
  }
}

// API验证中间件
export function validateApiRequest(request: NextRequest): {
  valid: boolean
  error?: string
} {
  const contentType = request.headers.get('content-type')
  const method = request.method

  // 基本验证
  if (method === 'POST' && !contentType?.includes('application/json')) {
    return {
      valid: false,
      error: 'Content-Type must be application/json for POST requests',
    }
  }

  // 检查必需的头部
  const userAgent = request.headers.get('user-agent')
  if (!userAgent || userAgent.length < 5) {
    return {
      valid: false,
      error: 'Invalid or missing User-Agent header',
    }
  }

  return { valid: true }
}

// 输入验证
export function validateSlug(slug: string): boolean {
  if (!slug || typeof slug !== 'string') return false

  // 只允许字母、数字、连字符和下划线
  const slugRegex = /^[a-zA-Z0-9_-]+$/
  return slugRegex.test(slug) && slug.length > 0 && slug.length <= 100
}

// 清理输入数据
export function sanitizeInput(input: string | Object | null): any {
  if (typeof input === 'string') {
    // 移除潜在的危险字符
    return input.replace(/[<>\"'&]/g, '').trim()
  }
  if (typeof input === 'object' && input !== null) {
    const sanitized: Record<string, string> = {}
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value)
    }
    return sanitized
  }
  return input
}

// CORS头部
export function setCorsHeaders(
  response: Response,
  origin?: string | null
): Response {
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_SITE_URL,
    'http://localhost:3000',
    'http://localhost:3001',
  ].filter(Boolean)

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  }

  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  )
  response.headers.set('Access-Control-Max-Age', '86400')

  return response
}

// 错误响应助手
export function createErrorResponse(
  message: string,
  status: number = 400,
  details?: any
): Response {
  const body = {
    error: message,
    status,
    timestamp: new Date().toISOString(),
    ...(details && { details }),
  }

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
  })
}

// 成功响应助手
export function createSuccessResponse(
  data: Record<string, any> | Array<any>,
  status: number = 200,
  headers?: Record<string, string>
): Response {
  const body = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  }

  const responseHeaders = {
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=60, s-maxage=60',
    ...headers,
  }

  return new Response(JSON.stringify(body), {
    status,
    headers: responseHeaders,
  })
}
