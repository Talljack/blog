#!/usr/bin/env node

/**
 * Newsletter Sending Script
 *
 * Usage:
 *   npm run newsletter:send <slug> [preview]
 *   node scripts/send-newsletter.js <slug> [preview]
 *
 * Examples:
 *   npm run newsletter:send hello-world
 *   npm run newsletter:send hello-world "Check out my latest thoughts on blogging..."
 */

const { config } = require('dotenv')
const path = require('path')

// Load environment variables
config({ path: path.resolve(process.cwd(), '.env.local') })

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3004'
const AUTH_KEY = process.env.NEWSLETTER_AUTH_KEY

async function sendNewsletter(slug, preview) {
  if (!AUTH_KEY) {
    console.error('❌ NEWSLETTER_AUTH_KEY not found in environment variables')
    console.error('Please set NEWSLETTER_AUTH_KEY in your .env.local file')
    process.exit(1)
  }

  try {
    console.log(`📧 Sending newsletter for post: ${slug}`)

    // 首先获取文章信息
    const postResponse = await fetch(`${SITE_URL}/blog/${slug}`)
    if (!postResponse.ok) {
      throw new Error(`Post "${slug}" not found or not accessible`)
    }

    const response = await fetch(`${SITE_URL}/api/newsletter/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        slug,
        title: `Newsletter for ${slug}`, // 临时标题，API会从文章中获取
        description: preview || '',
        content: preview || '',
        tags: [],
        authorKey: AUTH_KEY,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Failed to send newsletter')
    }

    console.log('✅ Newsletter sent successfully!')
    console.log(`📊 Sent to ${result.sentCount} subscribers`)

    if (result.failedCount > 0) {
      console.log(`⚠️  Failed to send to ${result.failedCount} subscribers`)
    }

    console.log(`📈 Total active subscribers: ${result.totalSubscribers}`)
  } catch (error) {
    console.error('❌ Error sending newsletter:', error.message)
    process.exit(1)
  }
}

async function getSubscriberStats() {
  try {
    const response = await fetch(`${SITE_URL}/api/newsletter/subscribe`)
    const result = await response.json()
    return result.count || 0
  } catch (error) {
    console.error('Failed to get subscriber stats:', error.message)
    return 0
  }
}

async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
📧 Newsletter Sending Tool

Usage:
  node scripts/send-newsletter.js <slug> [preview]

Arguments:
  slug     - The blog post slug to send as newsletter
  preview  - Optional preview text (if not provided, auto-generated from content)

Examples:
  node scripts/send-newsletter.js hello-world
  node scripts/send-newsletter.js hello-world "Check out my latest thoughts..."

Environment Variables Required:
  - NEWSLETTER_AUTH_KEY: Authentication key for sending newsletters
  - NEXT_PUBLIC_SITE_URL: Your site URL (defaults to http://localhost:3000)
  - RESEND_API_KEY: Resend API key for sending emails
  - UPSTASH_REDIS_REST_URL: Upstash Redis URL for subscriber storage
  - UPSTASH_REDIS_REST_TOKEN: Upstash Redis token
`)
    process.exit(0)
  }

  const [slug, preview] = args

  // Check if required environment variables are set
  const requiredEnvVars = [
    'NEWSLETTER_AUTH_KEY',
    'RESEND_API_KEY',
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN',
  ]

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName])

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:')
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`)
    })
    console.error('\nPlease add these variables to your .env.local file')
    process.exit(1)
  }

  console.log('🚀 Starting newsletter sending process...')

  // Show current subscriber count
  const subscriberCount = await getSubscriberStats()
  console.log(`📊 Current subscribers: ${subscriberCount}`)

  if (subscriberCount === 0) {
    console.log(
      '⚠️  No subscribers found. Newsletter will be sent to 0 recipients.'
    )
  }

  await sendNewsletter(slug, preview)
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n📪 Newsletter sending cancelled')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n📪 Newsletter sending terminated')
  process.exit(0)
})

main().catch(error => {
  console.error('💥 Unexpected error:', error)
  process.exit(1)
})
