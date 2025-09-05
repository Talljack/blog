import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { Redis } from '@upstash/redis'
import { Resend } from 'resend'

// 订阅请求验证
const subscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
})

// Redis client for storing subscribers
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Resend client for sending emails
const resend = new Resend(process.env.RESEND_API_KEY!)

// 邮件验证正则
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 验证请求数据
    const result = subscribeSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: '请输入有效的邮箱地址' },
        { status: 400 }
      )
    }

    const { email } = result.data
    const normalizedEmail = email.toLowerCase()

    // 额外邮件格式验证
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: '邮箱格式不正确' },
        { status: 400 }
      )
    }

    // 检查是否已订阅
    const subscriberKey = `newsletter:subscriber:${normalizedEmail}`
    const existingSubscriber = await redis.get(subscriberKey)
    if (existingSubscriber) {
      return NextResponse.json(
        { success: false, message: '该邮箱已经订阅过了' },
        { status: 409 }
      )
    }

    // 生成取消订阅token
    const unsubscribeToken = crypto.randomUUID()

    // 存储订阅信息到Redis
    const subscriberData = {
      email: normalizedEmail,
      subscribedAt: new Date().toISOString(),
      unsubscribeToken,
      active: true,
    }

    await redis.set(subscriberKey, JSON.stringify(subscriberData))
    await redis.sadd('newsletter:emails', normalizedEmail)
    await redis.incr('newsletter:count')

    // 发送欢迎邮件
    try {
      const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM || 'noreply@your-domain.com',
        to: email,
        subject: '🎉 欢迎订阅我的博客！',
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">🎉 欢迎订阅！</h1>
            </div>
            
            <div style="background: white; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-bottom: 20px; font-size: 20px;">感谢您的订阅！</h2>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">您已成功订阅我的博客。我将定期分享关于技术、开发和编程的精彩内容。</p>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">承诺：我们绝不会发送垃圾邮件，您的邮箱信息将被严格保护。</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/blog" 
                   style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">查看最新文章</a>
              </div>
              
              <hr style="border: none; height: 1px; background: #eee; margin: 30px 0;" />
              
              <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
                如果您不想再接收邮件，可以 <a href="${process.env.NEXT_PUBLIC_SITE_URL}/api/newsletter/unsubscribe?token=${unsubscribeToken}" 
                style="color: #667eea; text-decoration: none;">取消订阅</a>
              </p>
            </div>
          </div>
        `,
      })

      if (error) {
        console.error('Failed to send welcome email:', error)
        // 即使邮件发送失败，订阅仍然有效
      }
    } catch (emailError) {
      console.error('Welcome email sending error:', emailError)
    }

    return NextResponse.json({
      success: true,
      message: '订阅成功！欢迎邮件已发送到您的邮箱。',
    })
  } catch (error) {
    console.error('Newsletter subscription error:', error)

    return NextResponse.json(
      { success: false, message: '服务器错误，请稍后重试' },
      { status: 500 }
    )
  }
}

// 获取订阅统计（可选的管理端点）
export async function GET() {
  try {
    const count = (await redis.get('newsletter:count')) || 0
    return NextResponse.json({
      count: Number(count),
      // 不返回具体邮箱地址以保护隐私
    })
  } catch (error) {
    console.error('Failed to get subscriber count:', error)
    return NextResponse.json({ count: 0 })
  }
}

// 取消订阅端点 (通过邮箱)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { success: false, message: '缺少邮箱参数' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase()
    const subscriberKey = `newsletter:subscriber:${normalizedEmail}`
    const subscriberData = await redis.get(subscriberKey)

    if (subscriberData) {
      await redis.del(subscriberKey)
      await redis.srem('newsletter:emails', normalizedEmail)
      await redis.decr('newsletter:count')

      return NextResponse.json({
        success: true,
        message: '取消订阅成功',
      })
    } else {
      return NextResponse.json(
        { success: false, message: '该邮箱未找到订阅记录' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Unsubscribe error:', error)

    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    )
  }
}
