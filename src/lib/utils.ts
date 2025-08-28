import { type ClassValue, clsx } from 'clsx'
import { format, parseISO } from 'date-fns'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  try {
    const date = parseISO(dateString)
    return format(date, 'MMM dd, yyyy')
  } catch {
    return dateString
  }
}

export function formatDateChinese(dateString: string): string {
  try {
    const date = parseISO(dateString)
    return format(date, 'yyyy年MM月dd日')
  } catch {
    return dateString
  }
}

export function generateRSSFeed(posts: any[]) {
  // RSS feed generation logic
  return `<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0">
      <channel>
        <title>我的博客</title>
        <description>分享技术心得与生活感悟</description>
        <link>https://your-blog-url.com</link>
        ${posts
          .map(
            post => `
          <item>
            <title>${post.title}</title>
            <description>${post.description}</description>
            <link>https://your-blog-url.com/blog/${post.slug}</link>
            <pubDate>${new Date(post.date).toUTCString()}</pubDate>
          </item>
        `
          )
          .join('')}
      </channel>
    </rss>`
}

export function truncateText(text: string, length: number): string {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}
