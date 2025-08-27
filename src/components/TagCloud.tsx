import Link from 'next/link'
import { getAllTags, getAllPosts } from '@/lib/blog'

interface TagCloudProps {
  className?: string
  maxTags?: number
  showCount?: boolean
}

export default async function TagCloud({ 
  className = "",
  maxTags = 20,
  showCount = false 
}: TagCloudProps) {
  const [allTags, allPosts] = await Promise.all([
    getAllTags(),
    getAllPosts()
  ])

  // 计算每个标签的文章数量
  const tagCounts = allTags.map(tag => ({
    name: tag,
    count: allPosts.filter(post => post.tags && post.tags.includes(tag)).length
  }))

  // 按文章数量排序，取前 maxTags 个
  const sortedTags = tagCounts
    .sort((a, b) => b.count - a.count)
    .slice(0, maxTags)

  // 计算字体大小（根据文章数量）
  const getTagSize = (count: number) => {
    const maxCount = Math.max(...sortedTags.map(t => t.count))
    const minCount = Math.min(...sortedTags.map(t => t.count))
    const ratio = maxCount === minCount ? 1 : (count - minCount) / (maxCount - minCount)
    
    // 字体大小范围：从 text-xs 到 text-lg
    if (ratio > 0.8) return 'text-lg'
    if (ratio > 0.6) return 'text-base'
    if (ratio > 0.4) return 'text-sm'
    return 'text-xs'
  }

  const getTagOpacity = (count: number) => {
    const maxCount = Math.max(...sortedTags.map(t => t.count))
    const minCount = Math.min(...sortedTags.map(t => t.count))
    const ratio = maxCount === minCount ? 1 : (count - minCount) / (maxCount - minCount)
    
    if (ratio > 0.8) return 'opacity-100'
    if (ratio > 0.6) return 'opacity-90'
    if (ratio > 0.4) return 'opacity-80'
    return 'opacity-70'
  }

  if (sortedTags.length === 0) {
    return null
  }

  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {sortedTags.map((tag) => (
        <Link
          key={tag.name}
          href={`/tag/${encodeURIComponent(tag.name)}`}
          className={`
            elegant-link hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200
            ${getTagSize(tag.count)} 
            ${getTagOpacity(tag.count)}
          `}
          title={`${tag.count} 篇文章`}
        >
          {tag.name}
          {showCount && (
            <span className="ml-1 text-xs opacity-60">
              ({tag.count})
            </span>
          )}
        </Link>
      ))}
    </div>
  )
}