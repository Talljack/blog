import { Metadata } from 'next'
import { BlogPostMeta } from './blog'
import { siteConfig } from './config'
import {
  generatePostOGImageUrl,
  generatePageOGImageUrl,
  getOGImageForPath,
} from './og'

interface BaseMetadataOptions {
  title?: string
  description?: string
  keywords?: string[]
  canonical?: string
  noIndex?: boolean
  image?: string
}

interface ArticleMetadataOptions extends BaseMetadataOptions {
  article: BlogPostMeta
  type: 'article'
}

interface PageMetadataOptions extends BaseMetadataOptions {
  type: 'page'
  path?: string
}

interface CourseMetadataOptions extends BaseMetadataOptions {
  type: 'course'
  instructor?: string
  duration?: string
  level?: string
}

interface TemplateMetadataOptions extends BaseMetadataOptions {
  type: 'template'
  category?: string
  framework?: string
}

type MetadataOptions =
  | ArticleMetadataOptions
  | PageMetadataOptions
  | CourseMetadataOptions
  | TemplateMetadataOptions

/**
 * 生成完整的页面元数据
 */
export function generateMetadata(options: MetadataOptions): Metadata {
  const {
    title,
    description,
    keywords = [],
    canonical,
    noIndex = false,
    image,
  } = options

  // 构建页面标题
  const pageTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.name
  const pageDescription = description || siteConfig.description

  // 构建完整URL
  const baseUrl = process.env.SITE_URL || siteConfig.url
  const canonicalUrl = canonical ? `${baseUrl}${canonical}` : baseUrl

  // 生成或使用提供的图片
  let ogImage: string

  if (image) {
    ogImage = image.startsWith('http') ? image : `${baseUrl}${image}`
  } else {
    switch (options.type) {
      case 'article':
        ogImage = generatePostOGImageUrl(options.article)
        break
      case 'page':
        ogImage = options.path
          ? getOGImageForPath(options.path, title, description)
          : generatePageOGImageUrl(title || siteConfig.name, description)
        break
      default:
        ogImage = generatePageOGImageUrl(title || siteConfig.name, description)
    }
  }

  // 基础元数据
  const metadata: Metadata = {
    title: pageTitle,
    description: pageDescription,

    // 关键词
    keywords: keywords.length > 0 ? keywords.join(', ') : undefined,

    // 作者信息
    authors: [{ name: siteConfig.author.name, url: siteConfig.url }],

    // 语言和地区
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'zh-CN': canonicalUrl,
      },
    },

    // 机器人指令
    robots: noIndex ? 'noindex,nofollow' : 'index,follow',

    // Open Graph
    openGraph: {
      type: options.type === 'article' ? 'article' : 'website',
      title: title || siteConfig.name,
      description: pageDescription,
      url: canonicalUrl,
      siteName: siteConfig.name,
      locale: 'zh_CN',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${title || siteConfig.name} - ${pageDescription}`,
        },
      ],
    },

    // Twitter
    twitter: {
      card: 'summary_large_image',
      title: title || siteConfig.name,
      description: pageDescription,
      images: [ogImage],
      creator: siteConfig.author.social?.twitter
        ? `@${siteConfig.author.social.twitter.replace('@', '')}`
        : undefined,
      site: siteConfig.author.social?.twitter
        ? `@${siteConfig.author.social.twitter.replace('@', '')}`
        : undefined,
    },

    // 其他元数据
    category: 'Technology',

    // 应用程序特定
    applicationName: siteConfig.name,

    // 格式检测
    formatDetection: {
      telephone: false,
      date: false,
      address: false,
      email: false,
      url: false,
    },

    // 视口
    viewport: {
      width: 'device-width',
      initialScale: 1,
      maximumScale: 5,
    },

    // 主题颜色
    themeColor: [
      { media: '(prefers-color-scheme: light)', color: '#ffffff' },
      { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
    ],

    // 图标
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      ],
      apple: [
        { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      ],
    },

    // Web App Manifest
    manifest: '/site.webmanifest',
  }

  // 文章特定元数据
  if (options.type === 'article' && 'article' in options) {
    const article = options.article

    // 重新设置 Open Graph 为文章类型
    metadata.openGraph = {
      ...metadata.openGraph!,
      type: 'article',
      authors: [article.author || siteConfig.author.name],
      publishedTime: article.date,
      modifiedTime: article.lastModified || article.date,
      section: 'Technology',
      tags: article.tags || [],
    }

    // 添加结构化数据 (handled by StructuredData component)
    const _structuredData = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: article.title,
      description: article.description,
      image: ogImage,
      author: {
        '@type': 'Person',
        name: article.author || siteConfig.author.name,
        url: siteConfig.author.social?.github || siteConfig.url,
      },
      publisher: {
        '@type': 'Organization',
        name: siteConfig.name,
        url: siteConfig.url,
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/logo.png`,
        },
      },
      datePublished: new Date(article.date).toISOString(),
      dateModified: article.lastModified
        ? new Date(article.lastModified).toISOString()
        : new Date(article.date).toISOString(),
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': canonicalUrl,
      },
      keywords: article.tags?.join(', ') || '',
      wordCount: article.readTime
        ? Math.ceil(article.readTime * 200)
        : undefined,
      timeRequired: article.readTime ? `PT${article.readTime}M` : undefined,
      articleSection: 'Technology',
      inLanguage: 'zh-CN',
      isAccessibleForFree: true,
    }

    // Note: Structured data will be handled by StructuredData component instead
    // metadata.other = {
    //   ...metadata.other,
    //   'script:ld+json': JSON.stringify(structuredData),
    // }
  }

  return metadata
}

