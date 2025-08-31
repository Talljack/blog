'use client'

import { useState, useEffect } from 'react'
import { Sun, Moon, Type, Minus, Plus } from 'lucide-react'
import { useTheme } from 'next-themes'

interface ReadingModeProps {
  children: React.ReactNode
  className?: string
}

export default function ReadingMode({
  children,
  className = '',
}: ReadingModeProps) {
  const [isReadingMode, setIsReadingMode] = useState(false)
  const [fontSize, setFontSize] = useState(16)
  const [lineHeight, setLineHeight] = useState(1.6)
  const [maxWidth, setMaxWidth] = useState(65) // 字符数
  const { theme, setTheme } = useTheme()

  // 从localStorage恢复设置
  useEffect(() => {
    const savedSettings = localStorage.getItem('reading-preferences')
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      setFontSize(settings.fontSize || 16)
      setLineHeight(settings.lineHeight || 1.6)
      setMaxWidth(settings.maxWidth || 65)
      setIsReadingMode(settings.isReadingMode || false)
    }
  }, [])

  // 保存设置到localStorage
  const saveSettings = (newSettings: any) => {
    const settings = {
      fontSize,
      lineHeight,
      maxWidth,
      isReadingMode,
      ...newSettings,
    }
    localStorage.setItem('reading-preferences', JSON.stringify(settings))
  }

  // 调整字体大小
  const adjustFontSize = (delta: number) => {
    const newSize = Math.min(Math.max(fontSize + delta, 12), 24)
    setFontSize(newSize)
    saveSettings({ fontSize: newSize })
  }

  // 调整行高
  const adjustLineHeight = (delta: number) => {
    const newLineHeight = Math.min(Math.max(lineHeight + delta, 1.2), 2.0)
    setLineHeight(newLineHeight)
    saveSettings({ lineHeight: newLineHeight })
  }

  // 切换阅读模式
  const toggleReadingMode = () => {
    const newMode = !isReadingMode
    setIsReadingMode(newMode)
    saveSettings({ isReadingMode: newMode })
  }

  // 阅读模式样式
  const readingModeStyles = isReadingMode
    ? {
        fontSize: `${fontSize}px`,
        lineHeight: lineHeight.toString(),
        maxWidth: `${maxWidth}ch`,
        margin: '0 auto',
        padding: '2rem 1rem',
        backgroundColor: theme === 'dark' ? '#1f2937' : '#fefefe',
        color: theme === 'dark' ? '#f3f4f6' : '#1f2937',
      }
    : {}

  return (
    <>
      {/* 阅读模式控制面板 */}
      <div className='md:hidden fixed bottom-4 right-4 z-40'>
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700'>
          {/* 主控制按钮 */}
          <button
            onClick={toggleReadingMode}
            className={`
              w-12 h-12 rounded-lg flex items-center justify-center transition-colors
              ${
                isReadingMode
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }
            `}
            aria-label={isReadingMode ? '退出阅读模式' : '进入阅读模式'}
          >
            <Type className='w-5 h-5' />
          </button>

          {/* 展开的控制项 */}
          {isReadingMode && (
            <div className='absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 min-w-48'>
              {/* 字体大小 */}
              <div className='mb-3'>
                <div className='text-xs text-gray-600 dark:text-gray-400 mb-2'>
                  字体大小
                </div>
                <div className='flex items-center gap-2'>
                  <button
                    onClick={() => adjustFontSize(-1)}
                    className='w-8 h-8 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center'
                    disabled={fontSize <= 12}
                  >
                    <Minus className='w-4 h-4' />
                  </button>
                  <span className='text-sm min-w-8 text-center'>
                    {fontSize}px
                  </span>
                  <button
                    onClick={() => adjustFontSize(1)}
                    className='w-8 h-8 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center'
                    disabled={fontSize >= 24}
                  >
                    <Plus className='w-4 h-4' />
                  </button>
                </div>
              </div>

              {/* 行高 */}
              <div className='mb-3'>
                <div className='text-xs text-gray-600 dark:text-gray-400 mb-2'>
                  行高
                </div>
                <div className='flex items-center gap-2'>
                  <button
                    onClick={() => adjustLineHeight(-0.1)}
                    className='w-8 h-8 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center'
                    disabled={lineHeight <= 1.2}
                  >
                    <Minus className='w-4 h-4' />
                  </button>
                  <span className='text-sm min-w-8 text-center'>
                    {lineHeight.toFixed(1)}
                  </span>
                  <button
                    onClick={() => adjustLineHeight(0.1)}
                    className='w-8 h-8 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center'
                    disabled={lineHeight >= 2.0}
                  >
                    <Plus className='w-4 h-4' />
                  </button>
                </div>
              </div>

              {/* 主题切换 */}
              <div>
                <div className='text-xs text-gray-600 dark:text-gray-400 mb-2'>
                  主题
                </div>
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className='w-full flex items-center justify-center gap-2 p-2 rounded bg-gray-100 dark:bg-gray-700 transition-colors'
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className='w-4 h-4' />
                      <span className='text-sm'>浅色</span>
                    </>
                  ) : (
                    <>
                      <Moon className='w-4 h-4' />
                      <span className='text-sm'>深色</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 内容区域 */}
      <div
        className={`
          ${isReadingMode ? 'min-h-screen' : ''}
          ${className}
        `}
        style={readingModeStyles}
      >
        {children}
      </div>
    </>
  )
}

