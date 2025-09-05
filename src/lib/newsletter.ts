import { getPostBySlug } from './blog'

interface SendNewsletterOptions {
  slug: string
  authorKey: string
  preview?: string
}

export async function sendNewsletter({
  slug,
  authorKey,
  preview,
}: SendNewsletterOptions) {
  const post = await getPostBySlug(slug)

  if (!post) {
    throw new Error(`Post with slug "${slug}" not found`)
  }

  if (!post.newsletter) {
    throw new Error(`Post "${slug}" is not marked for newsletter distribution`)
  }

  // 准备邮件内容
  const payload = {
    title: post.title,
    description: post.description,
    slug: post.slug,
    content: preview || post.content.substring(0, 300).replace(/<[^>]*>/g, ''), // 移除HTML标签
    tags: post.tags,
    authorKey,
  }

  // 调用发送API
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/newsletter/send`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  )

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.message || 'Failed to send newsletter')
  }

  return result
}

// 获取订阅者数量
export async function getSubscriberCount() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/newsletter/subscribe`
    )
    const result = await response.json()
    return result.count || 0
  } catch (error) {
    console.error('Failed to get subscriber count:', error)
    return 0
  }
}

// 获取发送历史
export async function getNewsletterHistory() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/newsletter/send`
    )
    const result = await response.json()
    return result.history || []
  } catch (error) {
    console.error('Failed to get newsletter history:', error)
    return []
  }
}
