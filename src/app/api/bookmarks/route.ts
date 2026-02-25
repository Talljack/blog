import { NextRequest, NextResponse } from 'next/server'
import { bookmarksStorage } from '@/lib/bookmarks-storage'
import {
  saveTweetSchema,
  tweetListParamsSchema,
} from '@/lib/bookmarks-schema'
import { hasAdminAccess } from '@/lib/auth'
import {
  createErrorResponse,
  createSuccessResponse,
  rateLimit,
} from '@/lib/security'

const bookmarksRateLimit = rateLimit({
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
})

export async function GET(request: NextRequest) {
  const rateLimitResult = bookmarksRateLimit(request)
  if (!rateLimitResult.allowed) {
    return createErrorResponse('Rate limit exceeded', 429)
  }

  try {
    const searchParams = request.nextUrl.searchParams
    const paramsObj = Object.fromEntries(searchParams.entries())

    const params = tweetListParamsSchema.parse(paramsObj)

    if (!params.public && !hasAdminAccess(request)) {
      return createErrorResponse('Unauthorized', 401)
    }

    const result = await bookmarksStorage.listTweets(params)

    return createSuccessResponse(result)
  } catch (error) {
    if (error instanceof Error) {
      return createErrorResponse(error.message, 400)
    }
    return createErrorResponse('Failed to get bookmarks', 500)
  }
}

export async function POST(request: NextRequest) {
  const rateLimitResult = bookmarksRateLimit(request)
  if (!rateLimitResult.allowed) {
    return createErrorResponse('Rate limit exceeded', 429)
  }

  if (!hasAdminAccess(request)) {
    return createErrorResponse('Unauthorized', 401)
  }

  try {
    const body = await request.json()
    const data = saveTweetSchema.parse(body)

    const tweet = await bookmarksStorage.saveTweet(data)

    return createSuccessResponse(tweet, 201)
  } catch (error) {
    if (error instanceof Error) {
      return createErrorResponse(error.message, 400)
    }
    return createErrorResponse('Failed to save bookmark', 500)
  }
}
