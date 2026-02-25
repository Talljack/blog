'use client'

import { useEffect, useRef } from 'react'
import { Tweet } from '@/types/bookmarks'
import { formatDateChinese } from '@/lib/utils'
import Link from 'next/link'

interface TweetCardProps {
  tweet: Tweet
  showActions?: boolean
  onEdit?: (tweet: Tweet) => void
  onDelete?: (tweetId: string) => void
}

export default function TweetCard({
  tweet,
  showActions = false,
  onEdit,
  onDelete,
}: TweetCardProps) {
  const tweetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && tweetRef.current) {
      const script = document.createElement('script')
      script.src = 'https://platform.twitter.com/widgets.js'
      script.async = true
      script.charset = 'utf-8'

      if (!document.querySelector('script[src*="platform.twitter.com"]')) {
        document.body.appendChild(script)
      } else {
        if (window.twttr?.widgets) {
          window.twttr.widgets.load(tweetRef.current)
        }
      }
    }
  }, [tweet.url])

  const isDarkMode =
    typeof window !== 'undefined' &&
    document.documentElement.classList.contains('dark')

  return (
    <article className='py-6 border-b border-gray-100 dark:border-gray-800 last:border-b-0'>
      <div className='space-y-4'>
        {/* Tweet Embed */}
        <div ref={tweetRef} className='tweet-embed-container'>
          <blockquote
            className='twitter-tweet'
            data-theme={isDarkMode ? 'dark' : 'light'}
          >
            <a href={tweet.url} />
          </blockquote>
        </div>

        {/* Metadata */}
        <div className='space-y-3'>
          {/* Tags */}
          {tweet.tags.length > 0 && (
            <div className='flex flex-wrap gap-2'>
              {tweet.tags.map(tag => (
                <Link
                  key={tag}
                  href={`/bookmarks?tag=${encodeURIComponent(tag)}`}
                  className='inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors'
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {/* Notes */}
          {tweet.notes && (
            <div className='prose prose-sm dark:prose-invert max-w-none'>
              <p className='text-gray-700 dark:text-gray-300 text-sm leading-relaxed'>
                {tweet.notes}
              </p>
            </div>
          )}

          {/* Footer */}
          <div className='flex items-center justify-between text-xs text-gray-500 dark:text-gray-400'>
            <div className='flex items-center space-x-2'>
              <time dateTime={tweet.savedAt}>
                保存于 {formatDateChinese(tweet.savedAt)}
              </time>
              {tweet.isPublic && (
                <>
                  <span>·</span>
                  <span className='text-green-600 dark:text-green-400'>
                    公开
                  </span>
                </>
              )}
            </div>

            {showActions && (
              <div className='flex items-center space-x-2'>
                {onEdit && (
                  <button
                    onClick={() => onEdit(tweet)}
                    className='min-h-[44px] px-4 py-2 -m-2 flex items-center justify-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded cursor-pointer'
                    aria-label={`编辑推文 @${tweet.authorUsername}`}
                  >
                    编辑
                  </button>
                )}
                {onDelete && (
                  <>
                    <span>·</span>
                    <button
                      onClick={() => onDelete(tweet.id)}
                      className='min-h-[44px] px-4 py-2 -m-2 flex items-center justify-center text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 rounded cursor-pointer'
                      aria-label={`删除推文 @${tweet.authorUsername}`}
                    >
                      删除
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: (element?: HTMLElement) => void
      }
    }
  }
}
