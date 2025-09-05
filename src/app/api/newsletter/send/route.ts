import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'
import { Resend } from 'resend'
import { z } from 'zod'
import { getPostBySlug } from '@/lib/blog'

// Redis client for storing subscribers
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Resend client for sending emails
const resend = new Resend(process.env.RESEND_API_KEY!)

// 发送邮件请求验证
const sendNewsletterSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
  title: z.string().optional(),
  description: z.string().optional(),
  content: z.string().optional(), // 可选的预览内容
  tags: z.array(z.string()).optional(),
  authorKey: z.string().min(1, 'Authorization required'), // 简单的认证
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 验证请求数据
    const result = sendNewsletterSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: '请求参数不正确',
          errors: result.error.issues,
        },
        { status: 400 }
      )
    }

    const { slug, title, description, content, tags, authorKey } = result.data

    // 简单的认证检查（生产环境应使用更安全的方式）
    if (authorKey !== process.env.NEWSLETTER_AUTH_KEY) {
      return NextResponse.json(
        { success: false, message: '未授权访问' },
        { status: 401 }
      )
    }

    // 获取文章信息
    const post = await getPostBySlug(slug)
    if (!post) {
      return NextResponse.json(
        { success: false, message: `文章 "${slug}" 未找到` },
        { status: 404 }
      )
    }

    if (!post.newsletter) {
      return NextResponse.json(
        { success: false, message: `文章 "${slug}" 未标记为发送Newsletter` },
        { status: 400 }
      )
    }

    // 使用文章信息
    const finalTitle = title || post.title
    const finalDescription = description || post.description
    const finalContent =
      content || post.content.substring(0, 300).replace(/<[^>]*>/g, '') // 移除HTML标签
    const finalTags = tags || post.tags

    // 获取所有活跃订阅者
    const allEmails = await redis.smembers('newsletter:emails')
    const activeSubscribers: string[] = []

    for (const email of allEmails) {
      try {
        const subscriberKey = `newsletter:subscriber:${email}`
        const dataStr = await redis.get(subscriberKey)
        if (dataStr) {
          // Handle both string and object responses from Upstash
          let data
          if (typeof dataStr === 'string') {
            data = JSON.parse(dataStr)
          } else {
            data = dataStr // Already an object
          }

          if (data.active !== false) {
            // 默认为激活状态
            activeSubscribers.push(email)
          }
        }
      } catch (e) {
        console.error(`Error processing subscriber ${email}:`, e)
        // Skip invalid data
        continue
      }
    }

    if (activeSubscribers.length === 0) {
      return NextResponse.json({
        success: true,
        message: '没有活跃的订阅者',
        sentCount: 0,
      })
    }

    const postUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${slug}`
    const tagsHtml =
      finalTags && finalTags.length > 0
        ? `<div style="margin: 20px 0;">
           ${finalTags.map(tag => `<span style="background: #e3f2fd; color: #1976d2; padding: 4px 12px; border-radius: 20px; font-size: 12px; margin-right: 8px; display: inline-block;">${tag}</span>`).join('')}
         </div>`
        : ''

    // 批量发送邮件（可以考虑分批发送避免达到API限制）
    const emailPromises = activeSubscribers.map(async email => {
      try {
        // 获取订阅者的取消订阅token
        const subscriberKey = `newsletter:subscriber:${email}`
        const subscriberDataStr = await redis.get(subscriberKey)
        let unsubscribeToken = ''

        if (subscriberDataStr) {
          try {
            let subscriberData
            if (typeof subscriberDataStr === 'string') {
              subscriberData = JSON.parse(subscriberDataStr)
            } else {
              subscriberData = subscriberDataStr // Already an object
            }
            unsubscribeToken = subscriberData.unsubscribeToken || ''
          } catch (e) {
            // Continue without unsubscribe link if data is corrupted
          }
        }

        const { data, error } = await resend.emails.send({
          from: process.env.EMAIL_FROM || 'noreply@your-domain.com',
          to: email,
          subject: `🎉 来自 Talljack 的新文章：${finalTitle}`,
          html: `
            <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8f9fa; padding: 20px;">
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0;">
                <h1 style="color: white; margin: 0 0 8px 0; font-size: 28px; font-weight: 700;">📝 新文章发布</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 16px;">来自 Talljack 技术博客</p>
              </div>
              
              <!-- Content -->
              <div style="background: white; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 8px 25px rgba(0,0,0,0.1);">
                <!-- Article Title -->
                <h2 style="color: #1a202c; margin: 0 0 20px 0; font-size: 24px; line-height: 1.3; font-weight: 600;">${finalTitle}</h2>
                
                <!-- Description -->
                ${
                  finalDescription
                    ? `
                  <div style="background: linear-gradient(90deg, #667eea08 0%, #764ba208 100%); padding: 20px; border-radius: 8px; margin-bottom: 24px; border-left: 3px solid #667eea;">
                    <p style="color: #4a5568; line-height: 1.6; margin: 0; font-size: 16px; font-weight: 500;">${finalDescription}</p>
                  </div>
                `
                    : ''
                }
                
                <!-- Tags -->
                ${
                  tagsHtml
                    ? `
                  <div style="margin: 24px 0;">
                    <p style="color: #718096; font-size: 13px; margin: 0 0 8px 0; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">文章标签</p>
                    ${tagsHtml}
                  </div>
                `
                    : ''
                }
                
                <!-- Content Preview -->
                ${
                  finalContent
                    ? `
                  <div style="background: #f7fafc; padding: 24px; border-radius: 8px; margin: 24px 0; border: 1px solid #e2e8f0;">
                    <p style="color: #718096; font-size: 13px; margin: 0 0 12px 0; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">内容预览</p>
                    <p style="color: #4a5568; line-height: 1.7; margin: 0; font-size: 15px;">${finalContent.substring(0, 180)}${finalContent.length > 180 ? '...' : ''}</p>
                  </div>
                `
                    : ''
                }
                
                <!-- CTA Button -->
                <div style="text-align: center; margin: 36px 0;">
                  <a href="${postUrl}" 
                     style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3); transition: all 0.3s ease;">
                    🔗 立即阅读完整文章
                  </a>
                </div>
                
                <!-- Divider -->
                <div style="background: linear-gradient(90deg, transparent 0%, #e2e8f0 50%, transparent 100%); height: 1px; margin: 32px 0;"></div>
                
                <!-- Footer Info -->
                <div style="text-align: center; margin-bottom: 24px;">
                  <p style="color: #4a5568; margin: 0 0 12px 0; font-size: 15px; font-weight: 500;">感谢您的订阅 ❤️</p>
                  <div style="margin: 16px 0;">
                    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/blog" style="color: #667eea; text-decoration: none; font-size: 14px; margin: 0 12px; font-weight: 500;">📚 查看所有文章</a>
                    <span style="color: #cbd5e0;">•</span>
                    <a href="${process.env.NEXT_PUBLIC_SITE_URL}" style="color: #667eea; text-decoration: none; font-size: 14px; margin: 0 12px; font-weight: 500;">🏠 访问主页</a>
                  </div>
                </div>
                
                <!-- Unsubscribe -->
                ${
                  unsubscribeToken
                    ? `
                  <div style="background: #f7fafc; padding: 16px; border-radius: 6px; text-align: center;">
                    <p style="color: #718096; font-size: 12px; margin: 0; line-height: 1.5;">
                      不想再接收邮件？<a href="${process.env.NEXT_PUBLIC_SITE_URL}/api/newsletter/unsubscribe?token=${unsubscribeToken}" 
                      style="color: #667eea; text-decoration: none; font-weight: 500;">点击取消订阅</a>
                    </p>
                  </div>
                `
                    : ''
                }
              </div>
              
              <!-- Brand Footer -->
              <div style="text-align: center; margin-top: 20px;">
                <p style="color: #718096; font-size: 12px; margin: 0;">
                  📧 此邮件由 <strong style="color: #4a5568;">Talljack 技术博客</strong> 发送
                </p>
              </div>
            </div>
          `,
        })

        if (error) {
          console.error(`Failed to send newsletter to ${email}:`, error)
          return { email, success: false, error }
        }

        return { email, success: true, data }
      } catch (error) {
        console.error(`Newsletter sending error for ${email}:`, error)
        return { email, success: false, error }
      }
    })

    // 等待所有邮件发送完成
    const results = await Promise.allSettled(emailPromises)

    const successCount = results.filter(
      result => result.status === 'fulfilled' && result.value.success
    ).length

    const failedCount = results.length - successCount

    // 记录发送历史（可选）
    const sendRecord = {
      title: finalTitle,
      slug,
      sentAt: new Date().toISOString(),
      recipientCount: activeSubscribers.length,
      successCount,
      failedCount,
    }

    await redis.lpush('newsletter:history', JSON.stringify(sendRecord))

    return NextResponse.json({
      success: true,
      message: `邮件发送完成: ${successCount} 成功, ${failedCount} 失败`,
      sentCount: successCount,
      failedCount,
      totalSubscribers: activeSubscribers.length,
    })
  } catch (error) {
    console.error('Newsletter sending error:', error)

    return NextResponse.json(
      { success: false, message: '服务器错误，请稍后重试' },
      { status: 500 }
    )
  }
}

// 获取发送历史
export async function GET() {
  try {
    const history = await redis.lrange('newsletter:history', 0, 9) // 获取最近10条记录
    const parsedHistory = history
      .map(record => {
        try {
          return JSON.parse(record)
        } catch (e) {
          return null
        }
      })
      .filter(record => record !== null)

    return NextResponse.json({
      success: true,
      history: parsedHistory,
    })
  } catch (error) {
    console.error('Failed to get newsletter history:', error)
    return NextResponse.json(
      { success: false, message: '获取发送历史失败' },
      { status: 500 }
    )
  }
}
