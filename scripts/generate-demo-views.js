/**
 * 生成演示用的浏览量数据
 * 这个脚本会为每篇文章生成一些随机的浏览量，用于演示分析面板功能
 */

const fs = require('fs')
const path = require('path')

// 文章数据（应该与实际的文章保持一致）
const posts = [
  { slug: 'playwright-e2e-testing', weight: 1.2 }, // 热门文章权重更高
  { slug: 'nextjs-blog-guide', weight: 1.0 },
  { slug: 'typescript-tips', weight: 0.8 },
  { slug: 'hello-world', weight: 0.6 },
]

// 生成模拟的浏览量数据
function generateViewsData() {
  const viewsData = {}
  const baseViews = 150 // 基础浏览量

  posts.forEach(post => {
    // 根据权重和随机因子生成浏览量
    const randomFactor = 0.5 + Math.random() * 1.0 // 0.5 到 1.5 之间的随机因子
    const views = Math.floor(baseViews * post.weight * randomFactor)
    viewsData[post.slug] = Math.max(views, 10) // 至少10个浏览量
  })

  return viewsData
}

// 创建数据目录和文件
function createViewsFile() {
  const dataDir = path.join(__dirname, '..', 'data')
  const viewsFile = path.join(dataDir, 'views.json')

  // 确保数据目录存在
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
    console.log('📁 创建数据目录:', dataDir)
  }

  // 生成浏览量数据
  const viewsData = generateViewsData()

  console.log('📊 生成的浏览量数据:')
  Object.entries(viewsData).forEach(([slug, views]) => {
    console.log(`  - ${slug}: ${views} 次浏览`)
  })

  // 写入文件
  fs.writeFileSync(viewsFile, JSON.stringify(viewsData, null, 2))
  console.log('✅ 浏览量数据已保存到:', viewsFile)

  return viewsData
}

// 更新views API以支持本地文件回退
function updateViewsAPI() {
  console.log('\n💡 提示:')
  console.log('- 这些数据只在本地开发环境中有效')
  console.log('- 生产环境会使用Redis/Upstash存储真实数据')
  console.log('- 你可以通过访问博客文章来增加真实的浏览量')
  console.log('')
  console.log('🔗 现在可以访问分析页面查看数据:')
  console.log('  http://localhost:3002/analytics')
}

async function main() {
  console.log('🎯 开始生成演示浏览量数据...\n')

  try {
    const viewsData = createViewsFile()
    updateViewsAPI()

    // 计算总计数据
    const totalViews = Object.values(viewsData).reduce(
      (sum, views) => sum + views,
      0
    )
    const avgViews = Math.round(totalViews / Object.keys(viewsData).length)

    console.log('📈 统计摘要:')
    console.log(`  总浏览量: ${totalViews.toLocaleString()}`)
    console.log(`  文章数量: ${Object.keys(viewsData).length}`)
    console.log(`  平均浏览量: ${avgViews}`)

    console.log('\n🎉 演示数据生成完成!')
  } catch (error) {
    console.error('❌ 生成演示数据失败:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = { generateViewsData, createViewsFile }
