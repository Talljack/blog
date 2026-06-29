'use client'

import { useEffect, useEffectEvent, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import TweetCard from '@/components/TweetCard'
import TweetFilters from '@/components/TweetFilters'
import ConfirmDialog from '@/components/ConfirmDialog'
import StatusToast from '@/components/StatusToast'
import { Tweet } from '@/types/bookmarks'
import Link from 'next/link'
import { isAdmin, getAdminToken } from '@/lib/admin-token'

export default function PublicBookmarksClient() {
  const searchParams = useSearchParams()
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [admin, setAdmin] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [tweetPendingDelete, setTweetPendingDelete] = useState<Tweet | null>(
    null
  )
  const [isDeleting, setIsDeleting] = useState(false)
  const [toast, setToast] = useState<{
    message: string
    tone: 'success' | 'error'
  } | null>(null)

  const fetchTweets = useEffectEvent(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams(searchParams.toString())
      const headers: HeadersInit = {}

      if (admin && showAll) {
        // Admin viewing all bookmarks - send auth, don't filter by public
        const token = getAdminToken()
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }
      } else {
        params.set('public', 'true')
      }

      const response = await fetch(`/api/bookmarks?${params.toString()}`, {
        headers,
      })

      if (!response.ok) {
        throw new Error('Failed to fetch bookmarks')
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
      setError(err instanceof Error ? err.message : 'Failed to load bookmarks')
    } finally {
      setLoading(false)
    }
  })

  useEffect(() => {
    setAdmin(isAdmin())
  }, [])

  const showToast = (
    message: string,
    tone: 'success' | 'error' = 'success'
  ) => {
    setToast({ message, tone })
  }

  const handleDelete = (tweet: Tweet) => {
    setTweetPendingDelete(tweet)
  }

  const confirmDelete = async () => {
    if (!tweetPendingDelete) return
    try {
      setIsDeleting(true)
      const token = getAdminToken()
      const response = await fetch(`/api/bookmarks/${tweetPendingDelete.id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!response.ok) throw new Error('Failed to delete')
      setTweets(current =>
        current.filter(tweet => tweet.id !== tweetPendingDelete.id)
      )
      setTotal(current => Math.max(0, current - 1))
      setTweetPendingDelete(null)
      showToast(`已删除 @${tweetPendingDelete.authorUsername} 的收藏`)
    } catch (err) {
      showToast(
        '删除失败：' + (err instanceof Error ? err.message : '未知错误'),
        'error'
      )
    } finally {
      setIsDeleting(false)
    }
  }

  const handleTogglePublic = async (tweetId: string, isPublic: boolean) => {
    try {
      const token = getAdminToken()
      const response = await fetch(`/api/bookmarks/${tweetId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ isPublic }),
      })
      if (!response.ok) throw new Error('Failed to update')
      setTweets(current =>
        current.map(tweet =>
          tweet.id === tweetId ? { ...tweet, isPublic } : tweet
        )
      )
      showToast(isPublic ? '已设为公开显示' : '已改为私有')
    } catch (err) {
      showToast(
        '更新失败：' + (err instanceof Error ? err.message : '未知错误'),
        'error'
      )
    }
  }

  useEffect(() => {
    fetchTweets()
  }, [searchParams, showAll])

  if (error) {
    return (
      <div className='text-center py-12' role='alert'>
        <p className='text-red-600 dark:text-red-400'>{error}</p>
      </div>
    )
  }

  return (
    <>
      {/* Back Link & View Toggle */}
      <div className='mb-6 flex items-center justify-between'>
        <Link
          href='/bookmarks'
          className='text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
        >
          ← 返回所有收藏
        </Link>

        {admin && (
          <div className='inline-flex rounded-lg border border-gray-200 dark:border-gray-700 p-0.5'>
            <button
              onClick={() => setShowAll(true)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                showAll
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setShowAll(false)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                !showAll
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              仅公开
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <TweetFilters tags={tags} />

      {/* Stats */}
      <div className='mb-4 text-sm text-gray-600 dark:text-gray-400'>
        共 {total} 条{showAll ? '' : '公开'}推文
      </div>

      {/* Tweet List */}
      {loading ? (
        <div className='text-center py-12'>
          <div className='inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 dark:border-blue-400 border-r-transparent' />
          <p className='mt-4 text-gray-600 dark:text-gray-400'>加载中...</p>
        </div>
      ) : tweets.length === 0 ? (
        <div className='text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 p-8'>
          <svg
            className='mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
            aria-hidden='true'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={1.5}
              d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
            />
          </svg>
          <p className='text-gray-900 dark:text-gray-100 font-medium mb-1'>
            还没有公开的推文收藏
          </p>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            管理员还未分享任何推文
          </p>
        </div>
      ) : (
        <div className='space-y-0'>
          {tweets.map(tweet => (
            <TweetCard
              key={tweet.id}
              tweet={tweet}
              showActions={admin}
              onDelete={admin ? handleDelete : undefined}
              onTogglePublic={admin ? handleTogglePublic : undefined}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!tweetPendingDelete}
        title='删除这条收藏？'
        description={
          tweetPendingDelete
            ? `这会从公开收藏页移除 @${tweetPendingDelete.authorUsername} 的这条推文收藏。这个操作不能撤销。`
            : ''
        }
        confirmLabel='确认删除'
        cancelLabel='取消'
        tone='danger'
        pending={isDeleting}
        onCancel={() => {
          if (!isDeleting) {
            setTweetPendingDelete(null)
          }
        }}
        onConfirm={confirmDelete}
      />

      <StatusToast
        open={!!toast}
        message={toast?.message || ''}
        tone={toast?.tone || 'success'}
        onClose={() => setToast(null)}
      />
    </>
  )
}
