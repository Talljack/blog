import { NextRequest, NextResponse } from 'next/server'

// 搜索建议API
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')
  const limit = parseInt(searchParams.get('limit') || '8', 10)

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ suggestions: [] })
  }

  try {
    const { getAllPosts } = await import('@/lib/blog')
    const posts = await getAllPosts()

    const searchQuery = query.toLowerCase().trim()
    const suggestions: Array<{
      text: string
      type: 'title' | 'tag' | 'author' | 'keyword'
      relevance: number
      meta?: {
        slug?: string
        date?: string
        postCount?: number
        frequency?: number
      }
    }> = []

    // 1. 标题建议
    const titleSuggestions = posts
      .filter(post => post.title.toLowerCase().includes(searchQuery))
      .map(post => ({
        text: post.title,
        type: 'title' as const,
        relevance: calculateSuggestionRelevance(post.title, searchQuery),
        meta: { slug: post.slug, date: post.date },
      }))
      .slice(0, 3)

    suggestions.push(...titleSuggestions)

    // 2. 标签建议
    const allTags = Array.from(new Set(posts.flatMap(post => post.tags || [])))
    const tagSuggestions = allTags
      .filter(tag => tag.toLowerCase().includes(searchQuery))
      .map(tag => ({
        text: tag,
        type: 'tag' as const,
        relevance: calculateSuggestionRelevance(tag, searchQuery),
        meta: {
          postCount: posts.filter(post => post.tags?.includes(tag)).length,
        },
      }))
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 3)

    suggestions.push(...tagSuggestions)

    // 3. 作者建议
    const authors = Array.from(
      new Set(posts.map(post => post.author).filter(Boolean))
    )
    const authorSuggestions = authors
      .filter(author => author?.toLowerCase().includes(searchQuery))
      .map(author => ({
        text: author || '',
        type: 'author' as const,
        relevance: calculateSuggestionRelevance(author || '', searchQuery),
        meta: {
          postCount: posts.filter(post => post.author === author).length,
        },
      }))
      .slice(0, 2)

    suggestions.push(...authorSuggestions)

    // 4. 热门关键词建议
    const keywordSuggestions = generateKeywordSuggestions(searchQuery, posts)
    suggestions.push(...keywordSuggestions.slice(0, 2))

    // 排序并限制结果
    const sortedSuggestions = suggestions
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, limit)

    return NextResponse.json(
      {
        query,
        suggestions: sortedSuggestions,
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=600, s-maxage=600', // 10分钟缓存
        },
      }
    )
  } catch (error) {
    console.error('Search suggestions API error:', error)
    return NextResponse.json({ suggestions: [] })
  }
}

// 计算建议相关性
function calculateSuggestionRelevance(text: string, query: string): number {
  const textLower = text.toLowerCase()
  const queryLower = query.toLowerCase()

  // 完全匹配
  if (textLower === queryLower) return 1.0

  // 起始匹配
  if (textLower.startsWith(queryLower)) return 0.9

  // 包含匹配
  if (textLower.includes(queryLower)) {
    const ratio = queryLower.length / textLower.length
    return 0.7 + ratio * 0.2
  }

  // 词汇匹配
  const textWords = textLower.split(/\s+/)
  for (const word of textWords) {
    if (word.startsWith(queryLower)) return 0.6
  }

  return 0
}

// 生成关键词建议
function generateKeywordSuggestions(
  query: string,
  posts: Array<{
    title: string
    description?: string
  }>
) {
  const keywords: Record<string, number> = {}

  // 从文章标题和描述中提取关键词
  posts.forEach(post => {
    const text = `${post.title} ${post.description || ''}`.toLowerCase()
    const words = text
      .split(/\s+/)
      .filter(word => word.length > 2 && word.includes(query.toLowerCase()))
      .filter(
        word =>
          ![
            'the',
            'and',
            'or',
            'but',
            'in',
            'on',
            'at',
            'to',
            'for',
            'of',
            'with',
            'by',
          ].includes(word)
      )

    words.forEach(word => {
      keywords[word] = (keywords[word] || 0) + 1
    })
  })

  return Object.entries(keywords)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([keyword, count]) => ({
      text: keyword,
      type: 'keyword' as const,
      relevance: Math.min(count / 10, 0.8),
      meta: { frequency: count },
    }))
}
