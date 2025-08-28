// === API 相关类型定义 ===

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp?: string
}

export interface PaginatedResponse<T = any> extends ApiResponse<T> {
  data: {
    items: T[]
    total: number
    page: number
    limit: number
    hasMore: boolean
  }
}

export interface ViewsApiRequest {
  slug: string
}

export interface ViewsApiResponse extends ApiResponse {
  data?: {
    slug: string
    views: number
  }
}

export interface SearchApiResponse extends ApiResponse {
  data?: {
    results: Array<{
      slug: string
      title: string
      description: string
      content: string
      tags: string[]
    }>
    total: number
    query: string
  }
}
