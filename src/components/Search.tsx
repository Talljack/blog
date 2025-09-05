'use client'

import { BlogPostMeta } from '@/lib/blog'
import { Course } from '@/lib/courses'
import { Template } from '@/lib/templates'
import { formatDateChinese } from '@/lib/utils'
import { Search as SearchIcon, X } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useDebounce } from 'use-debounce'

type SearchResult =
  | (BlogPostMeta & { type: 'post' })
  | (Course & { type: 'course' })
  | ((Template & { type: 'template' }) & {
      score?: number
      matches?: any[]
    })

interface SearchProps {
  placeholder?: string
  className?: string
}

export default function Search({
  placeholder = '搜索博客和课程...',
  className = '',
}: SearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [debouncedQuery] = useDebounce(query, 300)

  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 执行搜索
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedQuery.trim().length < 2) {
        setResults([])
        setIsOpen(false)
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(debouncedQuery)}&type=all`
        )
        const data = await response.json()

        if (data.results) {
          setResults(data.results)
        } else {
          setResults([])
        }
        setIsOpen(true)
      } catch (error) {
        console.error('Search failed:', error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    performSearch()
  }, [debouncedQuery])

  // 点击外部关闭搜索结果
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        inputRef.current?.blur()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const clearSearch = () => {
    setQuery('')
    setResults([])
    setIsOpen(false)
    inputRef.current?.focus()
  }

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* 搜索输入框 */}
      <div className='relative'>
        <SearchIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
        <input
          ref={inputRef}
          type='text'
          placeholder={placeholder}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          className='w-full pl-10 pr-10 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors'
        />
        {query && (
          <button
            onClick={clearSearch}
            className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
          >
            <X className='w-4 h-4' />
          </button>
        )}
      </div>

      {/* 搜索结果 */}
      {isOpen && (
        <div className='absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-[100] max-h-80 overflow-hidden min-w-[500px]'>
          {isLoading ? (
            <div className='p-4 text-center'>
              <div className='flex items-center justify-center space-x-2 text-gray-500 dark:text-gray-400'>
                <div className='w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin' />
                <span className='text-sm'>搜索中...</span>
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className='overflow-y-auto max-h-80'>
              {results
                .filter(result => (result as any).type !== 'tag') // 过滤掉标签类型
                .map((result, index) => {
                  // 确定结果类型和链接
                  const isPost = result.type === 'post'
                  const isCourse = result.type === 'course'
                  const isTemplate = result.type === 'template'

                  const href = isPost
                    ? `/blog/${result.slug}`
                    : isCourse
                      ? `/course/${result.slug}`
                      : `/template/${result.slug}`

                  const icon = isPost ? '📝' : isCourse ? '📚' : '🚀'
                  const typeLabel = isPost ? '文章' : isCourse ? '课程' : '模板'

                  return (
                    <Link
                      key={`${result.type}-${result.slug || result.title}-${index}`}
                      href={href}
                      onClick={() => setIsOpen(false)}
                      className='flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors'
                    >
                      <span className='mr-3 text-lg flex-shrink-0'>{icon}</span>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-start space-x-2'>
                          <h3 className='font-medium text-gray-900 dark:text-gray-100 flex-1 leading-relaxed'>
                            {result.title}
                          </h3>
                          <span className='px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded flex-shrink-0 mt-0.5'>
                            {typeLabel}
                          </span>
                        </div>
                        {/* 只有当有匹配内容且不是标题匹配时才显示描述 */}
                        {result.description && (result as any).matches && (
                          <p
                            className='text-sm text-gray-600 dark:text-gray-400 truncate mt-1'
                            dangerouslySetInnerHTML={{
                              __html: result.description,
                            }}
                          />
                        )}
                      </div>
                    </Link>
                  )
                })}
            </div>
          ) : query.trim().length >= 2 ? (
            <div className='p-4 text-center text-gray-500 dark:text-gray-400 text-sm'>
              没有找到相关内容
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
