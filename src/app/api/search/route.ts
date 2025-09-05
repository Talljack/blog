import { NextRequest, NextResponse } from 'next/server'

// 增强的全文搜索API
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')
  const type = searchParams.get('type') || 'posts' // posts, tags, all, content
  const fuzzy = searchParams.get('fuzzy') === 'true' // 启用模糊搜索
  const highlight = searchParams.get('highlight') === 'true' // 启用高亮

  if (!query || query.trim() === '') {
    return NextResponse.json({ error: '搜索关键词不能为空' }, { status: 400 })
  }

  try {
    const { getAllPosts } = await import('@/lib/blog')
    const posts = await getAllPosts()

    const searchTerms = preprocessQuery(query)
    let results: Array<{
      type: string
      title: string
      description?: string
      slug?: string
      date?: string
      tags?: string[]
      author?: string
      url: string
      relevance: number
      matchedFields?: string[]
      readTime?: number
      contentSnippets?: string[]
      postCount?: number
    }> = []

    if (type === 'posts' || type === 'all' || type === 'content') {
      // 增强的文章搜索
      const postResults = posts
        .map(post => {
          const searchScore = calculateEnhancedRelevance(
            post,
            searchTerms,
            fuzzy
          )

          if (searchScore.totalScore > 0) {
            const result = {
              type: 'post',
              title: highlight
                ? highlightText(post.title, searchTerms)
                : post.title,
              description: highlight
                ? highlightText(post.description || '', searchTerms)
                : post.description,
              slug: post.slug,
              date: post.date,
              tags: post.tags,
              author: post.author,
              url: `/blog/${post.slug}`,
              relevance: searchScore.totalScore,
              matchedFields: searchScore.matchedFields,
              readTime: post.readTime || calculateReadTime(''),
            }

            // 如果需要全文搜索，添加内容摘要
            const resultWithSnippets: typeof result & {
              contentSnippets?: string[]
            } = result
            if (type === 'content' && searchScore.contentMatches.length > 0) {
              resultWithSnippets.contentSnippets = searchScore.contentMatches
                .slice(0, 3)
                .map(match =>
                  highlight ? highlightText(match, searchTerms) : match
                )
            }

            return resultWithSnippets
          }
          return null
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)

      results = [...results, ...postResults]
    }

    if (type === 'tags' || type === 'all') {
      // 搜索标签
      const allTags = Array.from(
        new Set(posts.flatMap(post => post.tags || []))
      )
      const searchQuery = searchTerms.join(' ')
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

// ============ 增强搜索算法函数 ============

// 预处理搜索查询
function preprocessQuery(query: string): string[] {
  return query
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(term => term.length > 0)
    .map(term => term.replace(/[^\w\u4e00-\u9fa5]/g, '')) // 保留中英文字符
    .filter(term => term.length > 0)
}

// 计算增强的相关性得分
function calculateEnhancedRelevance(
  post: {
    title: string
    description?: string
    content?: string
    tags?: string[]
    author?: string
    date: string
    featured?: boolean
    readTime?: number
  },
  searchTerms: string[],
  fuzzySearch: boolean = false
) {
  let totalScore = 0
  const matchedFields: string[] = []
  const contentMatches: string[] = []

  const title = post.title?.toLowerCase() || ''
  const description = post.description?.toLowerCase() || ''
  const content = post.content?.toLowerCase() || ''
  const tags = post.tags?.map((tag: string) => tag.toLowerCase()) || []
  const author = post.author?.toLowerCase() || ''

  for (const term of searchTerms) {
    let termScore = 0

    // 1. 标题匹配 (权重最高: 2.0)
    const titleScore = calculateFieldScore(title, term, fuzzySearch)
    if (titleScore > 0) {
      termScore += titleScore * 2.0
      if (!matchedFields.includes('title')) matchedFields.push('title')
    }

    // 2. 描述匹配 (权重: 1.2)
    const descScore = calculateFieldScore(description, term, fuzzySearch)
    if (descScore > 0) {
      termScore += descScore * 1.2
      if (!matchedFields.includes('description'))
        matchedFields.push('description')
    }

    // 3. 内容全文匹配 (权重: 0.8)
    if (content) {
      const contentScore = calculateFieldScore(content, term, fuzzySearch)
      if (contentScore > 0) {
        termScore += contentScore * 0.8
        if (!matchedFields.includes('content')) matchedFields.push('content')

        // 提取内容片段
        const snippets = extractContentSnippets(content, term)
        contentMatches.push(...snippets)
      }
    }

    // 4. 标签匹配 (权重: 1.0)
    for (const tag of tags) {
      const tagScore = calculateFieldScore(tag, term, fuzzySearch)
      if (tagScore > 0) {
        termScore += tagScore * 1.0
        if (!matchedFields.includes('tags')) matchedFields.push('tags')
      }
    }

    // 5. 作者匹配 (权重: 0.3)
    const authorScore = calculateFieldScore(author, term, fuzzySearch)
    if (authorScore > 0) {
      termScore += authorScore * 0.3
      if (!matchedFields.includes('author')) matchedFields.push('author')
    }

    totalScore += termScore
  }

  // 多词查询的加权处理
  if (searchTerms.length > 1) {
    const matchedTermsRatio = matchedFields.length / searchTerms.length
    totalScore *= 0.7 + 0.3 * matchedTermsRatio // 基础分数 + 匹配度奖励
  }

  // 时间衰减因子
  const daysSincePublished = Math.floor(
    (new Date().getTime() - new Date(post.date).getTime()) /
      (1000 * 60 * 60 * 24)
  )
  const timeFactor = Math.max(0.7, 1 - daysSincePublished / 1000) // 最低0.7，最近的文章分数更高
  totalScore *= timeFactor

  // 特色文章和阅读时间调整
  if (post.featured) totalScore *= 1.1

  // 适中长度的文章得分更高
  const readTime = post.readTime || calculateReadTime(content)
  if (readTime >= 3 && readTime <= 15) totalScore *= 1.05

  return {
    totalScore: Math.round(totalScore * 100) / 100,
    matchedFields,
    contentMatches: Array.from(new Set(contentMatches)).slice(0, 5),
  }
}

// 计算单个字段的匹配分数
function calculateFieldScore(
  fieldValue: string,
  searchTerm: string,
  fuzzySearch: boolean
): number {
  if (!fieldValue || !searchTerm) return 0

  // 完全匹配
  if (fieldValue === searchTerm) return 1.0

  // 包含匹配
  if (fieldValue.includes(searchTerm)) {
    const ratio = searchTerm.length / fieldValue.length
    return 0.8 + ratio * 0.2 // 基础分0.8 + 长度比例奖励
  }

  // 模糊匹配 (编辑距离)
  if (fuzzySearch) {
    const similarity = calculateStringSimilarity(fieldValue, searchTerm)
    return similarity > 0.6 ? similarity * 0.6 : 0 // 相似度阈值0.6
  }

  // 词汇起始匹配
  const words = fieldValue.split(/\s+/)
  for (const word of words) {
    if (word.startsWith(searchTerm)) return 0.5
  }

  return 0
}

// 计算字符串相似度 (简化版 Levenshtein 距离)
function calculateStringSimilarity(str1: string, str2: string): number {
  const len1 = str1.length
  const len2 = str2.length

  if (len1 === 0) return len2 === 0 ? 1 : 0
  if (len2 === 0) return 0

  const matrix: number[][] = []
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // 删除
        matrix[i][j - 1] + 1, // 插入
        matrix[i - 1][j - 1] + cost // 替换
      )
    }
  }

  const maxLen = Math.max(len1, len2)
  return (maxLen - matrix[len1][len2]) / maxLen
}

