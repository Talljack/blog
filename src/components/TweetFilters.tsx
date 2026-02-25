'use client'

import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'

interface TweetFiltersProps {
  tags: string[]
}

export default function TweetFilters({ tags }: TweetFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const selectedTag = searchParams.get('tag') || ''

  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '')
  }, [searchParams])

  const debouncedSearch = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('q', value)
    } else {
      params.delete('q')
    }
    params.delete('page')
    router.push(`/bookmarks?${params.toString()}`)
  }, 500)

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    debouncedSearch(value)
  }

  const handleTagClick = (tag: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (selectedTag === tag) {
      params.delete('tag')
    } else {
      params.set('tag', tag)
    }
    params.delete('page')
    router.push(`/bookmarks?${params.toString()}`)
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    router.push('/bookmarks')
  }

  const hasActiveFilters = searchQuery || selectedTag

  return (
    <div className="space-y-4 mb-6">
      {/* Search Bar */}
      <div className="relative">
        <label htmlFor="bookmark-search" className="sr-only">
          搜索推文、标签或笔记
        </label>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
        <input
          type="text"
          id="bookmark-search"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="搜索推文、标签或笔记..."
          className="w-full pl-10 pr-4 py-3 min-h-[44px] border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent transition-colors duration-200"
          aria-label="搜索推文、标签或笔记"
        />
      </div>

      {/* Tags Filter */}
      {tags.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              标签筛选
            </h3>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                清除筛选
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={`inline-flex items-center px-4 py-2.5 min-h-[44px] rounded-full text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 cursor-pointer ${
                  selectedTag === tag
                    ? 'bg-blue-600 text-white dark:bg-blue-500'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
                aria-pressed={selectedTag === tag}
                aria-label={`筛选标签 ${tag}`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