// 移动端优化的文章阅读器
interface MobileArticleReaderProps {
  title: string
  content: string
  publishDate: string
  readTime: number
  tags?: string[]
}

export function MobileArticleReader({
  title,
  content,
  publishDate,
  readTime,
  tags = [],
}: MobileArticleReaderProps) {
  const [showActions, setShowActions] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)

  // 检查是否已收藏
  useEffect(() => {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]')
    setIsBookmarked(bookmarks.includes(window.location.pathname))
  }, [])

  // 切换收藏状态
  const toggleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]')
    const currentPath = window.location.pathname

    if (isBookmarked) {
      const newBookmarks = bookmarks.filter(
        (path: string) => path !== currentPath
      )
      localStorage.setItem('bookmarks', JSON.stringify(newBookmarks))
    } else {
      bookmarks.push(currentPath)
      localStorage.setItem('bookmarks', JSON.stringify(bookmarks))
    }

    setIsBookmarked(!isBookmarked)
  }

  return (
    <div className='md:hidden'>
      {/* 移动端文章头部 */}
      <div className='sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-700 px-4 py-3'>
        <div className='flex items-center justify-between'>
          <button
            onClick={() => window.history.back()}
            className='text-blue-600 dark:text-blue-400 font-medium'
          >
            ← 返回
          </button>

          <div className='flex items-center gap-3'>
            <button
              onClick={toggleBookmark}
              className={`text-sm px-3 py-1 rounded-full transition-colors ${
                isBookmarked
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              {isBookmarked ? '★ 已收藏' : '☆ 收藏'}
            </button>

            <button
              onClick={() => setShowActions(!showActions)}
              className='text-gray-600 dark:text-gray-400'
            >
              ⋯
            </button>
          </div>
        </div>
      </div>

      {/* 操作面板 */}
      {showActions && (
        <div className='fixed inset-x-0 bottom-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4'>
          <div className='grid grid-cols-3 gap-3 mb-4'>
            <button className='flex flex-col items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700'>
              <span className='text-xl mb-1'>👍</span>
              <span className='text-xs text-gray-600 dark:text-gray-400'>
                点赞
              </span>
            </button>

            <button className='flex flex-col items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700'>
              <span className='text-xl mb-1'>💭</span>
              <span className='text-xs text-gray-600 dark:text-gray-400'>
                评论
              </span>
            </button>

            <button className='flex flex-col items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700'>
              <span className='text-xl mb-1'>📤</span>
              <span className='text-xs text-gray-600 dark:text-gray-400'>
                分享
              </span>
            </button>
          </div>

          <button
            onClick={() => setShowActions(false)}
            className='w-full py-2 text-center text-gray-500 border-t border-gray-200 dark:border-gray-700'
          >
            收起
          </button>
        </div>
      )}

      {/* 文章元信息 */}
      <div className='p-4 border-b border-gray-100 dark:border-gray-800'>
        <h1 className='text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 leading-tight'>
          {title}
        </h1>

        <div className='flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3'>
          <span>{publishDate}</span>
          <span>•</span>
          <span>{readTime} 分钟阅读</span>
        </div>

        {tags.length > 0 && (
          <div className='flex flex-wrap gap-2'>
            {tags.map(tag => (
              <span
                key={tag}
                className='px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full'
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 文章内容 */}
      <ReadingMode>
        <div
          className='prose prose-sm max-w-none px-4 py-6 dark:prose-invert
            prose-headings:text-gray-900 dark:prose-headings:text-gray-100
            prose-p:text-gray-700 dark:prose-p:text-gray-300
            prose-p:leading-relaxed
            prose-a:text-blue-600 dark:prose-a:text-blue-400
            prose-strong:text-gray-900 dark:prose-strong:text-gray-100
            prose-code:text-pink-600 dark:prose-code:text-pink-400
            prose-pre:bg-gray-50 dark:prose-pre:bg-gray-900
            prose-img:rounded-lg prose-img:shadow-md'
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </ReadingMode>
    </div>
  )
}
