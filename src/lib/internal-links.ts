import { getAllPosts } from './blog'
import { siteConfig } from './config'

export interface InternalLink {
  href: string
  title: string
  description?: string
  type: 'post' | 'page' | 'tag' | 'category'
  relevanceScore: number
  anchor?: string
}

export interface LinkSuggestion {
  text: string
  links: InternalLink[]
}

/**
 * 生成内部链接建议
 */
export async function generateInternalLinks(
  content: string,
  currentSlug?: string,
  tags?: string[]
): Promise<LinkSuggestion[]> {
  const posts = await getAllPosts()
  const suggestions: LinkSuggestion[] = []

  // 过滤掉当前文章
  const filteredPosts = currentSlug
    ? posts.filter(post => post.slug !== currentSlug)
    : posts

  // 关键词映射表
  const keywordMapping = new Map<string, InternalLink[]>()

  // 为每个文章建立关键词索引
  filteredPosts.forEach(post => {
    const postLink: InternalLink = {
      href: `/blog/${post.slug}`,
      title: post.title,
      description: post.description,
      type: 'post',
      relevanceScore: 0,
    }

    // 从标题中提取关键词
    const titleWords = extractKeywords(post.title)
    titleWords.forEach(word => {
      if (!keywordMapping.has(word)) {
        keywordMapping.set(word, [])
      }
      keywordMapping.get(word)!.push({
        ...postLink,
        relevanceScore: 3, // 标题匹配权重最高
      })
    })

    // 从描述中提取关键词
    if (post.description) {
      const descWords = extractKeywords(post.description)
      descWords.forEach(word => {
        if (!keywordMapping.has(word)) {
          keywordMapping.set(word, [])
        }
        keywordMapping.get(word)!.push({
          ...postLink,
          relevanceScore: 2, // 描述匹配权重中等
        })
      })
    }

    // 从标签中建立索引
    if (post.tags) {
      post.tags.forEach(tag => {
        const tagWords = extractKeywords(tag)
        tagWords.forEach(word => {
          if (!keywordMapping.has(word)) {
            keywordMapping.set(word, [])
          }
          keywordMapping.get(word)!.push({
            ...postLink,
            relevanceScore: 2.5, // 标签匹配权重较高
          })
        })

        // 为标签页面创建链接
        const tagLink: InternalLink = {
          href: `/tag/${encodeURIComponent(tag)}`,
          title: `${tag} 相关文章`,
          description: `查看所有关于 ${tag} 的文章`,
          type: 'tag',
          relevanceScore: 1.5,
        }

        if (!keywordMapping.has(tag.toLowerCase())) {
          keywordMapping.set(tag.toLowerCase(), [])
        }
        keywordMapping.get(tag.toLowerCase())!.push(tagLink)
      })
    }
  })

  // 分析内容中的关键词
  const contentKeywords = extractKeywords(content)
  const keywordFrequency = getKeywordFrequency(content, contentKeywords)

  // 为高频关键词生成链接建议
  keywordFrequency
    .filter(({ frequency }) => frequency >= 2) // 至少出现2次
    .slice(0, 10) // 最多10个建议
    .forEach(({ keyword, frequency }) => {
      const relatedLinks = keywordMapping.get(keyword) || []

      if (relatedLinks.length > 0) {
        // 根据相关性和频率排序
        const sortedLinks = relatedLinks
          .map(link => ({
            ...link,
            relevanceScore: link.relevanceScore * Math.log(frequency + 1),
          }))
          .sort((a, b) => b.relevanceScore - a.relevanceScore)
          .slice(0, 3) // 每个关键词最多3个链接

        suggestions.push({
          text: keyword,
          links: sortedLinks,
        })
      }
    })

  // 基于当前文章标签推荐相关文章
  if (tags && tags.length > 0) {
    const tagBasedLinks = filteredPosts
      .filter(post => post.tags?.some(tag => tags.includes(tag)))
      .map(post => ({
        href: `/blog/${post.slug}`,
        title: post.title,
        description: post.description,
        type: 'post' as const,
        relevanceScore: calculateTagSimilarity(tags, post.tags || []),
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 5)

    if (tagBasedLinks.length > 0) {
      suggestions.push({
        text: '相关文章',
        links: tagBasedLinks,
      })
    }
  }

  return suggestions
    .filter(suggestion => suggestion.links.length > 0)
    .slice(0, 8) // 限制总建议数量
}

/**
 * 从文本中提取关键词
 */
function extractKeywords(text: string): string[] {
  // 中英文关键词提取
  const cleanText = text
    .toLowerCase()
    .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, ' ') // 保留中文、英文、数字
    .replace(/\s+/g, ' ')
    .trim()

  const words = cleanText
    .split(' ')
    .filter(word => word.length >= 2) // 至少2个字符
    .filter(word => !isStopWord(word)) // 过滤停用词

  // 去重并返回
  return [...new Set(words)]
}

/**
 * 判断是否为停用词
 */
function isStopWord(word: string): boolean {
  const stopWords = new Set([
    // 中文停用词
    '的',
    '了',
    '在',
    '是',
    '我',
    '有',
    '和',
    '就',
    '不',
    '人',
    '都',
    '一',
    '一个',
    '上',
    '也',
    '很',
    '到',
    '说',
    '要',
    '去',
    '你',
    '会',
    '着',
    '没有',
    '看',
    '好',
    '自己',
    '这',
    // 英文停用词
    'the',
    'a',
    'an',
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
    'from',
    'up',
    'about',
    'into',
    'through',
    'during',
    'before',
    'after',
    'above',
    'below',
    'between',
    'among',
    'is',
    'are',
    'was',
    'were',
    'be',
    'been',
    'being',
    'have',
    'has',
    'had',
    'do',
    'does',
    'did',
    'will',
    'would',
    'could',
    'should',
    'may',
    'might',
    'must',
    'can',
    'this',
    'that',
    'these',
    'those',
    'i',
    'you',
    'he',
    'she',
    'it',
    'we',
    'they',
    'me',
    'him',
    'her',
    'us',
    'them',
  ])

  return stopWords.has(word.toLowerCase())
}

/**
 * 获取关键词频率
 */
function getKeywordFrequency(
  text: string,
  keywords: string[]
): Array<{ keyword: string; frequency: number }> {
  const lowerText = text.toLowerCase()

  return keywords
    .map(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
      const matches = lowerText.match(regex)
      return {
        keyword,
        frequency: matches ? matches.length : 0,
      }
    })
    .filter(({ frequency }) => frequency > 0)
    .sort((a, b) => b.frequency - a.frequency)
}

