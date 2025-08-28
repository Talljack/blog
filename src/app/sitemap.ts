import { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/blog'
import { siteConfig } from '@/lib/config'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts()
  const baseUrl = siteConfig.url

  // 静态页面
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]

  // 博客文章页面 - 使用更智能的优先级计算
  const postRoutes: MetadataRoute.Sitemap = posts.map(post => {
    const daysSincePublication = Math.floor(
      (new Date().getTime() - new Date(post.date).getTime()) /
        (1000 * 60 * 60 * 24)
    )
    const isFeatured = post.featured
    const isRecent = daysSincePublication <= 30

    // 动态计算优先级：特色文章 > 最近文章 > 普通文章
    let priority = 0.6
    if (isFeatured && isRecent) priority = 0.9
    else if (isFeatured) priority = 0.8
    else if (isRecent) priority = 0.7

    return {
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: isRecent ? ('weekly' as const) : ('monthly' as const),
      priority,
    }
  })

  // 标签页面
  const allTags = Array.from(new Set(posts.flatMap(post => post.tags)))
  const tagRoutes: MetadataRoute.Sitemap = allTags.map(tag => ({
    url: `${baseUrl}/tag/${encodeURIComponent(tag)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [...staticRoutes, ...postRoutes, ...tagRoutes]
}
