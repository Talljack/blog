'use client'

import { TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getAllPosts } from '@/lib/blog'
import { formatDateChinese } from '@/lib/utils'

interface PopularPost {
  slug: string
  title: string
  date: string
  views: number
}

interface PopularPostsProps {
  limit?: number
  className?: string
}

export default function PopularPosts({
  limit = 5,
  className = '',
}: PopularPostsProps) {
  const [popularPosts, setPopularPosts] = useState<PopularPost[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPopularPosts = async () => {
      try {
        // 获取所有文章
        const allPosts = await getAllPosts()

        // 获取浏览量数据
        const viewsResponse = await fetch('/api/views')
        const viewsData = await viewsResponse.json()

        // 合并数据并按浏览量排序
        const postsWithViews = allPosts
          .map(post => ({
            slug: post.slug,
            title: post.title,
            date: post.date,
            views: viewsData[post.slug] || 0,
          }))
          .sort((a, b) => b.views - a.views)
          .slice(0, limit)

        setPopularPosts(postsWithViews)
      } catch (error) {
        console.error('Error fetching popular posts:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPopularPosts()
  }, [limit])

  if (isLoading) {
    return (
      <div className={className}>
        <div className='flex items-center mb-4'>
          <TrendingUp className='w-4 h-4 mr-2' />
          <h3 className='heading-font text-base font-medium text-gray-900 dark:text-gray-100'>
            热门文章
          </h3>
        </div>
        <div className='space-y-3'>
          {Array.from({ length: limit }).map((_, index) => (
            <div key={index} className='animate-pulse'>
              <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2' />
              <div className='h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2' />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (popularPosts.length === 0) {
    return null
  }

  return (
    <div className={className}>
      <div className='flex items-center mb-4'>
        <TrendingUp className='w-4 h-4 mr-2' />
        <h3 className='heading-font text-base font-medium text-gray-900 dark:text-gray-100'>
          热门文章
        </h3>
      </div>

      <div className='space-y-4'>
        {popularPosts.map((post, index) => (
          <article key={post.slug} className='group'>
            <Link href={`/blog/${post.slug}`}>
              <div className='flex items-start space-x-3'>
                {/* 排名 */}
                <span className='flex-shrink-0 w-5 h-5 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors'>
                  {index + 1}
                </span>

                <div className='flex-1 min-w-0'>
                  <h4 className='text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors line-clamp-2'>
                    {post.title}
                  </h4>
                  <div className='flex items-center space-x-2 mt-1 text-xs text-gray-500 dark:text-gray-500'>
                    <span>{formatDateChinese(post.date)}</span>
                    <span>·</span>
                    <span>{post.views} 阅读</span>
                  </div>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  )
}
