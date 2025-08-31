import type { BlogPost } from '@/types/blog'

// 相关文章推荐算法
export interface RelatedPostsOptions {
  maxResults?: number
  tagWeight?: number
  dateWeight?: number
  titleSimilarityWeight?: number
  contentSimilarityWeight?: number
  excludeCurrentPost?: boolean
}

export interface PostSimilarity {
  post: BlogPost
  score: number
  reasons: string[]
}

// 计算两个字符串的Jaccard相似度
function calculateJaccardSimilarity(str1: string, str2: string): number {
  const words1 = new Set(str1.toLowerCase().split(/\s+/))
  const words2 = new Set(str2.toLowerCase().split(/\s+/))

  const intersection = new Set([...words1].filter(word => words2.has(word)))
  const union = new Set([...words1, ...words2])

  return union.size === 0 ? 0 : intersection.size / union.size
}

// 计算标签相似度
function calculateTagSimilarity(
  tags1: string[] = [],
  tags2: string[] = []
): number {
  if (tags1.length === 0 && tags2.length === 0) return 0
  if (tags1.length === 0 || tags2.length === 0) return 0

  const set1 = new Set(tags1.map(tag => tag.toLowerCase()))
  const set2 = new Set(tags2.map(tag => tag.toLowerCase()))

  const intersection = new Set([...set1].filter(tag => set2.has(tag)))
  const union = new Set([...set1, ...set2])

  return intersection.size / union.size
}

// 计算时间相似度（发布时间越近，相似度越高）
function calculateDateSimilarity(date1: string, date2: string): number {
  const d1 = new Date(date1)
  const d2 = new Date(date2)

  const timeDiff = Math.abs(d1.getTime() - d2.getTime())
  const daysDiff = timeDiff / (1000 * 60 * 60 * 24)

  // 30天内的文章相似度最高，超过365天相似度接近0
  if (daysDiff <= 30) return 1
  if (daysDiff >= 365) return 0

  return 1 - (daysDiff - 30) / (365 - 30)
}

// 提取文章摘要用于内容相似度计算
function extractSummary(content: string, maxLength: number = 500): string {
  // 移除HTML标签
  const textContent = content
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return textContent.length > maxLength
    ? textContent.substring(0, maxLength) + '...'
    : textContent
}

// 计算综合相似度分数
function calculateSimilarityScore(
  currentPost: BlogPost,
  candidatePost: BlogPost,
  options: RelatedPostsOptions
): { score: number; reasons: string[] } {
  const reasons: string[] = []
  let totalScore = 0

  // 标签相似度
  const tagSimilarity = calculateTagSimilarity(
    currentPost.tags,
    candidatePost.tags
  )
  if (tagSimilarity > 0) {
    const tagScore = tagSimilarity * (options.tagWeight || 0.4)
    totalScore += tagScore

    const commonTags = (currentPost.tags || []).filter(tag =>
      (candidatePost.tags || []).some(
        t => t.toLowerCase() === tag.toLowerCase()
      )
    )
    if (commonTags.length > 0) {
      reasons.push(`相同标签: ${commonTags.slice(0, 3).join(', ')}`)
    }
  }

  // 标题相似度
  const titleSimilarity = calculateJaccardSimilarity(
    currentPost.title,
    candidatePost.title
  )
  if (titleSimilarity > 0.1) {
    const titleScore = titleSimilarity * (options.titleSimilarityWeight || 0.3)
    totalScore += titleScore
    if (titleSimilarity > 0.2) {
      reasons.push('标题相似')
    }
  }

  // 内容相似度
  const currentSummary = extractSummary(currentPost.content)
  const candidateSummary = extractSummary(candidatePost.content)
  const contentSimilarity = calculateJaccardSimilarity(
    currentSummary,
    candidateSummary
  )
  if (contentSimilarity > 0.05) {
    const contentScore =
      contentSimilarity * (options.contentSimilarityWeight || 0.2)
    totalScore += contentScore
    if (contentSimilarity > 0.1) {
      reasons.push('内容相似')
    }
  }

  // 时间相似度
  const dateSimilarity = calculateDateSimilarity(
    currentPost.date,
    candidatePost.date
  )
  if (dateSimilarity > 0.1) {
    const dateScore = dateSimilarity * (options.dateWeight || 0.1)
    totalScore += dateScore
    if (dateSimilarity > 0.5) {
      reasons.push('发布时间相近')
    }
  }

  // 系列文章加分
  if (
    currentPost.series &&
    candidatePost.series &&
    currentPost.series === candidatePost.series
  ) {
    totalScore += 0.3
    reasons.push(`同系列: ${currentPost.series}`)
  }

  // 分类加分
  if (
    currentPost.category &&
    candidatePost.category &&
    currentPost.category === candidatePost.category
  ) {
    totalScore += 0.2
    reasons.push(`同分类: ${currentPost.category}`)
  }

  // 特色文章轻微加分
  if (currentPost.featured && candidatePost.featured) {
    totalScore += 0.05
    reasons.push('都是特色文章')
  }

  return { score: Math.min(totalScore, 1), reasons }
}

