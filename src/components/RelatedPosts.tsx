'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Clock, Eye, Tag, ArrowRight, RefreshCw } from 'lucide-react'
import type { BlogPost } from '@/types/blog'
import {
  getRelatedPosts,
  getRelatedPostsByTags,
  getPopularPosts,
  getLatestPosts,
  type PostSimilarity,
} from '@/lib/recommendations'

interface RelatedPostsProps {
  currentPost: BlogPost
  allPosts: BlogPost[]
  viewsData?: Record<string, number>
  className?: string
  maxResults?: number
  showReasons?: boolean
  variant?: 'default' | 'compact' | 'card'
}

export default function RelatedPosts({
  currentPost,
  allPosts,
  viewsData = {},
  className = '',
  maxResults = 5,
  showReasons = true,
  variant = 'default',
}: RelatedPostsProps) {
  const [relatedPosts, setRelatedPosts] = useState<PostSimilarity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [algorithm, setAlgorithm] = useState<
    'smart' | 'tags' | 'popular' | 'latest'
  >('smart')

  useEffect(() => {
    setIsLoading(true)

    // 模拟异步处理（实际使用中可能需要）
    const loadRelatedPosts = () => {
      try {
        let posts: BlogPost[] = []
        let similarities: PostSimilarity[] = []

        switch (algorithm) {
          case 'smart':
            similarities = getRelatedPosts(currentPost, allPosts, {
              maxResults,
              tagWeight: 0.4,
              contentSimilarityWeight: 0.3,
              titleSimilarityWeight: 0.2,
              dateWeight: 0.1,
            })
            break

          case 'tags':
            posts = getRelatedPostsByTags(currentPost, allPosts, maxResults)
            similarities = posts.map(post => ({
              post,
              score: 0.5,
              reasons: ['基于标签推荐'],
            }))
            break

          case 'popular':
            posts = getPopularPosts(allPosts, viewsData, maxResults)
            similarities = posts.map(post => ({
              post,
              score: 0.3,
              reasons: ['热门文章'],
            }))
            break

          case 'latest':
            posts = getLatestPosts(allPosts, currentPost, maxResults)
            similarities = posts.map(post => ({
              post,
              score: 0.2,
              reasons: ['最新文章'],
            }))
            break
        }

        setRelatedPosts(similarities)
      } catch (error) {
        console.error('加载相关文章失败:', error)
        // 降级到标签推荐
        const fallbackPosts = getRelatedPostsByTags(
          currentPost,
          allPosts,
          maxResults
        )
        setRelatedPosts(
          fallbackPosts.map(post => ({
            post,
            score: 0.5,
            reasons: ['基于标签推荐'],
          }))
        )
      } finally {
        setIsLoading(false)
      }
    }

    // 添加少量延迟以改善用户体验
    const timeoutId = setTimeout(loadRelatedPosts, 100)
    return () => clearTimeout(timeoutId)
  }, [currentPost, allPosts, viewsData, maxResults, algorithm])

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // 渲染文章卡片
  const renderPostCard = (similarity: PostSimilarity, index: number) => {
    const { post, score, reasons } = similarity
    const views = viewsData[post.slug] || 0

    if (variant === 'compact') {
      return (
        <Link
          key={post.slug}
          href={`/blog/${post.slug}`}
          className='block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group'
        >
          <div className='flex items-start gap-3'>
            <div className='text-sm text-blue-600 dark:text-blue-400 font-medium min-w-6'>
              {index + 1}.
            </div>
            <div className='flex-1 min-w-0'>
              <h4 className='text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors'>
                {post.title}
              </h4>
              <div className='flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400'>
                <span>{formatDate(post.date)}</span>
                {views > 0 && (
                  <>
                    <span>•</span>
                    <span className='flex items-center gap-1'>
                      <Eye className='w-3 h-3' />
                      {views}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </Link>
      )
    }

    if (variant === 'card') {
      return (
        <div
          key={post.slug}
          className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow'
        >
          <div className='p-4'>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-xs text-blue-600 dark:text-blue-400 font-medium'>
                {algorithm === 'smart'
                  ? `相似度: ${Math.round(score * 100)}%`
                  : reasons[0]}
              </span>
              {views > 0 && (
                <span className='flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400'>
                  <Eye className='w-3 h-3' />
                  {views}
                </span>
              )}
            </div>

            <Link href={`/blog/${post.slug}`} className='group'>
              <h4 className='text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2'>
                {post.title}
              </h4>

              {post.description && (
                <p className='text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2'>
                  {post.description}
                </p>
              )}

              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400'>
                  <Clock className='w-3 h-3' />
                  <span>{formatDate(post.date)}</span>
                </div>

                <ArrowRight className='w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors' />
              </div>
            </Link>
          </div>

          {/* 标签 */}
          {post.tags && post.tags.length > 0 && (
            <div className='px-4 pb-3'>
              <div className='flex flex-wrap gap-1'>
                {post.tags.slice(0, 3).map(tag => (
                  <span
                    key={tag}
                    className='inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded'
                  >
                    <Tag className='w-2.5 h-2.5' />
                    {tag}
                  </span>
                ))}
                {post.tags.length > 3 && (
                  <span className='text-xs text-gray-400'>
                    +{post.tags.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )
    }

    // Default variant
    return (
      <div
        key={post.slug}
        className='flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors'
      >
        <div className='text-lg text-blue-600 dark:text-blue-400 font-bold min-w-8'>
          {index + 1}
        </div>

        <div className='flex-1 min-w-0'>
          <Link href={`/blog/${post.slug}`} className='group'>
            <h4 className='text-base font-medium text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1'>
              {post.title}
            </h4>
          </Link>

          {post.description && (
            <p className='text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2'>
              {post.description}
            </p>
          )}

          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400'>
              <span className='flex items-center gap-1'>
                <Clock className='w-3 h-3' />
                {formatDate(post.date)}
              </span>

              {views > 0 && (
                <span className='flex items-center gap-1'>
                  <Eye className='w-3 h-3' />
                  {views}
                </span>
              )}

              <span>{post.readTime} 分钟阅读</span>
            </div>

            {algorithm === 'smart' && showReasons && (
              <div className='text-xs text-blue-600 dark:text-blue-400'>
                相似度: {Math.round(score * 100)}%
              </div>
            )}
          </div>

          {showReasons && reasons.length > 0 && (
            <div className='mt-2 flex flex-wrap gap-1'>
              {reasons.map((reason, idx) => (
                <span
                  key={idx}
                  className='inline-block px-2 py-0.5 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded'
                >
                  {reason}
                </span>
              ))}
            </div>
          )}

          {/* 标签 */}
          {post.tags && post.tags.length > 0 && (
            <div className='mt-2 flex flex-wrap gap-1'>
              {post.tags.slice(0, 4).map(tag => (
                <Link
                  key={tag}
                  href={`/tag/${encodeURIComponent(tag)}`}
                  className='inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'
                >
                  <Tag className='w-2.5 h-2.5' />
                  {tag}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
            相关文章
          </h3>
          <RefreshCw className='w-4 h-4 text-gray-400 animate-spin' />
        </div>

        <div className='space-y-3'>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className='animate-pulse'>
              <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2' />
              <div className='h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2' />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (relatedPosts.length === 0) {
    return null
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 头部 */}
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
          {algorithm === 'smart' && '相关文章'}
          {algorithm === 'tags' && '相似标签'}
          {algorithm === 'popular' && '热门文章'}
          {algorithm === 'latest' && '最新文章'}
        </h3>

        {/* 算法切换 */}
        <div className='flex items-center gap-1'>
          <select
            value={algorithm}
            onChange={e => setAlgorithm(e.target.value as any)}
            className='text-sm border border-gray-200 dark:border-gray-700 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          >
            <option value='smart'>智能推荐</option>
            <option value='tags'>标签相关</option>
            <option value='popular'>热门文章</option>
            <option value='latest'>最新文章</option>
          </select>
        </div>
      </div>

      {/* 文章列表 */}
      <div className={`space-y-${variant === 'compact' ? '1' : '3'}`}>
        {relatedPosts.map((similarity, index) =>
          renderPostCard(similarity, index)
        )}
      </div>

      {/* 查看更多 */}
      {allPosts.length > maxResults && (
        <div className='text-center pt-4'>
          <Link
            href='/blog'
            className='inline-flex items-center gap-2 px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors'
          >
            查看更多文章
            <ArrowRight className='w-4 h-4' />
          </Link>
        </div>
      )}
    </div>
  )
}

// 侧边栏版本（紧凑型）
interface SidebarRelatedPostsProps {
  currentPost: BlogPost
  allPosts: BlogPost[]
  viewsData?: Record<string, number>
  maxResults?: number
}

export function SidebarRelatedPosts({
  currentPost,
  allPosts,
  viewsData = {},
  maxResults = 5,
}: SidebarRelatedPostsProps) {
  return (
    <RelatedPosts
      currentPost={currentPost}
      allPosts={allPosts}
      viewsData={viewsData}
      maxResults={maxResults}
      variant='compact'
      showReasons={false}
      className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4'
    />
  )
}
