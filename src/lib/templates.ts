// 模板数据和相关函数

export interface Template {
  id: number
  title: string
  description: string
  tags: string[]
  stars: string
  language: string
  updated: string
  link: string
  type: 'template' // 用于区分内容类型
  slug: string // 用于路由
}

// 模板数据
export const templates: Template[] = [
  {
    id: 1,
    title: 'Next.js Blog 模板',
    description:
      '基于 Next.js 15 的现代博客模板，包含深色主题、搜索功能、标签系统、SEO优化等功能。适用于个人博客、技术博客等场景。',
    tags: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', '博客', 'SEO'],
    stars: '2.1k',
    language: 'TypeScript',
    updated: '2 days ago',
    link: 'https://github.com/guangzhengli/nextjs-blog-template',
    type: 'template',
    slug: 'nextjs-blog-template',
  },
  {
    id: 2,
    title: 'Landing Page 模板',
    description:
      '响应式落地页模板，适用于产品展示、SaaS应用等场景，包含多种组件和布局选项。支持多种动画效果和现代化设计。',
    tags: ['React', 'Tailwind CSS', '响应式', '落地页', 'SaaS', '产品展示'],
    stars: '1.8k',
    language: 'JavaScript',
    updated: '1 week ago',
    link: '#',
    type: 'template',
    slug: 'landing-page-template',
  },
  {
    id: 3,
    title: 'Dashboard 模板',
    description:
      '现代化管理后台模板，包含图表、表格、表单等常用组件，支持多主题切换。适用于后台管理系统、数据可视化等场景。',
    tags: ['Admin', 'Dashboard', 'Charts', 'Forms', '后台管理', '数据可视化'],
    stars: '3.2k',
    language: 'TypeScript',
    updated: '3 days ago',
    link: '#',
    type: 'template',
    slug: 'dashboard-template',
  },
]

// 获取所有模板
export function getAllTemplates(): Template[] {
  return templates
}

// 根据ID获取模板
export function getTemplateById(id: number): Template | undefined {
  return templates.find(template => template.id === id)
}

// 根据slug获取模板
export function getTemplateBySlug(slug: string): Template | undefined {
  return templates.find(template => template.slug === slug)
}

// 获取推荐模板
export function getFeaturedTemplates(): Template[] {
  return templates.filter(
    template => parseInt(template.stars.replace('k', '')) >= 2
  )
}
