import { getAllPosts } from '@/lib/blog'
import { siteConfig } from '@/lib/config'
import { NextRequest } from 'next/server'

export async function GET(_request: NextRequest) {
  try {
    const posts = await getAllPosts()
    const siteUrl = process.env.SITE_URL || siteConfig.url

    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:sy="http://purl.org/rss/1.0/modules/syndication/">
  <channel>
    <title><![CDATA[${siteConfig.name}]]></title>
    <description><![CDATA[${siteConfig.description}]]></description>
    <link>${siteUrl}</link>
    <language>zh-cn</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <generator>Next.js RSS Generator v1.0</generator>
    <webMaster>${siteConfig.author.social?.email || 'noreply@example.com'} (${siteConfig.author.name})</webMaster>
    <managingEditor>${siteConfig.author.social?.email || 'noreply@example.com'} (${siteConfig.author.name})</managingEditor>
    <copyright>Copyright © ${new Date().getFullYear()} ${siteConfig.author.name}. All rights reserved.</copyright>
    <category>Technology</category>
    <category>Programming</category>
    <category>Web Development</category>
    <ttl>60</ttl>
    <sy:updatePeriod>hourly</sy:updatePeriod>
    <sy:updateFrequency>1</sy:updateFrequency>
    <image>
      <url>${siteUrl}/og-image.jpg</url>
      <title>${siteConfig.name}</title>
      <link>${siteUrl}</link>
      <width>1200</width>
      <height>630</height>
      <description>${siteConfig.description}</description>
    </image>
    ${posts
      .slice(0, 50) // 限制RSS条目数量以提高性能
      .map((post, _index) => {
        const postUrl = `${siteUrl}/blog/${post.slug}`
        const pubDate = new Date(post.date).toUTCString()
        const lastMod = post.lastModified
          ? new Date(post.lastModified).toUTCString()
          : pubDate

        return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <description><![CDATA[${post.description || ''}]]></description>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <dc:creator><![CDATA[${post.author || siteConfig.author.name}]]></dc:creator>
      <dc:date>${lastMod}</dc:date>
      <category>Technology</category>
      ${post.tags?.map(tag => `      <category><![CDATA[${tag}]]></category>`).join('\n') || ''}
      ${post.featured ? '      <category><![CDATA[Featured]]></category>' : ''}
      <content:encoded><![CDATA[
        <div>
          <p>${post.description || ''}</p>
          <p><strong>标签:</strong> ${post.tags?.join(', ') || '无'}</p>
          <p><strong>阅读时间:</strong> ${post.readTime || 5} 分钟</p>
          <p><strong>作者:</strong> ${post.author || siteConfig.author.name}</p>
          ${post.featured ? '<p><strong>⭐ 精选文章</strong></p>' : ''}
          <p><a href="${postUrl}" target="_blank" rel="noopener noreferrer">阅读全文 →</a></p>
        </div>
      ]]></content:encoded>
    </item>`
      })
      .join('')}
  </channel>
</rss>`

    return new Response(rssXml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        'CDN-Cache-Control': 'public, s-maxage=3600',
        'Vercel-CDN-Cache-Control': 'public, s-maxage=3600',
        'X-Robots-Tag': 'noindex', // RSS feeds shouldn't be indexed
      },
    })
  } catch (error) {
    console.error('Error generating RSS feed:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}

export const revalidate = 3600 // 1 hour
