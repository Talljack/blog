import { BlogPostMeta } from './blog'
import { siteConfig } from './config'

interface OGImageOptions {
  title: string
  description?: string
  type?: 'website' | 'article' | 'course' | 'template'
  tags?: string[]
  author?: string
  date?: string
}

/**
 * 生成Open Graph图片URL
 */
export function generateOGImageUrl(options: OGImageOptions): string {
  const { title, description, type = 'website', tags, author, date } = options

  const params = new URLSearchParams()
  params.append('title', title)

  if (description) {
    params.append('description', description)
  }

  params.append('type', type)

  if (tags && tags.length > 0) {
    params.append('tags', tags.join(','))
  }

  if (author) {
    params.append('author', author)
  }

  if (date) {
    params.append('date', date)
  }

  const baseUrl = process.env.SITE_URL || siteConfig.url
  return `${baseUrl}/og?${params.toString()}`
}

/**
 * 为博客文章生成OG图片URL
 */
export function generatePostOGImageUrl(post: BlogPostMeta): string {
  return generateOGImageUrl({
    title: post.title,
    description: post.description,
    type: 'article',
    tags: post.tags,
    author: post.author || siteConfig.author.name,
    date: post.date,
  })
}

/**
 * 为页面生成OG图片URL
 */
export function generatePageOGImageUrl(
  title: string,
  description?: string
): string {
  return generateOGImageUrl({
    title,
    description,
    type: 'website',
  })
}

/**
 * 为课程生成OG图片URL
 */
export function generateCourseOGImageUrl(
  title: string,
  description?: string,
  tags?: string[]
): string {
  return generateOGImageUrl({
    title,
    description,
    type: 'course',
    tags,
    author: siteConfig.author.name,
  })
}

/**
 * 为模板生成OG图片URL
 */
export function generateTemplateOGImageUrl(
  title: string,
  description?: string,
  tags?: string[]
): string {
  return generateOGImageUrl({
    title,
    description,
    type: 'template',
    tags,
    author: siteConfig.author.name,
  })
}

/**
 * 获取默认的OG图片URL
 */
export function getDefaultOGImageUrl(): string {
  return generatePageOGImageUrl(siteConfig.name, siteConfig.description)
}

/**
 * 根据URL路径自动生成合适的OG图片
 */
export function getOGImageForPath(
  pathname: string,
  title?: string,
  description?: string
): string {
  if (pathname.startsWith('/blog/')) {
    return generateOGImageUrl({
      title: title || '博客文章',
      description,
      type: 'article',
      author: siteConfig.author.name,
    })
  }

  if (pathname.startsWith('/course/')) {
    return generateCourseOGImageUrl(title || '课程', description)
  }

  if (pathname.startsWith('/template/')) {
    return generateTemplateOGImageUrl(title || '模板', description)
  }

  if (pathname === '/about') {
    return generatePageOGImageUrl('关于我', siteConfig.author.bio)
  }

  if (pathname === '/blog') {
    return generatePageOGImageUrl('博客', '技术分享与编程经验')
  }

  return generatePageOGImageUrl(
    title || siteConfig.name,
    description || siteConfig.description
  )
}

/**
 * 验证OG图片URL是否有效
 */
export async function validateOGImage(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    const contentType = response.headers.get('content-type')
    return response.ok && (contentType?.startsWith('image/') ?? false)
  } catch {
    return false
  }
}

/**
 * 获取OG图片的元数据
 */
export async function getOGImageMetadata(url: string) {
  try {
    const response = await fetch(url, { method: 'HEAD' })

    if (!response.ok) {
      return null
    }

    return {
      url,
      width: 1200,
      height: 630,
      alt: 'Open Graph Image',
      type: response.headers.get('content-type') || 'image/png',
      size: parseInt(response.headers.get('content-length') || '0', 10),
    }
  } catch {
    return null
  }
}
