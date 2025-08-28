'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button
        className='p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
        aria-label='切换主题'
      >
        <Sun className='w-4 h-4' />
      </button>
    )
  }

  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className='p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
      aria-label='切换主题'
    >
      {resolvedTheme === 'dark' ? (
        <Sun className='w-4 h-4 text-gray-600 dark:text-gray-400' />
      ) : (
        <Moon className='w-4 h-4 text-gray-600 dark:text-gray-400' />
      )}
    </button>
  )
}
