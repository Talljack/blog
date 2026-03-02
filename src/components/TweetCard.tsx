'use client'

import { ChevronDown, ChevronUp } from 'lucide-react'
import { useEffect, useRef, useState, type TransitionEvent } from 'react'
import { Tweet } from '@/types/bookmarks'
import { formatDateChinese } from '@/lib/utils'
import Link from 'next/link'

interface TweetCardProps {
  tweet: Tweet
  showActions?: boolean
  onEdit?: (tweet: Tweet) => void
  onDelete?: (tweet: Tweet) => void
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
  const previewRegionRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLParagraphElement>(null)
  const collapsedMeasureRef = useRef<HTMLParagraphElement>(null)
  const expandedMeasureRef = useRef<HTMLParagraphElement>(null)
  const [embedLoaded, setEmbedLoaded] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isCollapsing, setIsCollapsing] = useState(false)
  const [isExpandable, setIsExpandable] = useState(false)
  const [previewHeights, setPreviewHeights] = useState({
    collapsed: 0,
    expanded: 0,
  })
  const previewText = tweet.metadata?.text?.trim()
  const isPreviewExpanded = isExpanded || isCollapsing

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

  useEffect(() => {
    if (
      !previewText ||
      !previewRegionRef.current ||
      !collapsedMeasureRef.current ||
      !expandedMeasureRef.current ||
      typeof ResizeObserver === 'undefined'
    ) {
      return
    }

    const region = previewRegionRef.current
    const collapsedMeasure = collapsedMeasureRef.current
    const expandedMeasure = expandedMeasureRef.current

    const syncPreviewMetrics = () => {
      const collapsed = Math.ceil(
        collapsedMeasure.getBoundingClientRect().height
      )
      const expanded = Math.ceil(expandedMeasure.getBoundingClientRect().height)

      setPreviewHeights(current =>
        current.collapsed === collapsed && current.expanded === expanded
          ? current
          : { collapsed, expanded }
      )
      setIsExpandable(expanded > collapsed + 1)
    }

    const frame = window.requestAnimationFrame(syncPreviewMetrics)

    const observer = new ResizeObserver(() => {
      syncPreviewMetrics()
    })
    observer.observe(region)
    observer.observe(collapsedMeasure)
    observer.observe(expandedMeasure)

    return () => {
      window.cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [previewText])

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (!previewText) {
        setIsExpanded(false)
        setIsCollapsing(false)
        setIsExpandable(false)
        setPreviewHeights({ collapsed: 0, expanded: 0 })
        return
      }

      setIsExpanded(false)
      setIsCollapsing(false)
    })

    return () => {
      window.cancelAnimationFrame(frame)
    }
  }, [previewText])

  const handleExpandPreview = () => {
    setIsExpanded(true)
  }

  const handleCollapsePreview = () => {
    if (!isExpandable) {
      setIsExpanded(false)
      return
    }

    setIsCollapsing(true)
    setIsExpanded(false)
  }

  const handlePreviewTransitionEnd = (
    event: TransitionEvent<HTMLDivElement>
  ) => {
    if (event.propertyName !== 'max-height') {
      return
    }

    if (!isExpanded && isCollapsing) {
      setIsCollapsing(false)
    }
  }

  const isDarkMode =
    typeof window !== 'undefined' &&
    document.documentElement.classList.contains('dark')

  return (
    <article
      className='py-6 border-b border-gray-100 dark:border-gray-800 last:border-b-0'
      data-testid='tweet-card'
    >
      <div className='space-y-4'>
        <div className='flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50'>
          {previewText && (
            <div ref={previewRegionRef} className='relative'>
              <div
                className='overflow-hidden transition-[max-height] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[max-height]'
                onTransitionEnd={handlePreviewTransitionEnd}
                style={{
                  maxHeight:
                    isExpandable && previewHeights.collapsed > 0
                      ? `${isPreviewExpanded ? previewHeights.expanded : previewHeights.collapsed}px`
                      : undefined,
                }}
              >
                <p
                  ref={previewRef}
                  data-testid='tweet-preview'
                  className='text-sm leading-relaxed whitespace-pre-wrap break-words text-gray-800 dark:text-gray-200'
                  style={{
                    display: '-webkit-box',
                    WebkitBoxOrient: 'vertical',
                    WebkitLineClamp: isPreviewExpanded ? 'unset' : '8',
                    overflow: isPreviewExpanded ? 'visible' : 'hidden',
                  }}
                >
                  {previewText}
                </p>
              </div>

              {isExpandable && !isPreviewExpanded && (
                <>
                  <div
                    className='pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-gray-50/0 via-gray-50/82 to-gray-50 dark:from-gray-800/0 dark:via-gray-800/88 dark:to-gray-800/95'
                    aria-hidden='true'
                  />
                  <div className='absolute bottom-1.5 right-0 flex justify-end'>
                    <button
                      type='button'
                      data-testid='tweet-preview-toggle'
                      onClick={handleExpandPreview}
                      className='inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-gray-200/90 bg-white/92 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm shadow-slate-950/5 backdrop-blur transition-all duration-200 hover:border-blue-200 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-white/10 dark:bg-slate-900/88 dark:text-slate-200 dark:hover:border-blue-400/40 dark:hover:text-blue-300'
                      aria-expanded='false'
                    >
                      <span>展开全文</span>
                      <ChevronDown className='h-3.5 w-3.5' />
                    </button>
                  </div>
                </>
              )}

              <div
                aria-hidden='true'
                className='pointer-events-none absolute inset-x-0 top-0 -z-10 opacity-0'
              >
                <p
                  ref={collapsedMeasureRef}
                  className='text-sm leading-relaxed whitespace-pre-wrap break-words'
                  style={{
                    display: '-webkit-box',
                    WebkitBoxOrient: 'vertical',
                    WebkitLineClamp: '8',
                    overflow: 'hidden',
                  }}
                >
                  {previewText}
                </p>
                <p
                  ref={expandedMeasureRef}
                  className='text-sm leading-relaxed whitespace-pre-wrap break-words'
                >
                  {previewText}
                </p>
              </div>
            </div>
          )}

          {previewText && isExpandable && isExpanded && (
            <div className='flex justify-end'>
              <button
                type='button'
                data-testid='tweet-preview-toggle'
                onClick={handleCollapsePreview}
                className='inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors duration-200 hover:bg-blue-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-blue-400/20 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/15'
                aria-expanded='true'
              >
                <span>收起</span>
                <ChevronUp className='h-3.5 w-3.5' />
              </button>
            </div>
          )}

          <div data-testid='tweet-link-row' className='flex items-center gap-3'>
            <svg
              className='h-4 w-4 shrink-0 text-blue-400'
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
              className='text-sm font-medium text-blue-600 hover:underline dark:text-blue-400'
            >
              查看 @{tweet.authorUsername} 的推文 →
            </a>
          </div>
        </div>

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
                      onClick={() => onDelete(tweet)}
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

        <div
          ref={tweetRef}
          className={`overflow-hidden transition-all duration-200 ${
            embedLoaded
              ? 'max-h-[1200px] opacity-100'
              : 'pointer-events-none max-h-0 opacity-0'
          }`}
          aria-hidden={!embedLoaded}
          data-testid='tweet-embed-container'
        >
          <blockquote
            className='twitter-tweet'
            data-theme={isDarkMode ? 'dark' : 'light'}
          >
            <a href={tweet.url}>@{tweet.authorUsername} 的推文</a>
          </blockquote>
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