/**
 * 为博客文章生成元数据
 */
export function generateArticleMetadata(
  article: BlogPostMeta,
  options: Partial<BaseMetadataOptions> = {}
): Metadata {
  return generateMetadata({
    type: 'article',
    article,
    title: article.title,
    description: article.description,
    keywords: article.tags,
    canonical: `/blog/${article.slug}`,
    ...options,
  })
}

/**
 * 为页面生成元数据
 */
export function generatePageMetadata(
  title: string,
  description?: string,
  options: Partial<PageMetadataOptions> = {}
): Metadata {
  return generateMetadata({
    type: 'page',
    title,
    description,
    ...options,
  })
}

/**
 * 为课程生成元数据
 */
export function generateCourseMetadata(
  title: string,
  description?: string,
  options: Partial<CourseMetadataOptions> = {}
): Metadata {
  return generateMetadata({
    type: 'course',
    title,
    description,
    keywords: ['课程', '教程', '编程', ...(options.keywords || [])],
    ...options,
  })
}

/**
 * 为模板生成元数据
 */
export function generateTemplateMetadata(
  title: string,
  description?: string,
  options: Partial<TemplateMetadataOptions> = {}
): Metadata {
  return generateMetadata({
    type: 'template',
    title,
    description,
    keywords: ['模板', '代码', '开源', ...(options.keywords || [])],
    ...options,
  })
}

/**
 * 为标签页生成元数据
 */
export function generateTagMetadata(tag: string): Metadata {
  return generatePageMetadata(
    `${tag} 相关文章`,
    `浏览所有关于 ${tag} 的技术文章和教程`,
    {
      path: `/tag/${tag}`,
      keywords: [tag, '文章', '技术', '编程'],
    }
  )
}

/**
 * 为搜索页生成元数据
 */
export function generateSearchMetadata(query?: string): Metadata {
  const title = query ? `搜索: ${query}` : '搜索'
  const description = query
    ? `搜索 "${query}" 的相关文章和内容`
    : '搜索博客文章、课程和模板'

  return generatePageMetadata(title, description, {
    path: '/search',
    keywords: ['搜索', '文章', '内容'],
    noIndex: true, // 搜索页面通常不需要被索引
  })
}

/**
 * 获取默认的网站元数据
 */
export function getDefaultMetadata(): Metadata {
  return generatePageMetadata(siteConfig.name, siteConfig.description, {
    path: '/',
  })
}
