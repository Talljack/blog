// === 配置相关类型定义 ===

export interface SiteConfig {
  name: string
  description: string
  url: string
  ogImage: string
  author: AuthorConfig
  navigation: NavigationItem[]
  seo: SEOConfig
  rss: RSSConfig
  giscus: GiscusConfig
  analytics: AnalyticsConfig
  features: FeaturesConfig
  settings: SettingsConfig
}

export interface AuthorConfig {
  name: string
  bio: string
  avatar: string
  social: {
    twitter?: string
    github?: string
    email?: string
  }
}

export interface NavigationItem {
  name: string
  href: string
}

export interface SEOConfig {
  keywords: string[]
}

export interface RSSConfig {
  title: string
  description: string
}

export interface GiscusConfig {
  repo: string
  repoId: string
  category: string
  categoryId: string
}

export interface AnalyticsConfig {
  googleAnalyticsId: string
}

export interface FeaturesConfig {
  enableSearch: boolean
  enableComments: boolean
  enableAnalytics: boolean
  enableRss: boolean
}

export interface SettingsConfig {
  postsPerPage: number
  maxRecentPosts: number
  maxPopularPosts: number
  maxTagsDisplay: number
}
