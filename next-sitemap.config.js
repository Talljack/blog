/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://your-domain.com',
  generateRobotsTxt: true, // (optional) Generate robots.txt
  generateIndexSitemap: false, // (optional) Don't generate index sitemap for small sites
  sitemapSize: 7000, // (optional) Split sitemap into multiple files for better performance
  changefreq: 'weekly',
  priority: 0.7,
  exclude: ['/api/*', '/admin/*'], // exclude certain paths
  alternateRefs: [
    {
      href: 'https://your-domain.com',
      hreflang: 'zh-cn',
    },
    {
      href: 'https://your-domain.com/en',
      hreflang: 'en',
    },
  ],
  // Define custom transform function for better SEO
  transform: async (config, path) => {
    // Custom priority and changefreq based on path
    if (path === '/') {
      return {
        loc: path,
        changefreq: 'daily',
        priority: 1.0,
        lastmod: new Date().toISOString(),
      }
    }

    if (path.startsWith('/blog/')) {
      return {
        loc: path,
        changefreq: 'monthly',
        priority: 0.8,
        lastmod: new Date().toISOString(),
      }
    }

    if (path === '/about') {
      return {
        loc: path,
        changefreq: 'yearly',
        priority: 0.5,
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
      'https://your-domain.com/sitemap.xml',
    ],
  },
}