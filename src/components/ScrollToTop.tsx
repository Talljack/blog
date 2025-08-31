'use client'

import { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'

interface ScrollToTopProps {
  threshold?: number
  smooth?: boolean
  className?: string
}

export default function ScrollToTop({
  threshold = 400,
  smooth = true,
  className = '',
}: ScrollToTopProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      // 显示按钮条件：滚动超过阈值
      if (window.pageYOffset > threshold) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    // 防抖处理，避免频繁触发
    let timeoutId: NodeJS.Timeout
    const handleScroll = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(toggleVisibility, 100)
    }

    window.addEventListener('scroll', handleScroll)

    // 初始检查
    toggleVisibility()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(timeoutId)
    }
  }, [threshold])

  const scrollToTop = () => {
    if (smooth) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    } else {
      window.scrollTo(0, 0)
    }
  }

  if (!isVisible) {
    return null
  }

  return (
    <button
      onClick={scrollToTop}
      className={`
        fixed bottom-8 right-8 z-50
        w-12 h-12
        bg-blue-600 hover:bg-blue-700 
        dark:bg-blue-500 dark:hover:bg-blue-600
        text-white rounded-full
        shadow-lg hover:shadow-xl
        transition-all duration-300 ease-in-out
        transform hover:scale-110
        focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800
        md:bottom-8 md:right-8
        sm:bottom-6 sm:right-6
        ${className}
      `}
      aria-label='回到顶部'
      title='回到顶部'
    >
      <ArrowUp className='w-6 h-6 mx-auto' />
    </button>
  )
}

// 扩展版本：带进度指示器
interface ScrollProgressProps extends ScrollToTopProps {
  showProgress?: boolean
  progressColor?: string
}

export function ScrollToTopWithProgress({
  threshold = 400,
  smooth = true,
  className = '',
  showProgress = true,
  progressColor = 'rgb(37, 99, 235)', // blue-600
}: ScrollProgressProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.pageYOffset
      const documentHeight =
        document.documentElement.scrollHeight - window.innerHeight

      // 计算滚动进度
      const progress = (currentScroll / documentHeight) * 100
      setScrollProgress(Math.min(progress, 100))

      // 显示/隐藏按钮
      setIsVisible(currentScroll > threshold)
    }

    let timeoutId: NodeJS.Timeout
    const debouncedHandleScroll = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(handleScroll, 50)
    }

    window.addEventListener('scroll', debouncedHandleScroll)
    handleScroll() // 初始检查

    return () => {
      window.removeEventListener('scroll', debouncedHandleScroll)
      clearTimeout(timeoutId)
    }
  }, [threshold])

  const scrollToTop = () => {
    if (smooth) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    } else {
      window.scrollTo(0, 0)
    }
  }

  if (!isVisible) {
    return null
  }

  return (
    <button
      onClick={scrollToTop}
      className={`
        fixed bottom-8 right-8 z-50
        w-14 h-14
        bg-white dark:bg-gray-800
        border-2 border-gray-200 dark:border-gray-700
        hover:border-blue-500 dark:hover:border-blue-400
        text-gray-600 dark:text-gray-400
        hover:text-blue-600 dark:hover:text-blue-400
        rounded-full
        shadow-lg hover:shadow-xl
        transition-all duration-300 ease-in-out
        transform hover:scale-110
        focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800
        relative overflow-hidden
        md:bottom-8 md:right-8
        sm:bottom-6 sm:right-6
        ${className}
      `}
      aria-label={`回到顶部 (${Math.round(scrollProgress)}%)`}
      title={`回到顶部 - 已阅读 ${Math.round(scrollProgress)}%`}
    >
      {/* 进度环 */}
      {showProgress && (
        <svg
          className='absolute inset-0 w-full h-full -rotate-90'
          viewBox='0 0 56 56'
        >
          <circle
            cx='28'
            cy='28'
            r='25'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            className='text-gray-200 dark:text-gray-600'
          />
          <circle
            cx='28'
            cy='28'
            r='25'
            fill='none'
            stroke={progressColor}
            strokeWidth='3'
            strokeLinecap='round'
            strokeDasharray={`${2 * Math.PI * 25}`}
            strokeDashoffset={`${2 * Math.PI * 25 * (1 - scrollProgress / 100)}`}
            className='transition-all duration-300'
          />
        </svg>
      )}

      {/* 箭头图标 */}
      <ArrowUp className='w-6 h-6 relative z-10' />
    </button>
  )
}