// 提取内容片段
function extractContentSnippets(content: string, searchTerm: string): string[] {
  const snippets: string[] = []
  const sentences = content.split(/[。！？.!?]/).filter(s => s.trim())

  for (const sentence of sentences) {
    if (sentence.toLowerCase().includes(searchTerm)) {
      const trimmed = sentence.trim()
      if (trimmed.length > 10 && trimmed.length < 200) {
        snippets.push(trimmed)
      }
      if (snippets.length >= 3) break
    }
  }

  return snippets
}

// 高亮搜索词
function highlightText(text: string, searchTerms: string[]): string {
  let highlighted = text

  for (const term of searchTerms) {
    const regex = new RegExp(`(${escapeRegex(term)})`, 'gi')
    highlighted = highlighted.replace(
      regex,
      '<mark class="search-highlight">$1</mark>'
    )
  }

  return highlighted
}

// 转义正则表达式特殊字符
function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// 计算阅读时间
function calculateReadTime(content: string): number {
  const wordsPerMinute = 200 // 中文约200字/分钟
  const wordCount = content.replace(/\s/g, '').length // 去除空白字符后的字符数
  return Math.ceil(wordCount / wordsPerMinute)
}

// 计算阅读时间 - 向后兼容
function _calculateRelevance(
  post: {
    title: string
    description?: string
    content?: string
    tags?: string[]
    author?: string
    date: string
    featured?: boolean
    readTime?: number
  },
  query: string
): number {
  const searchTerms = preprocessQuery(query)
  const result = calculateEnhancedRelevance(post, searchTerms, false)
  return result.totalScore
}
