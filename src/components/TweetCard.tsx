'use client'

import { useEffect, useRef, useState } from 'react'
import { Tweet } from '@/types/bookmarks'
import { formatDateChinese } from '@/lib/utils'
import Link from 'next/link'

interface TweetCardProps {
  tweet: Tweet
  showActions?: boolean
  onEdit?: (tweet: Tweet) => void
  onDelete?: (tweetId: string) => void
  onTogglePublic?: (tweetId: string, isPublic: boolean) => void
}

function loadTwitterWidgets(container: HTMLElement) {
  if (window.twttr?.widgets) {
    window.twttr.widgets.load(container)
    return
  }

  if (document.querySelector('script[src*="platform.twitter.com/widgets"]')) {
    const check = setInterval(() => {
      if (window.twttr?.widgets) {
        clearInterval(check)
        window.twttr.widgets.load(container)
      }
    }, 200)
    setTimeout(() => clearInterval(check), 10000)
    return
  }

  const script = document.createElement('script')
  script.src = 'https://platform.twitter.com/widgets.js'
  script.async = true
  script.charset = 'utf-8'
  script.onload = () => {
    const waitReady = setInterval(() => {
      if (window.twttr?.widgets) {
        clearInterval(waitReady)
        window.twttr.widgets.load(container)
      }
    }, 100)
    setTimeout(() => clearInterval(waitReady), 10000)
  }
  document.body.appendChild(script)
}

export default function TweetCard({
  tweet,
  showActions = false,
  onEdit,
  onDelete,
  onTogglePublic,
}: TweetCardProps) {
  const tweetRef = useRef<HTMLDivElement>(null)
  const [embedLoaded, setEmbedLoaded] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !tweetRef.current) return

    const container = tweetRef.current

    const observer = new MutationObserver(() => {
      if (container.querySelector('iframe[id^="twitter-widget"]')) {
        setEmbedLoaded(true)
        observer.disconnect()
      }
    })
    observer.observe(container, { childList: true, subtree: true })

    loadTwitterWidgets(container)

    const timeout = setTimeout(() => {
      observer.disconnect()
    }, 15000)

    return () => {
      observer.disconnect()
      clearTimeout(timeout)
    }
  }, [tweet.url])

  const isDarkMode =
    typeof window !== 'undefined' &&
    document.documentElement.classList.contains('dark')

  return (
    <article className='py-6 border-b border-gray-100 dark:border-gray-800 last:border-b-0'>
      <div className='space-y-4'>
        <div ref={tweetRef} className='tweet-embed-container'>
          <blockquote
            className='twitter-tweet'
            data-theme={isDarkMode ? 'dark' : 'light'}
          >
            <a href={tweet.url}>@{tweet.authorUsername} 的推文</a>
          </blockquote>
        </div>

        {!embedLoaded && (
          <div className='flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700'>
            <svg
              className='w-5 h-5 text-blue-400 shrink-0'
              viewBox='0 0 24 24'
              fill='currentColor'
              aria-hidden='true'
            >
              <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
            </svg>
            <a
              href={tweet.url}
              target='_blank'
              rel='noopener noreferrer'
              className='text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium'
            >
              查看 @{tweet.authorUsername} 的推文 →
            </a>
          </div>
        )}

        <div className='space-y-3'>
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

          {tweet.notes && (
            <div className='prose prose-sm dark:prose-invert max-w-none'>
              <p className='text-gray-700 dark:text-gray-300 text-sm leading-relaxed'>
                {tweet.notes}
              </p>
            </div>
          )}

          <div className='flex items-center justify-between text-xs text-gray-500 dark:text-gray-400'>
            <div className='flex items-center space-x-2'>
              <time dateTime={tweet.savedAt}>
                保存于 {formatDateChinese(tweet.savedAt)}
              </time>
              {showActions && onTogglePublic ? (
                <>
                  <span>·</span>
                  <button
                    onClick={() => onTogglePublic(tweet.id, !tweet.isPublic)}
                    className='cursor-pointer hover:underline'
                  >
                    {tweet.isPublic ? (
                      <span className='text-green-600 dark:text-green-400'>
                        公开
                      </span>
                    ) : (
                      <span className='text-gray-400 dark:text-gray-500'>
                        私有
                      </span>
                    )}
                  </button>
                </>
              ) : tweet.isPublic ? (
                <>
                  <span>·</span>
                  <span className='text-green-600 dark:text-green-400'>
                    公开
                  </span>
                </>
              ) : null}
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
