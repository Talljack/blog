'use client'

import { useState, useRef, useEffect } from 'react'
import { useDebounce } from 'use-debounce'
import { Search as SearchIcon, X } from 'lucide-react'
import Link from 'next/link'
import { BlogPostMeta } from '@/lib/blog'
import { Course } from '@/lib/courses'
import { Template } from '@/lib/templates'
import { formatDateChinese } from '@/lib/utils'

type SearchResult = (BlogPostMeta & { type: 'post' }) | (Course & { type: 'course' }) | (Template & { type: 'template' }) & {
  score?: number
  matches?: any[]
}

interface SearchProps {
  placeholder?: string
  className?: string
}

export default function Search({ placeholder = "搜索文章和课程...", className = "" }: SearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [posts, setPosts] = useState<SearchResult[]>([])
  const [courses, setCourses] = useState<SearchResult[]>([])
  const [templates, setTemplates] = useState<SearchResult[]>([])
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
        setPosts([])
        setCourses([])
        setTemplates([])
        setIsOpen(false)
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
        const data = await response.json()
        setResults(data.results || [])
        setPosts(data.posts || [])
        setCourses(data.courses || [])
        setTemplates(data.templates || [])
        setIsOpen(true)
      } catch (error) {
        console.error('Search failed:', error)
        setResults([])
        setPosts([])
        setCourses([])
        setTemplates([])
      } finally {
        setIsLoading(false)
      }
    }

    performSearch()
  }, [debouncedQuery])

  // 点击外部关闭搜索结果
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
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
    setPosts([])
    setCourses([])
    setTemplates([])
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const highlightMatch = (text: string, matches?: any[]) => {
    if (!matches || matches.length === 0) return text
    
    // 简单的高亮实现
    return text
  }

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* 搜索输入框 */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          className="w-full pl-10 pr-10 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 搜索结果 */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-[100] max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              搜索中...
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="p-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                找到 {results.length} 个结果
              </div>
              
              {/* 课程结果 */}
              {courses.length > 0 && (
                <>
                  <div className="p-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/30">
                    课程 ({courses.length})
                  </div>
                  {courses.map((course) => (
                    <Link
                      key={`course-${course.slug}`}
                      href={course.link}
                      onClick={() => setIsOpen(false)}
                      className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1 line-clamp-1">
                            {highlightMatch(course.title, course.matches)}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                            {highlightMatch(course.description, course.matches)}
                          </p>
                          <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-500">
                            <span>{course.duration}</span>
                            <span>·</span>
                            <span>{course.chapters}</span>
                            {course.tags.slice(0, 2).map((tag) => (
                              <span key={tag} className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="ml-3 text-lg">{course.icon}</div>
                      </div>
                    </Link>
                  ))}
                </>
              )}
              
              {/* 模板结果 */}
              {templates.length > 0 && (
                <>
                  <div className="p-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/30">
                    模板 ({templates.length})
                  </div>
                  {templates.map((template) => (
                    <Link
                      key={`template-${template.slug}`}
                      href={template.link}
                      target={template.link.startsWith('http') ? '_blank' : '_self'}
                      onClick={() => setIsOpen(false)}
                      className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1 line-clamp-1">
                            {highlightMatch(template.title, template.matches)}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                            {highlightMatch(template.description, template.matches)}
                          </p>
                          <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-500">
                            <span>⭐ {template.stars}</span>
                            <span>·</span>
                            <span>{template.language}</span>
                            <span>·</span>
                            <span>更新于 {template.updated}</span>
                            {template.tags.slice(0, 2).map((tag) => (
                              <span key={tag} className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        {template.link.startsWith('http') && (
                          <div className="ml-3 text-gray-400">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3m-2 16H5V5h7V3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7z"/>
                            </svg>
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </>
              )}

              {/* 文章结果 */}
              {posts.length > 0 && (
                <>
                  <div className="p-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/30">
                    文章 ({posts.length})
                  </div>
                  {posts.map((result) => (
                    <Link
                      key={`post-${result.slug}`}
                      href={`/blog/${result.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors"
                    >
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1 line-clamp-1">
                        {highlightMatch(result.title, result.matches)}
                      </h3>
                      {result.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                          {highlightMatch(result.description, result.matches)}
                        </p>
                      )}
                      <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-500">
                        <span>{formatDateChinese((result as any).date)}</span>
                        {(result as any).readTime && (
                          <>
                            <span>·</span>
                            <span>{(result as any).readTime} 分钟阅读</span>
                          </>
                        )}
                        {result.tags && result.tags.length > 0 && (
                          <>
                            <span>·</span>
                            <div className="flex items-center space-x-1">
                              {result.tags.slice(0, 2).map((tag) => (
                                <span
                                  key={tag}
                                  className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </Link>
                  ))}
                </>
              )}
            </>
          ) : query.trim().length >= 2 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              没有找到相关内容
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}