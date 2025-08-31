'use client'

import { useState, useEffect } from 'react'

interface ReadingProgressProps {
  color?: string
  height?: number
  showOnScroll?: boolean
  className?: string
}

export default function ReadingProgress({
  color = '#3b82f6', // blue-500
  height = 3,
  showOnScroll = true,
  className = '',
}: ReadingProgressProps) {
  const [progress, setProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(!showOnScroll)

  useEffect(() => {
    const calculateProgress = () => {
      const winScroll =
        document.body.scrollTop || document.documentElement.scrollTop
      const height =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight
      const scrolled = (winScroll / height) * 100

      setProgress(Math.min(scrolled, 100))

      // 控制显示/隐藏
      if (showOnScroll) {
        setIsVisible(scrolled > 0)
      }
    }

    // 防抖处理
    let timeoutId: NodeJS.Timeout
    const handleScroll = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(calculateProgress, 10)
    }

    window.addEventListener('scroll', handleScroll)
    calculateProgress() // 初始计算

    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(timeoutId)
    }
  }, [showOnScroll])

  if (!isVisible) {
    return null
  }

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 ${className}`}
      style={{ height: `${height}px` }}
      role='progressbar'
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`阅读进度: ${Math.round(progress)}%`}
    >
      <div
        className='h-full transition-all duration-150 ease-out'
        style={{
          width: `${progress}%`,
          backgroundColor: color,
          boxShadow: `0 0 10px ${color}40`,
        }}
      />
    </div>
  )
}

// 圆形进度指示器
interface CircularReadingProgressProps {
  size?: number
  strokeWidth?: number
  color?: string
  backgroundColor?: string
  showPercentage?: boolean
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  className?: string
}

export function CircularReadingProgress({
  size = 60,
  strokeWidth = 4,
  color = '#3b82f6',
  backgroundColor = '#e5e7eb',
  showPercentage = false,
  position = 'top-right',
  className = '',
}: CircularReadingProgressProps) {
  const [progress, setProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (progress / 100) * circumference

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  }

  useEffect(() => {
    const calculateProgress = () => {
      const winScroll =
        document.body.scrollTop || document.documentElement.scrollTop
      const height =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight
      const scrolled = (winScroll / height) * 100

      setProgress(Math.min(scrolled, 100))
      setIsVisible(scrolled > 5) // 滚动超过5%时显示
    }

    let timeoutId: NodeJS.Timeout
    const handleScroll = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(calculateProgress, 16) // 60fps
    }

    window.addEventListener('scroll', handleScroll)
    calculateProgress()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(timeoutId)
    }
  }, [])

  if (!isVisible) {
    return null
  }

  return (
    <div
      className={`
        fixed z-40 
        ${positionClasses[position]}
        ${className}
      `}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className='transform -rotate-90'
        role='progressbar'
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`阅读进度: ${Math.round(progress)}%`}
      >
        {/* 背景圆 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill='transparent'
        />

        {/* 进度圆 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill='transparent'
          strokeLinecap='round'
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          className='transition-all duration-300 ease-out'
          style={{
            filter: `drop-shadow(0 0 6px ${color}40)`,
          }}
        />
      </svg>

      {/* 百分比文字 */}
      {showPercentage && (
        <div
          className='absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400'
          style={{ fontSize: `${size / 6}px` }}
        >
          {Math.round(progress)}%
        </div>
      )}
    </div>
  )
}
