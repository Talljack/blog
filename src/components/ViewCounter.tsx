'use client'

import { Eye } from 'lucide-react'
import { useEffect, useState } from 'react'
import { sendPageView, sendViewCountEvent } from '@/lib/analytics'

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
    const fetchAndTrackViews = async () => {
      if (!slug || !slug.trim()) {
        setIsLoading(false)
        setViews(0)
        return
      }

      try {
        const viewKey = `viewed-${slug}`
        const gaViewKey = `ga-viewed-${slug}`

        // 检查是否在冷却期内（30分钟）
        const lastViewTime = sessionStorage.getItem(`${viewKey}-time`)
        const now = Date.now()
        const COOLDOWN_TIME = 30 * 60 * 1000 // 30分钟

        const shouldIncrement =
          increment &&
          (!lastViewTime || now - parseInt(lastViewTime) > COOLDOWN_TIME)

        let postSucceeded = false

        // 如果需要增加浏览量，先发POST请求
        if (shouldIncrement) {
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
              console.log('ViewCounter: POST response:', postResult)
              if (postResult.success && postResult.data) {
                setViews(postResult.data.views || 0)
                postSucceeded = true
              }

              // 标记为已查看，记录时间戳
              console.log(
                'ViewCounter: Setting sessionStorage keys:',
                viewKey,
                `${viewKey}-time`
              )
              sessionStorage.setItem(viewKey, 'true')
              sessionStorage.setItem(`${viewKey}-time`, now.toString())

              // 发送Google Analytics事件（包含实际浏览量数据）
              if (!sessionStorage.getItem(gaViewKey)) {
                const currentViews = postResult.data.views || 0

                // 发送页面浏览事件和浏览量增量事件
                sendPageView(slug, currentViews)
                sendViewCountEvent(slug, currentViews, true) // true表示这是新的浏览

                sessionStorage.setItem(gaViewKey, 'true')
              }
            }
          } catch (error) {
            console.warn('Error incrementing views:', error)
          }
        }

        // 如果没有增量操作或增量操作失败，获取当前浏览量
        if (!postSucceeded) {
          const response = await fetch(
            `/api/views?slug=${encodeURIComponent(slug)}`,
            {
              headers: {
                'User-Agent': navigator.userAgent || 'ViewCounter/1.0',
              },
            }
          )

          if (response.ok) {
            const result = await response.json()
            const currentViews = result.success
              ? result.data.views || 0
              : result.views || 0
            setViews(currentViews)

            // 对于非增量访问，也发送浏览量数据到GA（仅首次）
            const gaViewKey = `ga-viewed-${slug}`
            if (!sessionStorage.getItem(gaViewKey)) {
              sendViewCountEvent(slug, currentViews, false) // false表示只是查看，不是新增
              sessionStorage.setItem(gaViewKey, 'true')
            }
          } else {
            setViews(0)
          }
        }
      } catch (error) {
        console.error('Error fetching views:', error)
        setViews(0)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAndTrackViews()
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
