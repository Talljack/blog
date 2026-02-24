'use client'

import { siteConfig } from '@/lib/config'
import { useTheme } from 'next-themes'
import { useEffect, useRef, useState } from 'react'
import { MessageCircle, ExternalLink, Loader2, Eye, EyeOff } from 'lucide-react'

interface CommentsProps {
  slug: string
  title: string
}

interface CommentStats {
  count: number
  lastUpdated?: string
}

export default function Comments({ slug, title }: CommentsProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { resolvedTheme } = useTheme()
  const [isLoading, setIsLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<CommentStats | null>(null)

  // 延迟加载评论
  useEffect(() => {
    const loadComments = () => {
      if (!ref.current || !isVisible) return

      setIsLoading(true)
      setError(null)

      // 清理之前的评论组件
      const existingScript = ref.current.querySelector('script')
      if (existingScript) {
        ref.current.innerHTML = ''
      }

      // 创建新的 Giscus 脚本
      const script = document.createElement('script')
      const config = siteConfig.giscus

      script.src = 'https://giscus.app/client.js'
      script.setAttribute('data-repo', config.repo || 'your-username/your-repo')
      script.setAttribute('data-repo-id', config.repoId || 'your-repo-id')
      script.setAttribute('data-category', config.category || 'Announcements')
      script.setAttribute(
        'data-category-id',
        config.categoryId || 'your-category-id'
      )
      script.setAttribute('data-mapping', 'specific')
      script.setAttribute('data-term', `${slug}: ${title}`)
      script.setAttribute('data-strict', '0')
      script.setAttribute('data-reactions-enabled', '1')
      script.setAttribute('data-emit-metadata', '1')
      script.setAttribute('data-input-position', 'top')
      script.setAttribute(
        'data-theme',
        resolvedTheme === 'dark' ? 'dark' : 'light'
      )
      script.setAttribute('data-lang', 'zh-CN')
      script.setAttribute('data-loading', 'lazy')
      script.crossOrigin = 'anonymous'
      script.async = true

      // 监听 Giscus 消息
      const handleGiscusMessage = (event: MessageEvent) => {
        if (event.origin !== 'https://giscus.app') return

        const { data } = event
        if (data?.giscus) {
          if (data.giscus.discussion) {
            setStats({
              count: data.giscus.discussion.totalCommentCount || 0,
              lastUpdated: data.giscus.discussion.updatedAt,
            })
            setIsLoading(false)
            setError(null) // 清除错误状态
          }
          if (data.giscus.error) {
            // 如果是讨论不存在的错误，不显示为错误状态，因为这是正常的
            if (data.giscus.error.includes('Discussion not found')) {
              setStats({ count: 0 })
              setError(null)
            } else {
              setError(data.giscus.error)
            }
            setIsLoading(false)
          }
        }
      }

      window.addEventListener('message', handleGiscusMessage)
      script.onload = () => setTimeout(() => setIsLoading(false), 2000)
      script.onerror = () => {
        setError('评论加载失败')
        setIsLoading(false)
      }

      ref.current.appendChild(script)

      return () => {
        window.removeEventListener('message', handleGiscusMessage)
      }
    }

    loadComments()
  }, [slug, title, resolvedTheme, isVisible])

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
        }
      },
      { rootMargin: '100px' }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [isVisible])

  // 如果没有配置 Giscus，显示备用评论界面
  if (
    !siteConfig.giscus?.repo ||
    siteConfig.giscus.repo === 'your-username/your-repo'
  ) {
    return (
      <section className='mt-8'>
        <h3 className='heading-font text-base font-semibold mb-6 text-gray-900 dark:text-gray-100'>
          评论
        </h3>

        <div className='bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 text-center'>
          <p className='text-sm text-gray-600 dark:text-gray-400 mb-4'>
            评论功能尚未配置。
          </p>
          <div className='text-xs text-gray-500 dark:text-gray-500 space-y-1'>
            <p>要启用评论功能，请：</p>
            <p>1. 创建 GitHub 仓库并启用 Discussions</p>
            <p>
              2. 在{' '}
              <code className='bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded'>
                src/lib/config.ts
              </code>{' '}
              中配置 Giscus
            </p>
            <p>
              3. 访问{' '}
              <a
                href='https://giscus.app/zh-CN'
                target='_blank'
                rel='noopener noreferrer'
                className='elegant-link'
              >
                giscus.app
              </a>{' '}
              获取配置参数
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className='mt-8'>
      {/* 评论标题栏 */}
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-3'>
          <MessageCircle className='w-5 h-5 text-blue-600 dark:text-blue-400' />
          <h3 className='heading-font text-base font-semibold text-gray-900 dark:text-gray-100'>
            评论
            {stats && (
              <span className='ml-2 text-sm font-normal text-gray-500 dark:text-gray-400'>
                ({stats.count})
              </span>
            )}
          </h3>
        </div>

        <div className='flex items-center gap-2'>
          {!isVisible && (
            <button
              onClick={() => setIsVisible(true)}
              className='flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-md hover:border-gray-300 dark:hover:border-gray-600 transition-colors'
            >
              <Eye className='w-4 h-4' />
              加载评论
            </button>
          )}

          {isVisible && !isLoading && (
            <button
              onClick={() => {
                setIsVisible(false)
                if (ref.current) {
                  ref.current.innerHTML = ''
                }
              }}
              className='flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-md hover:border-gray-300 dark:hover:border-gray-600 transition-colors'
            >
              <EyeOff className='w-4 h-4' />
              隐藏评论
            </button>
          )}

          <a
            href={`https://github.com/${siteConfig.giscus?.repo}/discussions`}
            target='_blank'
            rel='noopener noreferrer'
            className='flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-md hover:border-gray-300 dark:hover:border-gray-600 transition-colors'
          >
            在GitHub讨论
            <ExternalLink className='w-3 h-3' />
          </a>
        </div>
      </div>

      {/* 评论内容区域 */}
      <div className='min-h-[200px] relative'>
        {/* 加载状态 */}
        {isVisible && isLoading && (
          <div className='flex items-center justify-center py-12'>
            <div className='flex items-center gap-3 text-gray-500 dark:text-gray-400'>
              <Loader2 className='w-5 h-5 animate-spin' />
              <span className='text-sm'>正在加载评论...</span>
            </div>
          </div>
        )}

        {/* 错误状态 */}
        {error && (
          <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4'>
            <div className='flex items-center gap-2 text-red-800 dark:text-red-200'>
              <MessageCircle className='w-4 h-4' />
              <span className='text-sm font-medium'>评论加载失败</span>
            </div>
            <p className='text-sm text-red-600 dark:text-red-300 mt-1'>
              {error}
            </p>
            <button
              onClick={() => setIsVisible(true)}
              className='text-sm text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100 mt-2 underline'
            >
              重试加载
            </button>
          </div>
        )}

        {/* 未加载状态提示 */}
        {!isVisible && (
          <div className='border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center'>
            <MessageCircle className='w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-3' />
            <p className='text-sm text-gray-600 dark:text-gray-400 mb-3'>
              点击&ldquo;加载评论&rdquo;来查看和参与讨论
            </p>
            <p className='text-xs text-gray-500 dark:text-gray-500'>
              评论将延迟加载以提升页面性能
            </p>
          </div>
        )}

        {/* Giscus 评论组件容器 */}
        <div
          ref={ref}
          className={`giscus-container transition-opacity duration-300 ${
            isLoading ? 'opacity-50' : 'opacity-100'
          }`}
          style={{
            minHeight: isVisible ? '300px' : '0px',
          }}
        />
      </div>

      {/* 底部信息栏 */}
      <div className='flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700'>
        <div className='flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500'>
          <span>
            评论由{' '}
            <a
              href='https://giscus.app/zh-CN'
              target='_blank'
              rel='noopener noreferrer'
              className='elegant-link'
            >
              Giscus
            </a>{' '}
            提供支持
          </span>
          {stats?.lastUpdated && (
            <span>
              最后更新:{' '}
              {new Date(stats.lastUpdated).toLocaleDateString('zh-CN')}
            </span>
          )}
        </div>

        <div className='text-xs text-gray-400 dark:text-gray-500'>
          需要 GitHub 账号参与讨论
        </div>
      </div>
    </section>
  )
}
