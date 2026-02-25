import { NextRequest } from 'next/server'
import { bookmarksStorage } from '@/lib/bookmarks-storage'
import { exportFormatSchema } from '@/lib/bookmarks-schema'
import { hasAdminAccess } from '@/lib/auth'
import {
  createErrorResponse,
  createSuccessResponse,
  rateLimit,
} from '@/lib/security'
import { Tweet } from '@/types/bookmarks'

const bookmarksRateLimit = rateLimit({
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
})

function generateMarkdown(tweets: Tweet[]): string {
  let markdown = '# 我的 X 推文收藏\n\n'
  markdown += `导出时间: ${new Date().toISOString()}\n\n`
  markdown += `总计: ${tweets.length} 条推文\n\n`

  const tweetsByTag: Record<string, Tweet[]> = {}
  const untagged: Tweet[] = []

  tweets.forEach((tweet) => {
    if (tweet.tags.length === 0) {
      untagged.push(tweet)
    } else {
      tweet.tags.forEach((tag) => {
        if (!tweetsByTag[tag]) {
          tweetsByTag[tag] = []
        }
        tweetsByTag[tag].push(tweet)
      })
    }
  })

  Object.keys(tweetsByTag)
    .sort()
    .forEach((tag) => {
      markdown += `## ${tag}\n\n`
      tweetsByTag[tag].forEach((tweet) => {
        markdown += `### @${tweet.authorUsername}\n\n`
        markdown += `- **URL**: ${tweet.url}\n`
        markdown += `- **保存时间**: ${new Date(tweet.savedAt).toLocaleString('zh-CN')}\n`
        markdown += `- **标签**: ${tweet.tags.join(', ')}\n`
        if (tweet.notes) {
          markdown += `- **笔记**: ${tweet.notes}\n`
        }
        markdown += '\n'
      })
    })

  if (untagged.length > 0) {
    markdown += `## 未分类\n\n`
    untagged.forEach((tweet) => {
      markdown += `### @${tweet.authorUsername}\n\n`
      markdown += `- **URL**: ${tweet.url}\n`
      markdown += `- **保存时间**: ${new Date(tweet.savedAt).toLocaleString('zh-CN')}\n`
      if (tweet.notes) {
        markdown += `- **笔记**: ${tweet.notes}\n`
      }
      markdown += '\n'
    })
  }

  return markdown
}

export async function GET(request: NextRequest) {
  const rateLimitResult = bookmarksRateLimit(request)
  if (!rateLimitResult.allowed) {
    return createErrorResponse('Rate limit exceeded', 429)
  }

  if (!hasAdminAccess(request)) {
    return createErrorResponse('Unauthorized', 401)
  }

  try {
    const searchParams = request.nextUrl.searchParams
    const format = searchParams.get('format') || 'json'

    const validatedFormat = exportFormatSchema.parse(format)
    const tweets = await bookmarksStorage.exportAllTweets()

    if (validatedFormat === 'markdown') {
      const markdown = generateMarkdown(tweets)
      return new Response(markdown, {
        status: 200,
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Content-Disposition': `attachment; filename="bookmarks-${new Date().toISOString().split('T')[0]}.md"`,
        },
      })
    } else {
      const exportData = {
        tweets,
        exportedAt: new Date().toISOString(),
        totalCount: tweets.length,
      }
      return new Response(JSON.stringify(exportData, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Disposition': `attachment; filename="bookmarks-${new Date().toISOString().split('T')[0]}.json"`,
        },
      })
    }
  } catch (error) {
    if (error instanceof Error) {
      return createErrorResponse(error.message, 400)
    }
    return createErrorResponse('Failed to export bookmarks', 500)
  }
}
