import { get } from '@vercel/edge-config'

/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
!process.env.SKIP_ENV_VALIDATION && (await import('./env.mjs'))

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
    taint: true,
  },

  images: {
    remotePatterns: [
      {
        hostname: 'web-hub-seven.vercel.app',
      },
      {
        hostname: 'img.buymeacoffee.com',
      },
      {
        hostname: 'cdn.sanity.io',
      },
    ],
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  async redirects() {
    if (process.env.VERCEL_ENV === 'development') {
      return []
    }
    
    try {
      const redirects = await get('redirects')
      return redirects ?? []
    } catch (error) {
      console.warn('Failed to fetch redirects from Edge Config:', error)
      // 如果 Edge Config 获取失败，使用默认的重定向规则
      return [
        {
          source: '/twitter',
          destination: 'https://twitter.com/YugangCao',
          permanent: true,
        },
        {
          source: '/github',
          destination: 'https://github.com/Talljack',
          permanent: true,
        },
        {
          source: '/bilibili',
          destination: 'https://space.bilibili.com/384764287',
          permanent: true,
        },
      ]
    }
  },

  rewrites() {
    return [
      {
        source: '/feed',
        destination: '/feed.xml',
      },
      {
        source: '/rss',
        destination: '/feed.xml',
      },
      {
        source: '/rss.xml',
        destination: '/feed.xml',
      },
    ]
  }
}

export default nextConfig
