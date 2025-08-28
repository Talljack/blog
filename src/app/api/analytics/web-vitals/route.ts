import { NextRequest, NextResponse } from 'next/server'
import {
  createErrorResponse,
  createSuccessResponse,
  rateLimit,
  validateApiRequest,
  sanitizeInput,
} from '@/lib/security'

// Web Vitals 数据收集端点
const webVitalsRateLimit = rateLimit({
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15分钟
})

export async function POST(request: NextRequest) {
  // 应用速率限制
  const rateLimitResult = webVitalsRateLimit(request)
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
    const body = await request.json()
    const sanitizedData = sanitizeInput(body)

    // 验证必需字段
    const { name, value, id, delta, rating, url, userAgent, timestamp } =
      sanitizedData

    if (!name || !value || !id || !rating) {
      return createErrorResponse('Missing required fields', 400)
    }

    // 验证指标名称
    const validMetrics = ['CLS', 'FID', 'FCP', 'LCP', 'TTFB']
    if (!validMetrics.includes(name)) {
      return createErrorResponse('Invalid metric name', 400)
    }

    // 验证评级
    const validRatings = ['good', 'needs-improvement', 'poor']
    if (!validRatings.includes(rating)) {
      return createErrorResponse('Invalid rating', 400)
    }

    // 构建性能数据记录
    const performanceData = {
      metric: name,
      value: parseFloat(value),
      id,
      delta: delta ? parseFloat(delta) : undefined,
      rating,
      url: url || 'unknown',
      userAgent: userAgent || 'unknown',
      timestamp: timestamp || Date.now(),
      ip:
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        'unknown',
      createdAt: new Date().toISOString(),
    }

    // 这里可以将数据保存到数据库或发送到分析服务
    // 目前只在控制台输出（生产环境中应该保存到数据库）
    console.log('Web Vitals Data:', performanceData)

    // 可以添加更多分析逻辑
    await analyzePerformanceData(performanceData)

    return createSuccessResponse({
      message: 'Performance data recorded successfully',
      metric: name,
      value: parseFloat(value),
      rating,
    })
  } catch (error) {
    console.error('Error processing web vitals data:', error)
    return createErrorResponse('Failed to process performance data', 500)
  }
}

/**
 * 分析性能数据并生成洞察
 */
async function analyzePerformanceData(data: any) {
  // 性能阈值警告
  const thresholds = {
    CLS: { good: 0.1, poor: 0.25 },
    FID: { good: 100, poor: 300 },
    FCP: { good: 1800, poor: 3000 },
    LCP: { good: 2500, poor: 4000 },
    TTFB: { good: 800, poor: 1800 },
  }

  const threshold = thresholds[data.metric as keyof typeof thresholds]

  if (threshold && data.value > threshold.poor) {
    console.warn(`⚠️ Poor ${data.metric} performance detected:`, {
      value: data.value,
      threshold: threshold.poor,
      url: data.url,
      userAgent: data.userAgent,
    })

    // 这里可以发送警报、记录到监控系统等
    // await sendPerformanceAlert(data)
  }

  // 可以添加更多分析逻辑
  // - 按页面聚合性能数据
  // - 按设备类型分析
  // - 趋势分析
  // - 异常检测
}

// GET 请求返回性能统计信息（可选）
export async function GET(request: NextRequest) {
  // 验证请求权限（可选）
  const validation = validateApiRequest(request)
  if (!validation.valid) {
    return createErrorResponse('Unauthorized', 401)
  }

  try {
    // 这里可以返回性能统计数据
    const stats = {
      message: 'Web Vitals analytics endpoint',
      endpoints: {
        POST: 'Submit performance metrics',
        GET: 'Retrieve performance statistics',
      },
      supportedMetrics: ['CLS', 'FID', 'FCP', 'LCP', 'TTFB'],
      // 实际应用中可以返回聚合的性能数据
    }

    return createSuccessResponse(stats)
  } catch (error) {
    console.error('Error retrieving web vitals stats:', error)
    return createErrorResponse('Failed to retrieve statistics', 500)
  }
}

export const revalidate = 0 // 不缓存
