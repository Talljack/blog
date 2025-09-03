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

// 更严格的速率限制用于导出
const exportRateLimit = rateLimit({
  maxRequests: 10,
  windowMs: 3600000, // 1小时
})

// 导出数据格式
interface ExportData {
  exportDate: string
  summary: {
    totalViews: number
    totalPosts: number
    averageViews: number
  }
  posts: Array<{
    slug: string
    title: string
    date: string
    views: number
    tags: string[]
    author: string
    readTime: number
  }>
  tagStats: Record<
    string,
    {
      postCount: number
      totalViews: number
      averageViews: number
    }
  >
}

export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    if (!hasAdminAccess(request)) {
      return createErrorResponse('访问被拒绝', 403)
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
    const rateLimitResult = await exportRateLimit(request)
    if (!rateLimitResult.allowed) {
      const headers: Record<string, string> = {
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
      }
      if (rateLimitResult.resetTime) {
        headers['X-RateLimit-Reset'] = rateLimitResult.resetTime.toString()
      }
      return createErrorResponse(
        '导出请求过于频繁，请1小时后再试',
        429,
        headers
      )
    }

    // 获取数据
    const allPosts = await getAllPosts()

    // 获取浏览量数据
    let viewsData: Record<string, number> = {}

    if (process.env.VERCEL === '1' && process.env.KV_REST_API_URL) {
      try {
        const keys = await redis.keys(`${KV_PREFIX}*`)
        if (keys.length > 0) {
          const pipeline = redis.pipeline()
          keys.forEach(key => pipeline.get(key))
          const values = await pipeline.exec()

          keys.forEach((key, index) => {
            const slug = key.replace(KV_PREFIX, '')
            const views = values[index]
            viewsData[slug] = typeof views === 'number' ? views : 0
          })
        }
      } catch (error) {
        console.error('获取Redis数据失败:', error)
      }
    } else {
      // 本地开发环境从文件读取数据
      try {
        const { promises: fs } = require('fs')
        const path = require('path')

        const STATS_FILE = path.join(process.cwd(), 'data', 'views.json')
        const data = await fs.readFile(STATS_FILE, 'utf-8')
        const parsed = JSON.parse(data)

        if (typeof parsed === 'object' && parsed !== null) {
          viewsData = parsed
        }
      } catch (error) {
        console.info(
          '读取本地浏览量数据失败，使用空数据:',
          error instanceof Error ? error.message : 'Unknown error'
        )
      }
    }

    // 准备导出数据
    const postsWithViews = allPosts.map(post => ({
      slug: post.slug,
      title: post.title,
      date: post.date,
      views: viewsData[post.slug] || 0,
      tags: post.tags || [],
      author: post.author || 'Unknown',
      readTime: post.readTime || 0,
    }))

    // 计算标签统计
    const tagStats: Record<
      string,
      { postCount: number; totalViews: number; averageViews: number }
    > = {}

    postsWithViews.forEach(post => {
      post.tags.forEach(tag => {
        if (!tagStats[tag]) {
          tagStats[tag] = { postCount: 0, totalViews: 0, averageViews: 0 }
        }
        tagStats[tag].postCount++
        tagStats[tag].totalViews += post.views
      })
    })

    // 计算平均浏览量
    Object.keys(tagStats).forEach(tag => {
      tagStats[tag].averageViews = Math.round(
        tagStats[tag].totalViews / tagStats[tag].postCount
      )
    })

    // 总计数据
    const totalViews = postsWithViews.reduce((sum, post) => sum + post.views, 0)
    const totalPosts = postsWithViews.length
    const averageViews =
      totalPosts > 0 ? Math.round(totalViews / totalPosts) : 0

    const exportData: ExportData = {
      exportDate: new Date().toISOString(),
      summary: {
        totalViews,
        totalPosts,
        averageViews,
      },
      posts: postsWithViews.sort((a, b) => b.views - a.views), // 按浏览量排序
      tagStats,
    }

    // 检查URL参数决定返回格式
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'json'

    if (format === 'csv') {
      // 生成CSV格式
      const csvHeader = 'Slug,Title,Date,Views,Tags,Author,ReadTime'
      const csvRows = exportData.posts.map(
        post =>
          `"${post.slug}","${post.title.replace(/"/g, '""')}","${post.date}",${post.views},"${post.tags.join(';')}","${post.author}",${post.readTime}`
      )
      const csvContent = [csvHeader, ...csvRows].join('\n')

      return new Response(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="blog-analytics.csv"',
          'Cache-Control': 'no-cache',
        },
      })
    }

    // 默认返回JSON格式
    const response = createSuccessResponse(exportData)

    // 设置下载头
    if (searchParams.get('download') === 'true') {
      response.headers.set(
        'Content-Disposition',
        'attachment; filename="blog-analytics.json"'
      )
    }

    return response
  } catch (error) {
    console.error('Export Analytics API错误:', error)
    return createErrorResponse('导出数据失败', 500)
  }
}

// 支持OPTIONS请求用于CORS
export async function OPTIONS() {
  return new Response(null, { status: 200 })
}
