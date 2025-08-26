export const siteConfig = {
  name: '我的博客',
  description: '分享技术心得与生活感悟',
  url: 'https://your-blog-url.com',
  ogImage: '/og-image.jpg',
  author: {
    name: '你的名字',
    bio: '全栈开发者，热爱技术与写作',
    avatar: '/avatar.jpg',
    social: {
      twitter: 'https://twitter.com/yourusername',
      github: 'https://github.com/yourusername',
      email: 'your-email@example.com',
    },
  },
  navigation: [
    { name: '首页', href: '/' },
    { name: '博客', href: '/blog' },
    { name: '关于', href: '/about' },
  ],
  seo: {
    keywords: ['博客', '技术', '开发', '编程'],
  },
  rss: {
    title: '我的博客 RSS',
    description: '订阅获取最新文章',
  },
  giscus: {
    repo: 'your-username/your-repo',
    repoId: 'your-repo-id',
    category: 'Announcements',
    categoryId: 'your-category-id',
  },
}

export type SiteConfig = typeof siteConfig