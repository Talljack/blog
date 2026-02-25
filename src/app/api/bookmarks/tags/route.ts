import { NextRequest } from 'next/server'
import { bookmarksStorage } from '@/lib/bookmarks-storage'
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

  if (!hasAdminAccess(request)) {
    return createErrorResponse('Unauthorized', 401)
  }

  try {
    const tags = await bookmarksStorage.getAllTags()
    return createSuccessResponse({ tags })
  } catch (error) {
    if (error instanceof Error) {
      return createErrorResponse(error.message, 400)
    }
    return createErrorResponse('Failed to get tags', 500)
  }
}
