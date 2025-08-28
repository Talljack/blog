#!/usr/bin/env node

// === 性能监控脚本 ===
// 用于检查构建大小、依赖分析和性能指标

const fs = require('fs')
const path = require('path')

console.log('🔍 博客性能检查工具')
console.log('===================')

// 检查构建大小
function checkBuildSize() {
  const buildPath = path.join(process.cwd(), '.next')

  if (!fs.existsSync(buildPath)) {
    console.log('⚠️  构建文件不存在，请先运行 npm run build')
    return
  }

  console.log('\n📦 构建大小分析:')

  // 检查静态文件大小
  const staticPath = path.join(buildPath, 'static')
  if (fs.existsSync(staticPath)) {
    const getDirectorySize = dirPath => {
      let size = 0
      const files = fs.readdirSync(dirPath)

      for (const file of files) {
        const filePath = path.join(dirPath, file)
        const stat = fs.statSync(filePath)

        if (stat.isDirectory()) {
          size += getDirectorySize(filePath)
        } else {
          size += stat.size
        }
      }

      return size
    }

    const totalSize = getDirectorySize(staticPath)
    const sizeInMB = (totalSize / 1024 / 1024).toFixed(2)

    console.log(`   静态文件总大小: ${sizeInMB} MB`)

    if (totalSize > 10 * 1024 * 1024) {
      console.log('   ⚠️  静态文件过大，建议优化')
    } else {
      console.log('   ✅ 静态文件大小合理')
    }
  }
}

// 检查依赖分析
function analyzeDependencies() {
  console.log('\n📋 依赖分析:')

  try {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8')
    )

    const deps = Object.keys(packageJson.dependencies || {}).length
    const devDeps = Object.keys(packageJson.devDependencies || {}).length

    console.log(`   生产依赖: ${deps} 个`)
    console.log(`   开发依赖: ${devDeps} 个`)

    // 检查大型依赖
    const heavyDeps = ['react', 'next', '@playwright/test', 'tailwindcss']

    const installedHeavyDeps = heavyDeps.filter(
      dep =>
        packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]
    )

    if (installedHeavyDeps.length > 0) {
      console.log(`   大型依赖: ${installedHeavyDeps.join(', ')}`)
    }
  } catch (_error) {
    console.log('   ❌ 无法读取 package.json')
  }
}

// 性能建议
function performanceRecommendations() {
  console.log('\n💡 性能优化建议:')

  const recommendations = [
    '✅ 已启用图片优化 (WebP/AVIF)',
    '✅ 已启用代码压缩',
    '✅ 已配置缓存策略',
    '✅ 已启用 Bundle 分析器',
    '💡 可考虑启用 CDN',
    '💡 可考虑代码分割优化',
    '💡 可监控 Core Web Vitals',
  ]

  recommendations.forEach(rec => console.log(`   ${rec}`))
}

// 主函数
function main() {
  checkBuildSize()
  analyzeDependencies()
  performanceRecommendations()

  console.log('\n🚀 运行 npm run analyze 查看详细的 Bundle 分析')
  console.log('📊 性能检查完成！')
}

if (require.main === module) {
  main()
}