// 获取相关文章推荐
export function getRelatedPosts(
  currentPost: BlogPost,
  allPosts: BlogPost[],
  options: RelatedPostsOptions = {}
): PostSimilarity[] {
  const {
    maxResults = 5,
    tagWeight = 0.4,
    dateWeight = 0.1,
    titleSimilarityWeight = 0.3,
    contentSimilarityWeight = 0.2,
    excludeCurrentPost = true,
  } = options

  // 过滤掉当前文章
  const candidatePosts = excludeCurrentPost
    ? allPosts.filter(post => post.slug !== currentPost.slug)
    : allPosts

  // 计算每个候选文章的相似度
  const similarities: PostSimilarity[] = candidatePosts
    .map(post => {
      const { score, reasons } = calculateSimilarityScore(currentPost, post, {
        tagWeight,
        dateWeight,
        titleSimilarityWeight,
        contentSimilarityWeight,
      })

      return {
        post,
        score,
        reasons,
      }
    })
    .filter(similarity => similarity.score > 0.1) // 过滤掉相似度太低的
    .sort((a, b) => b.score - a.score) // 按相似度降序排列
    .slice(0, maxResults) // 取前N个

  return similarities
}

// 基于标签的简单推荐（备用方案）
export function getRelatedPostsByTags(
  currentPost: BlogPost,
  allPosts: BlogPost[],
  maxResults: number = 5
): BlogPost[] {
  if (!currentPost.tags || currentPost.tags.length === 0) {
    // 如果没有标签，返回最新的文章
    return allPosts
      .filter(post => post.slug !== currentPost.slug)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, maxResults)
  }

  const currentTags = new Set(currentPost.tags.map(tag => tag.toLowerCase()))

  const relatedPosts = allPosts
    .filter(post => post.slug !== currentPost.slug)
    .map(post => {
      const commonTagsCount = (post.tags || []).filter(tag =>
        currentTags.has(tag.toLowerCase())
      ).length

      return {
        post,
        commonTagsCount,
        // 添加时间权重，越新的文章权重稍高
        dateScore:
          1 /
          (1 +
            (new Date().getTime() - new Date(post.date).getTime()) /
              (1000 * 60 * 60 * 24 * 365)),
      }
    })
    .filter(item => item.commonTagsCount > 0)
    .sort((a, b) => {
      // 首先按共同标签数排序，然后按时间排序
      if (a.commonTagsCount !== b.commonTagsCount) {
        return b.commonTagsCount - a.commonTagsCount
      }
      return b.dateScore - a.dateScore
    })
    .slice(0, maxResults)
    .map(item => item.post)

  // 如果相关文章不够，用最新文章填充
  if (relatedPosts.length < maxResults) {
    const additionalPosts = allPosts
      .filter(
        post =>
          post.slug !== currentPost.slug &&
          !relatedPosts.some(rp => rp.slug === post.slug)
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, maxResults - relatedPosts.length)

    relatedPosts.push(...additionalPosts)
  }

  return relatedPosts
}

// 获取热门文章推荐（基于浏览量）
export function getPopularPosts(
  allPosts: BlogPost[],
  viewsData: Record<string, number> = {},
  maxResults: number = 5
): BlogPost[] {
  return allPosts
    .map(post => ({
      post,
      views: viewsData[post.slug] || 0,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, maxResults)
    .map(item => item.post)
}

// 获取最新文章推荐
export function getLatestPosts(
  allPosts: BlogPost[],
  currentPost?: BlogPost,
  maxResults: number = 5
): BlogPost[] {
  return allPosts
    .filter(post => !currentPost || post.slug !== currentPost.slug)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, maxResults)
}
