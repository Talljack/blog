export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || '我的博客',
  description:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION || '分享技术心得与生活感悟',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://your-blog-url.com',
  ogImage: '/og-image.png',
  author: {
    name: process.env.NEXT_PUBLIC_AUTHOR_NAME || '你的名字',
    bio: process.env.NEXT_PUBLIC_AUTHOR_BIO || '全栈开发者，热爱技术与写作',
    avatar: process.env.NEXT_PUBLIC_AUTHOR_AVATAR || '/avatar.jpg',
    social: {
      twitter: process.env.NEXT_PUBLIC_TWITTER_URL || '',
      github: process.env.NEXT_PUBLIC_GITHUB_URL || '',
      email: process.env.NEXT_PUBLIC_EMAIL || '',
    },
  },
  navigation: [
    { name: '博客', href: '/blog' },
    { name: '课程', href: '/course' },
    { name: '模板', href: '/template' },
    { name: '关于', href: '/about' },
  ],
  seo: {
    keywords: ['博客', '技术', '开发', '编程'],
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
    name: process.env.NEXT_PUBLIC_SITE_NAME || '我的博客',
    shortName: '博客',
    description:
      process.env.NEXT_PUBLIC_SITE_DESCRIPTION || '分享技术心得与生活感悟',
    themeColor: '#3b82f6',
    backgroundColor: '#ffffff',
    display: 'standalone',
    orientation: 'portrait-primary',
    scope: '/',
    startUrl: '/',
    categories: ['productivity', 'technology', 'education', 'lifestyle'],
    lang: 'zh-CN',
  },
}

export type SiteConfig = typeof siteConfig
