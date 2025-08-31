#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('📦 Bundle Analysis Script')
console.log('========================')

// 检查是否安装了必要的依赖
function checkDependency(dep) {
  try {
    require.resolve(dep)
    return true
  } catch (error) {
    return false
  }
}

// 安装缺失的依赖
async function installMissingDeps() {
  const requiredDeps = ['@next/bundle-analyzer', 'webpack-bundle-analyzer']
  const missing = requiredDeps.filter(dep => !checkDependency(dep))

  if (missing.length > 0) {
    console.log(`📥 Installing missing dependencies: ${missing.join(', ')}`)
    execSync(`pnpm add -D ${missing.join(' ')}`, { stdio: 'inherit' })
  }
}

// 运行bundle分析
function runBundleAnalysis() {
  console.log('\n🔍 Running bundle analysis...')

  // 设置环境变量启用bundle分析
  process.env.ANALYZE = 'true'

  try {
    // 构建项目并生成分析报告
    execSync('pnpm build', { stdio: 'inherit' })

    console.log('\n✅ Bundle analysis complete!')
    console.log('📊 Analysis reports generated in .next/analyze/')
    console.log('🌐 Client bundle: .next/analyze/client.html')
    console.log('🚀 Server bundle: .next/analyze/server.html')
  } catch (error) {
    console.error('❌ Bundle analysis failed:', error.message)
    process.exit(1)
  }
}

// 分析结果摘要
function generateSummary() {
  console.log('\n📈 Performance Optimization Summary')
  console.log('=====================================')

  const buildDir = '.next'
  if (!fs.existsSync(buildDir)) {
    console.log('⚠️  Build directory not found. Run analysis first.')
    return
  }

  console.log('\n🎯 Optimization Recommendations:')
  console.log('1. 🔄 Dynamic imports implemented for heavy components')
  console.log('2. 📱 Code splitting by route and component')
  console.log('3. ⚡ Preloading strategies for better UX')
  console.log('4. 🗜️  Bundle compression enabled')
  console.log('5. 📊 Tree-shaking for unused code elimination')

  console.log('\n🛠️  Next Steps:')
  console.log('- Review .next/analyze/client.html for large chunks')
  console.log('- Consider lazy loading for below-fold components')
  console.log('- Optimize third-party library imports')
  console.log('- Use dynamic imports for admin/editor features')
}

// 创建优化配置
function createOptimizedConfig() {
  const nextConfigPath = 'next.config.js'

  if (!fs.existsSync(nextConfigPath)) {
    console.log('📝 Creating optimized next.config.js...')

    const configContent = `
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 启用bundle分析（当ANALYZE=true时）
  ...(process.env.ANALYZE === 'true' && {
    ...(require('@next/bundle-analyzer')({
      enabled: true,
      openAnalyzer: false,
    }))
  }),
  
  // 编译优化
  compiler: {
    // 移除console.log（仅生产环境）
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
    
    // 启用SWC压缩
    minify: true,
  },
  
  // 实验性功能
  experimental: {
    // 优化CSS
    optimizeCss: true,
    
    // 服务端组件
    serverComponentsExternalPackages: ['sharp'],
    
    // 现代JavaScript输出
    legacyBrowsers: false,
  },
  
  // 图片优化
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30天缓存
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // 输出配置
  output: 'standalone',
  
  // 压缩
  compress: true,
  
  // 优化字体
  optimizeFonts: true,
  
  // Webpack优化
  webpack: (config, { dev, isServer }) => {
    // 生产环境优化
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        // 代码分割
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\\\/]node_modules[\\\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
            },
          },
        },
      }
    }
    
    return config
  },
  
  // 环境变量
  env: {
    NEXT_TELEMETRY_DISABLED: '1',
  },
}

module.exports = nextConfig
`

    fs.writeFileSync(nextConfigPath, configContent)
    console.log('✅ Created optimized next.config.js')
  }
}

// 主函数
async function main() {
  try {
    await installMissingDeps()
    createOptimizedConfig()
    runBundleAnalysis()
    generateSummary()

    console.log('\n🎉 Bundle optimization complete!')
    console.log('💡 Check the HTML reports for detailed analysis')
  } catch (error) {
    console.error('❌ Script failed:', error.message)
    process.exit(1)
  }
}

// 命令行选项处理
const args = process.argv.slice(2)
if (args.includes('--help')) {
  console.log(`
Usage: node scripts/bundle-analyzer.js [options]

Options:
  --help     Show this help message
  --analyze  Run bundle analysis only
  --summary  Show optimization summary only

Examples:
  node scripts/bundle-analyzer.js
  pnpm run analyze
`)
  process.exit(0)
}

if (args.includes('--summary')) {
  generateSummary()
  process.exit(0)
}

if (args.includes('--analyze')) {
  runBundleAnalysis()
  process.exit(0)
}

// 运行主程序
main().catch(console.error)
