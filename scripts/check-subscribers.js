#!/usr/bin/env node

const { config } = require('dotenv')
const path = require('path')

// Load environment variables
config({ path: path.resolve(process.cwd(), '.env.local') })

async function checkSubscribers() {
  try {
    const { Redis } = require('@upstash/redis')

    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })

    console.log('📊 Newsletter 订阅者统计\n')

    // 获取总数
    const totalCount = await redis.get('newsletter:count')
    console.log(`📈 总订阅者数量: ${totalCount || 0}`)

    // 获取所有邮箱
    const allEmails = await redis.smembers('newsletter:emails')
    console.log(`📧 活跃邮箱数量: ${allEmails.length}`)

    if (allEmails.length > 0) {
      console.log('\n👥 订阅者列表:')
      for (const email of allEmails) {
        const subscriberKey = `newsletter:subscriber:${email}`
        const dataStr = await redis.get(subscriberKey)

        if (dataStr) {
          let data
          if (typeof dataStr === 'string') {
            try {
              data = JSON.parse(dataStr)
            } catch (e) {
              data = { email, status: 'invalid_data' }
            }
          } else {
            data = dataStr // Already an object
          }

          const subscribeDate = data.subscribedAt
            ? new Date(data.subscribedAt).toLocaleDateString('zh-CN')
            : '未知'
          const status = data.active !== false ? '✅ 活跃' : '❌ 已停用'

          console.log(`  ${status} ${email} (订阅时间: ${subscribeDate})`)
        } else {
          console.log(`  ❓ ${email} (数据缺失)`)
        }
      }
    } else {
      console.log('\n📭 暂无订阅者')
    }

    // 检查发送历史
    const history = await redis.lrange('newsletter:history', 0, 4)
    console.log(`\n📜 最近发送历史 (${history.length} 条):`)

    if (history.length > 0) {
      history.forEach((record, index) => {
        try {
          const data = JSON.parse(record)
          const sendDate = new Date(data.sentAt).toLocaleString('zh-CN')
          console.log(
            `  ${index + 1}. ${data.title} - 发送给 ${data.recipientCount} 人 (${sendDate})`
          )
          console.log(
            `     成功: ${data.successCount} | 失败: ${data.failedCount}`
          )
        } catch (e) {
          console.log(`  ${index + 1}. 无效记录`)
        }
      })
    } else {
      console.log('  暂无发送记录')
    }
  } catch (error) {
    console.error('❌ 检查失败:', error.message)
  }
}

checkSubscribers()
