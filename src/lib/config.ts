export const siteConfig = {
  name: 'Talljack — Independent Builder',
  description:
    'Talljack 的产品、开源项目与构建笔记：AI、开发者工具和原生应用。',
  url: 'https://talljack.me',
  ogImage: '/og-image.png',
  author: {
    name: 'Talljack',
    bio: '独立开发者，持续构建 AI 产品、开发者工具与原生应用。',
    avatar: process.env.NEXT_PUBLIC_AUTHOR_AVATAR || '',
    social: {
      twitter:
        process.env.NEXT_PUBLIC_TWITTER_URL || 'https://x.com/Talljackcv',
      github:
        process.env.NEXT_PUBLIC_GITHUB_URL || 'https://github.com/Talljack',
      email: process.env.NEXT_PUBLIC_EMAIL || '',
    },
  },
  navigation: [
    { name: '作品', href: '/#work' },
    { name: '博客', href: '/blog' },
    { name: '课程', href: '/course' },
    { name: '模板', href: '/template' },
    { name: '收藏', href: '/bookmarks' },
    { name: '关于', href: '/about' },
  ],
  seo: {
    keywords: [
      'Talljack',
      '独立开发者',
      'AI 产品',
      '开发者工具',
      '开源',
      'macOS',
      'EchoType',
      'Menu Hub',
    ],
  },
  rss: {
    title: `${process.env.NEXT_PUBLIC_SITE_NAME || '我的博客'} RSS`,
    description: '订阅获取最新文章',
  },
  giscus: {
    repo: process.env.NEXT_PUBLIC_GISCUS_REPO || '',
    repoId: process.env.NEXT_PUBLIC_GISCUS_REPO_ID || '',
    category: process.env.NEXT_PUBLIC_GISCUS_CATEGORY || 'Announcements',
    categoryId: process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID || '',
  },
  analytics: {
    googleAnalyticsId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '',
  },
  features: {
    enableSearch: process.env.NEXT_PUBLIC_ENABLE_SEARCH === 'true',
    enableComments: process.env.NEXT_PUBLIC_ENABLE_COMMENTS === 'true',
    enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    enableRss: process.env.NEXT_PUBLIC_ENABLE_RSS === 'true',
  },
  settings: {
    postsPerPage: parseInt(process.env.POSTS_PER_PAGE || '10'),
    maxRecentPosts: parseInt(process.env.MAX_RECENT_POSTS || '10'),
    maxPopularPosts: parseInt(process.env.MAX_POPULAR_POSTS || '5'),
    maxTagsDisplay: parseInt(process.env.MAX_TAGS_DISPLAY || '20'),
  },
  pwa: {
    name: process.env.NEXT_PUBLIC_SITE_NAME || 'Talljack',
    shortName: 'Talljack',
    description:
      process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
      'AI 产品、开发者工具和原生应用的构建日志。',
    themeColor: '#bef264',
    backgroundColor: '#faf9f5',
    display: 'standalone',
    orientation: 'portrait-primary',
    scope: '/',
    startUrl: '/',
    categories: ['productivity', 'technology', 'education', 'lifestyle'],
    lang: 'zh-CN',
  },
}

export type SiteConfig = typeof siteConfig
