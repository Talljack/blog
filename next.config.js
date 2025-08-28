/** @type {import('next').NextConfig} */
const nextConfig = {
  // === 实验性功能 ===
  experimental: {
    mdxRs: true,
  },

  // === 外部包配置 ===
  serverExternalPackages: ['gray-matter', 'remark', 'remark-html'],

  // === 构建优化 ===
  compiler: {
    // 移除 console.log (生产环境)
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
            exclude: ['error', 'warn'],
          }
        : false,
  },

  // === 图片优化 ===
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // === 压缩和缓存 ===
  compress: true,

  // === 页面扩展 ===
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],

  // === 输出配置 ===
  output: 'standalone',

  // === 打包分析 (通过环境变量启用) ===
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config, { isServer }) => {
      if (!isServer) {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
            reportFilename: '../bundle-analyzer-report.html',
          })
        )
      }
      return config
    },
  }),

  // === 重定向和重写 ===
  async redirects() {
    return [
      // 可以添加重定向规则
    ]
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // 安全性头部
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=300',
          },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },

  // === 性能监控 ===
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  // === TypeScript 配置 ===
  typescript: {
    // 类型检查在构建时运行
    ignoreBuildErrors: false,
  },

  // === ESLint 配置 ===
  eslint: {
    // ESLint 在构建时运行
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig
