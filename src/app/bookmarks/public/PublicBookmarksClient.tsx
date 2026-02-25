'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import TweetCard from '@/components/TweetCard'
import TweetFilters from '@/components/TweetFilters'
import { Tweet } from '@/types/bookmarks'
import Link from 'next/link'

export default function PublicBookmarksClient() {
  const searchParams = useSearchParams()
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)

  const fetchTweets = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams(searchParams.toString())
      params.set('public', 'true')
      const response = await fetch(`/api/bookmarks?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Failed to fetch public bookmarks')
      }

      const result = await response.json()
      const data = result.data || result
      setTweets(data.tweets)
      setTotal(data.total)

      const allTags = new Set<string>()
      data.tweets.forEach((tweet: Tweet) => {
        tweet.tags.forEach((tag: string) => allTags.add(tag))
      })
      setTags(Array.from(allTags))
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load public bookmarks'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTweets()
  }, [searchParams])

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    )
  }

  return (
    <>
      {/* Back Link */}
      <div className="mb-6">
        <Link
          href="/bookmarks"
          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          ← 返回所有收藏
        </Link>
      </div>

      {/* Filters */}
      <TweetFilters tags={tags} />

      {/* Stats */}
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        共 {total} 条公开推文
      </div>

      {/* Tweet List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
      ) : tweets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            还没有公开的推文收藏
          </p>
        </div>
      ) : (
        <div className="space-y-0">
          {tweets.map((tweet) => (
            <TweetCard key={tweet.id} tweet={tweet} showActions={false} />
          ))}
        </div>
      )}
    </>
  )
}
