import { getAllPosts } from '@/lib/blog'
import { siteConfig } from '@/lib/config'

export async function GET() {
  const posts = await getAllPosts()
  const siteUrl = siteConfig.url

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title><![CDATA[${siteConfig.name}]]></title>
    <description><![CDATA[${siteConfig.description}]]></description>
    <link>${siteUrl}</link>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <generator>Next.js</generator>
    <webMaster>${siteConfig.author.social.email} (${siteConfig.author.name})</webMaster>
    <managingEditor>${siteConfig.author.social.email} (${siteConfig.author.name})</managingEditor>
    <copyright>Copyright © ${new Date().getFullYear()} ${siteConfig.author.name}. All rights reserved.</copyright>
    <category>Technology</category>
    <image>
      <url>${siteUrl}/og-image.jpg</url>
      <title>${siteConfig.name}</title>
      <link>${siteUrl}</link>
      <width>144</width>
      <height>144</height>
    </image>
    ${posts
      .map(post => {
        const postUrl = `${siteUrl}/blog/${post.slug}`
        const pubDate = new Date(post.date).toUTCString()

        return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <description><![CDATA[${post.description || ''}]]></description>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <author>${siteConfig.author.social.email} (${post.author || siteConfig.author.name})</author>
      <category>Technology</category>
      ${post.tags?.map(tag => `<category><![CDATA[${tag}]]></category>`).join('') || ''}
      <content:encoded><![CDATA[
        <p>${post.description || ''}</p>
        <p><a href="${postUrl}">阅读全文</a></p>
      ]]></content:encoded>
    </item>`
      })
      .join('')}
  </channel>
</rss>`

  return new Response(rssXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
    },
  })
}
