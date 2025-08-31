'use client'

import { useState } from 'react'
import { Share2, Copy, Check, MessageCircle } from 'lucide-react'
import type { ShareData, SharePlatform } from '@/types/blog'

interface ShareButtonsProps {
  title: string
  url: string
  description?: string
  image?: string
  className?: string
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function ShareButtons({
  title,
  url,
  description = '',
  image,
  className = '',
  showLabel = true,
  size = 'md',
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const shareData: ShareData = {
    title,
    url,
    description,
    image,
  }

  // 分享平台配置
  const platforms: SharePlatform[] = [
    {
      name: '微信',
      icon: '💬',
      color: '#07C160',
      url: data =>
        `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data.url)}`,
    },
    {
      name: '微博',
      icon: '📱',
      color: '#E6162D',
      url: data =>
        `https://service.weibo.com/share/share.php?url=${encodeURIComponent(data.url)}&title=${encodeURIComponent(data.title + ' - ' + (data.description || ''))}`,
    },
    {
      name: 'Twitter',
      icon: '🐦',
      color: '#1DA1F2',
      url: data =>
        `https://twitter.com/intent/tweet?url=${encodeURIComponent(data.url)}&text=${encodeURIComponent(data.title)}&hashtags=blog,tech`,
    },
    {
      name: 'LinkedIn',
      icon: '💼',
      color: '#0077B5',
      url: data =>
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(data.url)}`,
    },
    {
      name: 'Telegram',
      icon: '✈️',
      color: '#0088cc',
      url: data =>
        `https://t.me/share/url?url=${encodeURIComponent(data.url)}&text=${encodeURIComponent(data.title)}`,
    },
  ]

  // 复制链接到剪贴板
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('复制失败:', error)
      // 降级方案
      const textArea = document.createElement('textarea')
      textArea.value = url
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // 原生分享API
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        })
      } catch (error) {
        console.error('分享失败:', error)
      }
    }
  }

  // 微信分享（显示二维码）
  const handleWeChatShare = () => {
    const qrUrl = platforms[0].url(shareData)
    // 创建模态框显示二维码
    const modal = document.createElement('div')
    modal.className =
      'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'
    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-sm mx-4">
        <div class="text-center">
          <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">微信扫码分享</h3>
          <img src="${qrUrl}" alt="微信分享二维码" class="mx-auto mb-4 rounded" />
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">使用微信扫描二维码分享</p>
          <button class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
            关闭
          </button>
        </div>
      </div>
    `

    document.body.appendChild(modal)
    modal.addEventListener('click', e => {
      if (
        e.target === modal ||
        (e.target as HTMLElement).tagName === 'BUTTON'
      ) {
        document.body.removeChild(modal)
      }
    })
  }

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
  }

  return (
    <div className={`relative ${className}`}>
      {/* 主分享按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          ${sizeClasses[size]}
          bg-blue-600 hover:bg-blue-700 
          text-white rounded-full
          shadow-lg hover:shadow-xl
          transition-all duration-300
          flex items-center justify-center
          focus:outline-none focus:ring-4 focus:ring-blue-300
        `}
        aria-label='分享文章'
        title='分享文章'
      >
        <Share2
          className={`${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'}`}
        />
      </button>

      {/* 分享选项 */}
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <div
            className='fixed inset-0 z-40'
            onClick={() => setIsOpen(false)}
          />

          {/* 分享面板 */}
          <div className='absolute bottom-full right-0 mb-2 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 min-w-72'>
            <div className='text-sm font-medium text-gray-900 dark:text-gray-100 mb-3'>
              分享到
            </div>

            {/* 平台按钮网格 */}
            <div className='grid grid-cols-3 gap-3 mb-3'>
              {platforms.map(platform => (
                <button
                  key={platform.name}
                  onClick={() => {
                    if (platform.name === '微信') {
                      handleWeChatShare()
                    } else {
                      window.open(
                        platform.url(shareData),
                        '_blank',
                        'noopener,noreferrer'
                      )
                    }
                    setIsOpen(false)
                  }}
                  className='flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
                  title={`分享到${platform.name}`}
                >
                  <div
                    className='w-10 h-10 rounded-full flex items-center justify-center mb-1 text-lg'
                    style={{ backgroundColor: `${platform.color}20` }}
                  >
                    {platform.icon}
                  </div>
                  <span className='text-xs text-gray-600 dark:text-gray-400'>
                    {platform.name}
                  </span>
                </button>
              ))}
            </div>

            {/* 分割线 */}
            <div className='border-t border-gray-200 dark:border-gray-700 my-3' />

            {/* 复制链接和原生分享 */}
            <div className='space-y-2'>
              <button
                onClick={copyToClipboard}
                className='w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
              >
                {copied ? (
                  <Check className='w-4 h-4 text-green-600' />
                ) : (
                  <Copy className='w-4 h-4 text-gray-500' />
                )}
                <span className='text-sm text-gray-700 dark:text-gray-300'>
                  {copied ? '已复制链接' : '复制链接'}
                </span>
              </button>

              {/* 原生分享API */}
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  onClick={handleNativeShare}
                  className='w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
                >
                  <Share2 className='w-4 h-4 text-gray-500' />
                  <span className='text-sm text-gray-700 dark:text-gray-300'>
                    更多分享选项
                  </span>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// 简化版行内分享按钮
interface InlineShareProps {
  title: string
  url: string
  className?: string
}

export function InlineShare({ title, url, className = '' }: InlineShareProps) {
  const [copied, setCopied] = useState(false)

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('复制失败:', error)
    }
  }

  const shareToWeibo = () => {
    window.open(
      `https://service.weibo.com/share/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
      '_blank',
      'noopener,noreferrer'
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className='text-sm text-gray-600 dark:text-gray-400'>分享:</span>

      <button
        onClick={shareToWeibo}
        className='text-sm text-blue-600 dark:text-blue-400 hover:underline'
        title='分享到微博'
      >
        微博
      </button>

      <span className='text-gray-300'>•</span>

      <button
        onClick={copyLink}
        className='text-sm text-blue-600 dark:text-blue-400 hover:underline'
        title='复制链接'
      >
        {copied ? '已复制' : '复制链接'}
      </button>
    </div>
  )
}

// 评论区分享组件
interface CommentShareProps {
  title: string
  url: string
}

export function CommentShare({ title, url }: CommentShareProps) {
  const openCommentShare = () => {
    const text = `推荐阅读：${title} ${url}`
    const shareUrl = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`
    window.open(shareUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <button
      onClick={openCommentShare}
      className='inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline'
      title='分享并评论'
    >
      <MessageCircle className='w-4 h-4' />
      分享并评论
    </button>
  )
}
