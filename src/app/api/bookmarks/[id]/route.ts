import { NextRequest } from 'next/server'
import { bookmarksStorage } from '@/lib/bookmarks-storage'
import { updateTweetSchema } from '@/lib/bookmarks-schema'
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitResult = bookmarksRateLimit(request)
  if (!rateLimitResult.allowed) {
    return createErrorResponse('Rate limit exceeded', 429)
  }

  try {
    const { id } = await params
    const tweet = await bookmarksStorage.getTweet(id)

    if (!tweet) {
      return createErrorResponse('Bookmark not found', 404)
    }

    if (!tweet.isPublic && !hasAdminAccess(request)) {
      return createErrorResponse('Unauthorized', 401)
    }

    return createSuccessResponse(tweet)
  } catch (error) {
    if (error instanceof Error) {
      return createErrorResponse(error.message, 400)
    }
    return createErrorResponse('Failed to get bookmark', 500)
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitResult = bookmarksRateLimit(request)
  if (!rateLimitResult.allowed) {
    return createErrorResponse('Rate limit exceeded', 429)
  }

  if (!hasAdminAccess(request)) {
    return createErrorResponse('Unauthorized', 401)
  }

  try {
    const { id } = await params
    const body = await request.json()
    const updates = updateTweetSchema.parse(body)

    const tweet = await bookmarksStorage.updateTweet(id, updates)

    if (!tweet) {
      return createErrorResponse('Bookmark not found', 404)
    }

    return createSuccessResponse(tweet)
  } catch (error) {
    if (error instanceof Error) {
      return createErrorResponse(error.message, 400)
    }
    return createErrorResponse('Failed to update bookmark', 500)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitResult = bookmarksRateLimit(request)
  if (!rateLimitResult.allowed) {
    return createErrorResponse('Rate limit exceeded', 429)
  }

  if (!hasAdminAccess(request)) {
    return createErrorResponse('Unauthorized', 401)
  }

  try {
    const { id } = await params
    const success = await bookmarksStorage.deleteTweet(id)

    if (!success) {
      return createErrorResponse('Bookmark not found', 404)
    }

    return createSuccessResponse({ message: 'Bookmark deleted successfully' })
  } catch (error) {
    if (error instanceof Error) {
      return createErrorResponse(error.message, 400)
    }
    return createErrorResponse('Failed to delete bookmark', 500)
  }
}
