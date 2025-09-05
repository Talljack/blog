import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

// Redis client for storing subscribers
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return new Response(
        `
        <html>
          <head>
            <title>取消订阅 - 缺少参数</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 100px auto; padding: 20px; text-align: center; }
              .error { color: #dc3545; }
            </style>
          </head>
          <body>
            <h1 class="error">❌ 无效的取消订阅链接</h1>
            <p>链接可能已过期或无效。如需取消订阅，请联系我们。</p>
          </body>
        </html>
        `,
        { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      )
    }

    // 查找所有订阅者，找到匹配token的用户
    const allEmails = await redis.smembers('newsletter:emails')
    let userEmail = null

    for (const email of allEmails) {
      try {
        const subscriberKey = `newsletter:subscriber:${email}`
        const dataStr = await redis.get(subscriberKey)
        if (dataStr) {
          let data
          if (typeof dataStr === 'string') {
            data = JSON.parse(dataStr)
          } else {
            data = dataStr as any // Already an object from Upstash
          }
          if (data.unsubscribeToken === token) {
            userEmail = email
            break
          }
        }
      } catch (e) {
        // Skip invalid data
        continue
      }
    }

    if (!userEmail) {
      return new Response(
        `
        <html>
          <head>
            <title>取消订阅 - 未找到记录</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 100px auto; padding: 20px; text-align: center; }
              .error { color: #dc3545; }
            </style>
          </head>
          <body>
            <h1 class="error">❌ 订阅记录未找到</h1>
            <p>您可能已经取消过订阅，或者链接已经失效。</p>
          </body>
        </html>
        `,
        { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      )
    }

    // 删除订阅记录
    const subscriberKey = `newsletter:subscriber:${userEmail}`
    await redis.del(subscriberKey)
    await redis.srem('newsletter:emails', userEmail)
    await redis.decr('newsletter:count')

    return new Response(
      `
      <html>
        <head>
          <title>取消订阅成功</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              max-width: 600px; 
              margin: 100px auto; 
              padding: 20px; 
              text-align: center; 
              line-height: 1.6;
              background: #f8f9fa;
            }
            .container { 
              background: white; 
              padding: 40px; 
              border-radius: 8px; 
              box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
            }
            .success { color: #28a745; }
            .btn { 
              display: inline-block; 
              padding: 12px 24px; 
              margin: 20px 10px 0; 
              text-decoration: none; 
              border-radius: 6px; 
              font-weight: 500;
            }
            .btn-primary { background: #007bff; color: white; }
            .btn-secondary { background: #6c757d; color: white; }
            .btn:hover { opacity: 0.9; }
            .email { color: #666; font-size: 14px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="success">✅ 取消订阅成功</h1>
            <p>您已成功取消博客邮件订阅。我们很遗憾看到您离开，但完全理解您的决定。</p>
            <p>如果您改变主意，随时欢迎重新订阅。</p>
            
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}" class="btn btn-primary">返回主页</a>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/blog" class="btn btn-secondary">查看文章</a>
            
            <p class="email">已为 <strong>${userEmail}</strong> 取消订阅</p>
          </div>
        </body>
      </html>
      `,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      }
    )
  } catch (error) {
    console.error('Unsubscribe error:', error)

    return new Response(
      `
      <html>
        <head>
          <title>取消订阅 - 服务器错误</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 100px auto; padding: 20px; text-align: center; }
            .error { color: #dc3545; }
          </style>
        </head>
        <body>
          <h1 class="error">⚠️ 服务器错误</h1>
          <p>处理您的请求时出现错误，请稍后重试。</p>
        </body>
      </html>
      `,
      { status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    )
  }
}
