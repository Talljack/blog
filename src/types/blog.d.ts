// === 博客相关类型定义 ===

export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  lastModified?: string
  author?: string
  tags?: string[]
  featured?: boolean
  readTime: number
  content: string
  excerpt?: string
  // 新增字段
  category?: string
  series?: string
  coverImage?: string
  tableOfContents?: TableOfContentsItem[]
}

export interface BlogMetadata {
  title: string
  description: string
  date: string
  lastModified?: string
  author?: string
  tags?: string[]
  featured?: boolean
  category?: string
  series?: string
  coverImage?: string
}

// 目录导航相关类型
export interface TableOfContentsItem {
  id: string
  title: string
  level: number // 1-6 对应 h1-h6
  children?: TableOfContentsItem[]
}

// 文章分享相关类型
export interface ShareData {
  title: string
  url: string
  description?: string
  image?: string
}

export interface SharePlatform {
  name: string
  icon: string
  url: (data: ShareData) => string
  color: string
}

// 浏览量相关类型
export interface ViewsData {
  [slug: string]: number
}

export interface ViewsApiResponse {
  success: boolean
  data?:
    | {
        slug?: string
        views: number
        storage?: 'redis' | 'file'
      }
    | Record<string, number>
  error?: string
  timestamp?: string
}

// 阅读进度类型
export interface ReadingProgressData {
  progress: number
  timeSpent: number
  isCompleted: boolean
}

// 文章搜索结果类型
export interface SearchResult {
  item: BlogPost
  score: number
  matches: Array<{
    key: string
    value: string
    indices: number[][]
  }>
}

// 文章过滤器类型
export interface BlogFilter {
  tags?: string[]
  category?: string
  featured?: boolean
  dateRange?: {
    start: string
    end: string
  }
}

// 分页类型
export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}
