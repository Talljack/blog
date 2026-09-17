'use client'

import Link from 'next/link'

interface LogoProps {
  className?: string
  size?: number
}

export default function Logo({ className = '', size = 32 }: LogoProps) {
  return (
    <Link
      href='/'
      aria-label='Talljack 首页'
      className={`group inline-flex items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 focus-visible:ring-offset-2 dark:ring-offset-stone-950 ${className}`}
    >
      <span
        aria-hidden='true'
        className='code-font inline-flex items-center justify-center rounded-md bg-lime-300 font-bold tracking-[-0.08em] text-stone-950 transition-transform duration-200 group-active:scale-95'
        style={{ width: size, height: size, fontSize: size * 0.37 }}
      >
        TJ/
      </span>
    </Link>
  )
}