/**
 * 计算标签相似度
 */
function calculateTagSimilarity(tags1: string[], tags2: string[]): number {
  const set1 = new Set(tags1.map(tag => tag.toLowerCase()))
  const set2 = new Set(tags2.map(tag => tag.toLowerCase()))

  const intersection = new Set([...set1].filter(tag => set2.has(tag)))
  const union = new Set([...set1, ...set2])

  // Jaccard相似度
  return intersection.size / union.size
}

/**
 * 自动在内容中插入内部链接
 */
export function insertInternalLinks(
  content: string,
  suggestions: LinkSuggestion[]
): string {
  let processedContent = content

  suggestions.forEach(({ text, links }) => {
    if (links.length === 0) return

    // 选择相关性最高的链接
    const bestLink = links[0]

    // 创建链接的正则表达式，避免重复链接
    const linkRegex = new RegExp(`\\b${text}\\b(?![^<]*>|[^<>]*</a>)`, 'gi')

    // 只替换第一个匹配项，避免过度链接
    let hasReplaced = false
    processedContent = processedContent.replace(linkRegex, match => {
      if (hasReplaced) return match

      hasReplaced = true
      return `<a href="${bestLink.href}" title="${bestLink.title}" class="internal-link text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline">${match}</a>`
    })
  })

  return processedContent
}

/**
 * 生成相关文章推荐
 */
export async function getRelatedPosts(
  currentSlug: string,
  tags?: string[],
  limit: number = 5
): Promise<
  Array<{
    title: string
    href: string
    description?: string
    date?: string
    readTime?: number
    similarity: number
  }>
> {
  const posts = await getAllPosts()
  const currentPost = posts.find(post => post.slug === currentSlug)

  if (!currentPost) return []

  const otherPosts = posts.filter(post => post.slug !== currentSlug)

  return otherPosts
    .map(post => {
      let similarity = 0

      // 基于标签计算相似度
      if (post.tags && currentPost.tags) {
        similarity += calculateTagSimilarity(currentPost.tags, post.tags) * 3
      }

      // 基于标题相似度
      const titleSimilarity = calculateTextSimilarity(
        currentPost.title,
        post.title
      )
      similarity += titleSimilarity * 2

      // 基于描述相似度
      if (post.description && currentPost.description) {
        const descSimilarity = calculateTextSimilarity(
          currentPost.description,
          post.description
        )
        similarity += descSimilarity
      }

      // 时间因素（越新的文章权重稍高）
      const daysDiff =
        Math.abs(
          new Date(post.date).getTime() - new Date(currentPost.date).getTime()
        ) /
        (1000 * 60 * 60 * 24)
      similarity += Math.max(0, (365 - daysDiff) / 365) * 0.5

      return {
        title: post.title,
        href: `/blog/${post.slug}`,
        description: post.description,
        date: post.date,
        readTime: post.readTime,
        similarity,
      }
    })
    .filter(post => post.similarity > 0)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)
}

/**
 * 计算文本相似度
 */
function calculateTextSimilarity(text1: string, text2: string): number {
  const words1 = new Set(extractKeywords(text1))
  const words2 = new Set(extractKeywords(text2))

  const intersection = new Set([...words1].filter(word => words2.has(word)))
  const union = new Set([...words1, ...words2])

  return union.size > 0 ? intersection.size / union.size : 0
}

/**
 * 验证链接可访问性
 */
export async function validateInternalLinks(content: string): Promise<{
  valid: string[]
  invalid: string[]
  suggestions: string[]
}> {
  const linkRegex = /<a\s+(?:[^>]*?\s+)?href="([^"]*)"[^>]*>(.*?)<\/a>/gi
  const links: Array<{ href: string; text: string }> = []

  let match
  while ((match = linkRegex.exec(content)) !== null) {
    const href = match[1]
    const text = match[2]

    // 只检查内部链接
    if (href.startsWith('/') || href.startsWith(siteConfig.url)) {
      links.push({ href, text })
    }
  }

  const valid: string[] = []
  const invalid: string[] = []
  const suggestions: string[] = []

  // 这里可以添加实际的链接验证逻辑
  // 例如检查页面是否存在等

  return { valid, invalid, suggestions }
}
