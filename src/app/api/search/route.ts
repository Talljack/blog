import { NextRequest, NextResponse } from 'next/server'
import Fuse from 'fuse.js'
import { getAllPosts } from '@/lib/blog'
import { getAllCourses } from '@/lib/courses'
import { getAllTemplates } from '@/lib/templates'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')

  if (!query || query.trim() === '') {
    return NextResponse.json({ results: [] })
  }

  try {
    // 获取所有文章、课程和模板
    const posts = await getAllPosts()
    const courses = getAllCourses()
    const templates = getAllTemplates()

    // 为文章添加类型标识
    const postsWithType = posts.map(post => ({
      ...post,
      type: 'post' as const,
    }))

    // 合并所有内容
    const allContent = [...postsWithType, ...courses, ...templates]

    // 配置 Fuse.js 搜索选项
    const fuseOptions = {
      keys: [
        { name: 'title', weight: 0.4 }, // 标题权重最高
        { name: 'description', weight: 0.3 }, // 描述权重次之
        { name: 'tags', weight: 0.2 }, // 标签权重
        { name: 'author', weight: 0.1 }, // 作者权重最低
      ],
      threshold: 0.4, // 搜索敏感度 (0.0 = 完全匹配, 1.0 = 匹配所有)
      distance: 100, // 最大搜索距离
      minMatchCharLength: 2, // 最小匹配字符数
      includeScore: true,
      includeMatches: true,
    }

    // 创建 Fuse 搜索实例
    const fuse = new Fuse(allContent, fuseOptions)

    // 执行搜索
    const searchResults = fuse.search(query).slice(0, 10) // 限制返回10个结果

    // 格式化搜索结果，按类型分组
    const results = searchResults.map(result => ({
      ...result.item,
      score: result.score,
      matches: result.matches,
    }))

    // 分类结果
    const posts_results = results.filter(item => item.type === 'post')
    const courses_results = results.filter(item => item.type === 'course')
    const templates_results = results.filter(item => item.type === 'template')

    return NextResponse.json({
      results,
      posts: posts_results,
      courses: courses_results,
      templates: templates_results,
      query,
      total: searchResults.length,
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
