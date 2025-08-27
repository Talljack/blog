// 课程数据和相关函数

export interface Course {
  id: number
  title: string
  description: string
  duration: string
  chapters: string
  tags: string[]
  icon: string
  link: string
  type: 'course' // 用于区分内容类型
  slug: string // 用于路由
}

// 课程数据
export const courses: Course[] = [
  {
    id: 1,
    title: 'Kubernetes 教程',
    description:
      'k8s 作为云原生时代的操作系统，学习它的必要性不言而喻！在学习本教程前，需要注意本教程侧重于实战引导，以渐进式体系化的方式带你学习 Kubernetes，让你能够快速上手并在实际工作中应用。',
    duration: '2 小时',
    chapters: '12 节',
    tags: ['免费', '开源', '课程', 'kubernetes', 'k8s', '云原生', '容器'],
    icon: '⎈',
    link: '/course/kubernetes',
    type: 'course',
    slug: 'kubernetes',
  },
  {
    id: 2,
    title: 'Next.js 实战教程',
    description:
      'Next.js 作为当前独立开发和全栈开发的首选框架，在当前 AI 时代，优势更加突出。本教程作为 NextDevKit 的配套教程，将从零开始教你如何使用 Next.js 构建现代化的 Web 应用程序。',
    duration: '未完待续',
    chapters: '16 节',
    tags: [
      '免费',
      '课程',
      'nextjs',
      'react',
      '全栈开发',
      'javascript',
      'typescript',
    ],
    icon: 'N',
    link: '/course/nextjs',
    type: 'course',
    slug: 'nextjs',
  },
]

// 获取所有课程
export function getAllCourses(): Course[] {
  return courses
}

// 根据ID获取课程
export function getCourseById(id: number): Course | undefined {
  return courses.find(course => course.id === id)
}

// 根据slug获取课程
export function getCourseBySlug(slug: string): Course | undefined {
  return courses.find(course => course.slug === slug)
}

// 获取推荐课程
export function getFeaturedCourses(): Course[] {
  return courses.filter(course => course.tags.includes('免费'))
}
