import { NextRequest, NextResponse } from 'next/server'

// 搜索API端点
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')
  const type = searchParams.get('type') || 'posts' // posts, tags, all

  if (!query || query.trim() === '') {
    return NextResponse.json({ error: '搜索关键词不能为空' }, { status: 400 })
  }

  try {
    const { getAllPosts } = await import('@/lib/blog')
    const posts = await getAllPosts()

    const searchQuery = query.toLowerCase().trim()
    let results: any[] = []

    if (type === 'posts' || type === 'all') {
      // 搜索文章
      const postResults = posts
        .filter(post => {
          const titleMatch = post.title.toLowerCase().includes(searchQuery)
          const descMatch = post.description
            ?.toLowerCase()
            .includes(searchQuery)
          const tagMatch = post.tags?.some(tag =>
            tag.toLowerCase().includes(searchQuery)
          )
          const authorMatch = post.author?.toLowerCase().includes(searchQuery)

          return titleMatch || descMatch || tagMatch || authorMatch
        })
        .map(post => ({
          type: 'post',
          title: post.title,
          description: post.description,
          slug: post.slug,
          date: post.date,
          tags: post.tags,
          author: post.author,
          url: `/blog/${post.slug}`,
          relevance: calculateRelevance(post, searchQuery),
        }))

      results = [...results, ...postResults]
    }

    if (type === 'tags' || type === 'all') {
      // 搜索标签
      const allTags = Array.from(
        new Set(posts.flatMap(post => post.tags || []))
      )
      const tagResults = allTags
        .filter(tag => tag.toLowerCase().includes(searchQuery))
        .map(tag => {
          const postsWithTag = posts.filter(post => post.tags?.includes(tag))
          return {
            type: 'tag',
            title: `#${tag}`,
            description: `${postsWithTag.length} 篇文章`,
            url: `/tag/${encodeURIComponent(tag)}`,
            postCount: postsWithTag.length,
            relevance: tag.toLowerCase() === searchQuery ? 1 : 0.8,
          }
        })

      results = [...results, ...tagResults]
    }

    // 按相关度排序
    results.sort((a, b) => (b.relevance || 0) - (a.relevance || 0))

    // 限制结果数量
    const maxResults = parseInt(searchParams.get('limit') || '10', 10)
    results = results.slice(0, maxResults)

    return NextResponse.json(
      {
        query,
        type,
        total: results.length,
        results,
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=300, s-maxage=300', // 5分钟缓存
        },
      }
    )
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json({ error: '搜索服务暂时不可用' }, { status: 500 })
  }
}

function calculateRelevance(post: any, query: string): number {
  let score = 0
  const queryLower = query.toLowerCase()

  // 标题匹配权重最高
  if (post.title.toLowerCase().includes(queryLower)) {
    score += 1.0
    if (post.title.toLowerCase() === queryLower) {
      score += 0.5 // 完全匹配额外加分
    }
  }

  // 描述匹配
  if (post.description?.toLowerCase().includes(queryLower)) {
    score += 0.6
  }

  // 标签匹配
  if (
    post.tags?.some((tag: string) => tag.toLowerCase().includes(queryLower))
  ) {
    score += 0.4
    if (post.tags?.some((tag: string) => tag.toLowerCase() === queryLower)) {
      score += 0.3 // 完全匹配标签额外加分
    }
  }

  // 作者匹配
  if (post.author?.toLowerCase().includes(queryLower)) {
    score += 0.2
  }

  // 文章新鲜度加分
  const daysSincePublished = Math.floor(
    (new Date().getTime() - new Date(post.date).getTime()) /
      (1000 * 60 * 60 * 24)
  )
  if (daysSincePublished < 30) {
    score += 0.1
  }

  // 特色文章加分
  if (post.featured) {
    score += 0.1
  }

  return Math.min(score, 2.0) // 最高分数限制为2.0
}
