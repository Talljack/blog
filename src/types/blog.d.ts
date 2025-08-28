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
}

export interface BlogMetadata {
  title: string
  description: string
  date: string
  lastModified?: string
  author?: string
  tags?: string[]
  featured?: boolean
}

export interface ViewsData {
  [slug: string]: number
}

export interface ViewsApiResponse {
  success: boolean
  data?: {
    slug?: string
    views: number
  }
  error?: string
  timestamp?: string
}
