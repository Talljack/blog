'use client'

import Link from 'next/link'

interface LogoProps {
  className?: string
  size?: number
}

export default function Logo({ className = '', size = 32 }: LogoProps) {
  return (
    <Link href='/' className={`inline-flex items-center ${className}`}>
      <div className='relative group cursor-pointer'>
        <svg
          width={size}
          height={size}
          viewBox='0 0 32 32'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
          className='transition-transform duration-300 group-hover:scale-110'
        >
          {/* 外圈渐变背景 */}
          <defs>
            <linearGradient
              id='logoGradient'
              x1='0%'
              y1='0%'
              x2='100%'
              y2='100%'
            >
              <stop offset='0%' stopColor='#3B82F6' />
              <stop offset='50%' stopColor='#8B5CF6' />
              <stop offset='100%' stopColor='#EC4899' />
            </linearGradient>
            <filter id='glow'>
              <feGaussianBlur stdDeviation='2' result='coloredBlur' />
              <feMerge>
                <feMergeNode in='coloredBlur' />
                <feMergeNode in='SourceGraphic' />
              </feMerge>
            </filter>
          </defs>

          {/* 主要形状 - 现代化的代码符号 */}
          <circle
            cx='16'
            cy='16'
            r='14'
            fill='url(#logoGradient)'
            className='opacity-90 group-hover:opacity-100 transition-opacity'
            filter='url(#glow)'
          />

          {/* 内部代码符号 */}
          <g
            fill='white'
            className='group-hover:scale-110 transition-transform origin-center'
          >
            {/* 左括号 */}
            <path
              d='M10 9L7 12L10 15V13.5L8.5 12L10 10.5V9Z'
              strokeWidth='1.5'
              stroke='white'
              strokeLinecap='round'
              strokeLinejoin='round'
            />

            {/* 右括号 */}
            <path
              d='M22 9L25 12L22 15V13.5L23.5 12L22 10.5V9Z'
              strokeWidth='1.5'
              stroke='white'
              strokeLinecap='round'
              strokeLinejoin='round'
            />

            {/* 中间的斜杠和点 */}
            <line
              x1='13'
              y1='18'
              x2='19'
              y2='6'
              stroke='white'
              strokeWidth='2'
              strokeLinecap='round'
            />
            <circle cx='16' cy='20' r='1.5' fill='white' />
          </g>

          {/* 悬浮效果的小点 */}
          <circle
            cx='26'
            cy='8'
            r='2'
            fill='#10B981'
            className='opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse'
          />
          <circle
            cx='6'
            cy='26'
            r='1.5'
            fill='#F59E0B'
            className='opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-pulse'
          />
        </svg>

        {/* 悬浮时的发光效果 */}
        <div className='absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-300 -z-10' />
      </div>
    </Link>
  )
}
