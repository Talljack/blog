const { getAllPosts } = require('./src/lib/blog')
const { siteConfig } = require('./src/lib/config')

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || siteConfig.url,
  generateRobotsTxt: true, // (optional) Generate robots.txt
  generateIndexSitemap: false, // (optional) Don't generate index sitemap for small sites
  sitemapSize: 7000, // (optional) Split sitemap into multiple files for better performance
  changefreq: 'weekly',
  priority: 0.7,
  exclude: ['/api/*', '/admin/*'], // exclude certain paths
  alternateRefs: [
    {
      href: process.env.SITE_URL || siteConfig.url,
      hreflang: 'zh-cn',
    },
  ],
  // Define custom transform function for better SEO
  transform: async (config, path) => {
    try {
      // Get all blog posts for accurate lastmod dates
      const posts = await getAllPosts()

      // Homepage - highest priority
      if (path === '/') {
        return {
          loc: path,
          changefreq: 'daily',
          priority: 1.0,
          lastmod: new Date().toISOString(),
        }
      }

      // Blog listing page
      if (path === '/blog') {
        const latestPost = posts[0]
        return {
          loc: path,
          changefreq: 'weekly',
          priority: 0.9,
          lastmod: latestPost
            ? new Date(latestPost.date).toISOString()
            : new Date().toISOString(),
        }
      }

      // Individual blog posts
      if (path.startsWith('/blog/')) {
        const slug = path.replace('/blog/', '')
        const post = posts.find(p => p.slug === slug)
        return {
          loc: path,
          changefreq: post?.lastModified ? 'monthly' : 'yearly',
          priority: post?.featured ? 0.9 : 0.8,
          lastmod: post?.lastModified
            ? new Date(post.lastModified).toISOString()
            : post?.date
              ? new Date(post.date).toISOString()
              : new Date().toISOString(),
        }
      }

      // Tag pages
      if (path.startsWith('/tag/')) {
        return {
          loc: path,
          changefreq: 'weekly',
          priority: 0.7,
          lastmod: new Date().toISOString(),
        }
      }

      // About page
      if (path === '/about') {
        return {
          loc: path,
          changefreq: 'monthly',
          priority: 0.6,
          lastmod: new Date().toISOString(),
        }
      }

      // Course and template pages
      if (path.startsWith('/course/') || path.startsWith('/template/')) {
        return {
          loc: path,
          changefreq: 'monthly',
          priority: 0.8,
          lastmod: new Date().toISOString(),
        }
      }

      // Default transform
      return {
        loc: path,
        changefreq: config.changefreq,
        priority: config.priority,
        lastmod: new Date().toISOString(),
      }
    } catch (error) {
      // Fallback in case of error
      return {
        loc: path,
        changefreq: config.changefreq,
        priority: config.priority,
        lastmod: new Date().toISOString(),
      }
    }
  },
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
      {
        userAgent: 'GPTBot',
        disallow: '/',
      },
      {
        userAgent: 'Google-Extended',
        disallow: '/',
      },
    ],
    additionalSitemaps: [
      `${process.env.SITE_URL || siteConfig.url}/sitemap.xml`,
    ],
  },
}
