import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// 订阅请求验证
const subscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
})

// 简单的内存存储（生产环境应使用数据库）
const subscribers = new Set<string>()

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

    // 额外邮件格式验证
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: '邮箱格式不正确' },
        { status: 400 }
      )
    }

    // 检查是否已订阅
    if (subscribers.has(email.toLowerCase())) {
      return NextResponse.json(
        { success: false, message: '该邮箱已经订阅过了' },
        { status: 409 }
      )
    }

    // 添加到订阅列表
    subscribers.add(email.toLowerCase())

    // 这里可以集成真实的邮件服务
    // 例如：Resend, SendGrid, Mailchimp 等
    console.log(`新订阅用户: ${email}`)

    // 模拟邮件发送延迟
    await new Promise(resolve => setTimeout(resolve, 1000))

    return NextResponse.json({
      success: true,
      message: '订阅成功！欢迎加入我们的社区。',
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
  return NextResponse.json({
    count: subscribers.size,
    // 不返回具体邮箱地址以保护隐私
  })
}

// 取消订阅端点
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

    if (subscribers.has(email.toLowerCase())) {
      subscribers.delete(email.toLowerCase())
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
