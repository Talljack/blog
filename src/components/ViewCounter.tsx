'use client'

import { useEffect, useState } from 'react'
import { Eye } from 'lucide-react'

interface ViewCounterProps {
  slug: string
  increment?: boolean // 是否增加浏览量
  className?: string
}

export default function ViewCounter({
  slug,
  increment = false,
  className = '',
}: ViewCounterProps) {
  const [views, setViews] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchViews = async () => {
      try {
        // 获取当前浏览量
        const response = await fetch(
          `/api/views?slug=${encodeURIComponent(slug)}`,
          {
            headers: {
              'User-Agent': navigator.userAgent || 'ViewCounter/1.0',
            },
          }
        )

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()

        // 处理新的API响应格式
        if (result.success && result.data) {
          setViews(result.data.views || 0)
        } else {
          // 兼容旧格式
          setViews(result.views || 0)
        }

        // 如果需要增加浏览量
        if (increment) {
          // 防止重复增加（使用 sessionStorage）
          const viewKey = `viewed-${slug}`
          if (!sessionStorage.getItem(viewKey)) {
            try {
              const postResponse = await fetch('/api/views', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'User-Agent': navigator.userAgent || 'ViewCounter/1.0',
                },
                body: JSON.stringify({ slug }),
              })

              if (postResponse.ok) {
                const postResult = await postResponse.json()

                // 标记为已查看
                sessionStorage.setItem(viewKey, 'true')

                // 更新显示的浏览量
                if (postResult.success && postResult.data) {
                  setViews(postResult.data.views || 0)
                } else if (postResult.views) {
                  setViews(postResult.views)
                } else {
                  setViews(prev => (prev || 0) + 1)
                }
              } else {
                console.warn(
                  'Failed to increment view count:',
                  postResponse.status
                )
              }
            } catch (error) {
              console.warn('Error incrementing views:', error)
              // 静默失败，仍显示当前浏览量
            }
          }
        }
      } catch (error) {
        console.error('Error fetching views:', error)
        setViews(0)
      } finally {
        setIsLoading(false)
      }
    }

    if (slug && slug.trim()) {
      fetchViews()
    } else {
      setIsLoading(false)
      setViews(0)
    }
  }, [slug, increment])

  if (isLoading) {
    return (
      <span
        className={`flex items-center text-gray-500 dark:text-gray-500 ${className}`}
      >
        <Eye className='w-4 h-4 mr-1' />
        <span className='animate-pulse'>--</span>
      </span>
    )
  }

  return (
    <span
      className={`flex items-center text-gray-500 dark:text-gray-500 ${className}`}
    >
      <Eye className='w-4 h-4 mr-1' />
      <span>{views ?? 0} 次阅读</span>
    </span>
  )
}
