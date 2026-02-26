'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import TweetCard from '@/components/TweetCard'
import TweetFilters from '@/components/TweetFilters'
import EditTweetModal from '@/components/EditTweetModal'
import { Tweet } from '@/types/bookmarks'
import { Download, Plus } from 'lucide-react'
import Link from 'next/link'
import { getAdminToken, isAdmin } from '@/lib/admin-token'

function getAuthHeaders(): HeadersInit {
  const token = getAdminToken()
  if (token) {
    return { Authorization: `Bearer ${token}` }
  }
  return {}
}

export default function BookmarksClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingTweet, setEditingTweet] = useState<Tweet | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [admin, setAdmin] = useState(false)

  useEffect(() => {
    setAdmin(isAdmin())
  }, [])

  const fetchTweets = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams(searchParams.toString())
      const response = await fetch(`/api/bookmarks?${params.toString()}`, {
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch bookmarks')
      }

      const result = await response.json()
      const data = result.data || result
      setTweets(data.tweets)
      setTotal(data.total)
      setPage(data.page)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookmarks')
    } finally {
      setLoading(false)
    }
  }

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/bookmarks/tags', {
        headers: getAuthHeaders(),
      })
      if (response.ok) {
        const result = await response.json()
        const data = result.data || result
        setTags(data.tags)
      }
    } catch (err) {
      console.error('Failed to fetch tags:', err)
    }
  }

  useEffect(() => {
    fetchTweets()
    fetchTags()
  }, [searchParams])

  const handleDelete = async (tweetId: string) => {
    if (!confirm('确定要删除这条推文收藏吗？')) {
      return
    }

    try {
      const response = await fetch(`/api/bookmarks/${tweetId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error('Failed to delete bookmark')
      }

      setTweets(tweets.filter(t => t.id !== tweetId))
      setTotal(total - 1)
    } catch (err) {
      alert('删除失败：' + (err instanceof Error ? err.message : '未知错误'))
    }
  }

  const handleEdit = (tweet: Tweet) => {
    setEditingTweet(tweet)
  }

  const handleSaveEdit = async (
    tweetId: string,
    updates: { tags?: string[]; notes?: string; isPublic?: boolean }
  ) => {
    try {
      const response = await fetch(`/api/bookmarks/${tweetId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error('Failed to update bookmark')
      }

      const result = await response.json()
      const updatedTweet = result.data || result
      setTweets(tweets.map(t => (t.id === tweetId ? updatedTweet : t)))
      setEditingTweet(null)
      fetchTags()
    } catch (err) {
      alert('更新失败：' + (err instanceof Error ? err.message : '未知错误'))
    }
  }

  const handleExport = async (format: 'json' | 'markdown') => {
    try {
      const response = await fetch(`/api/bookmarks/export?format=${format}`, {
        headers: getAuthHeaders(),
      })
      if (!response.ok) {
        throw new Error('Failed to export bookmarks')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bookmarks-${new Date().toISOString().split('T')[0]}.${format === 'json' ? 'json' : 'md'}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      alert('导出失败：' + (err instanceof Error ? err.message : '未知错误'))
    }
  }

  if (error) {
    return (
      <div className='text-center py-12' role='alert'>
        <p className='text-red-600 dark:text-red-400'>{error}</p>
      </div>
    )
  }

  return (
    <>
      {/* Actions Bar */}
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center space-x-2'>
          {admin && (
            <Link
              href='/bookmarks/save'
              className='inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium'
            >
              <Plus className='h-4 w-4 mr-2' />
              添加推文
            </Link>
          )}
        </div>

        {admin && (
          <div className='flex items-center space-x-2'>
            <button
              onClick={() => handleExport('json')}
              className='inline-flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-sm'
            >
              <Download className='h-4 w-4 mr-2' />
              JSON
            </button>
            <button
              onClick={() => handleExport('markdown')}
              className='inline-flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-sm'
            >
              <Download className='h-4 w-4 mr-2' />
              Markdown
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <TweetFilters tags={tags} />

      {/* Stats */}
      <div className='mb-4 text-sm text-gray-600 dark:text-gray-400'>
        共 {total} 条推文收藏
      </div>

      {/* Tweet List */}
      {loading ? (
        <div className='text-center py-12'>
          <div className='inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent' />
          <p className='mt-4 text-gray-600 dark:text-gray-400'>加载中...</p>
        </div>
      ) : tweets.length === 0 ? (
        <div className='text-center py-12'>
          <p className='text-gray-600 dark:text-gray-400'>还没有收藏任何推文</p>
          {admin && (
            <Link
              href='/bookmarks/save'
              className='inline-block mt-4 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
            >
              开始添加 →
            </Link>
          )}
        </div>
      ) : (
        <div className='space-y-0'>
          {tweets.map(tweet => (
            <TweetCard
              key={tweet.id}
              tweet={tweet}
              showActions={admin}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingTweet && (
        <EditTweetModal
          tweet={editingTweet}
          onClose={() => setEditingTweet(null)}
          onSave={handleSaveEdit}
        />
      )}

      {/* Pagination */}
      {total > limit && (
        <div className='flex items-center justify-center space-x-4 mt-8 pt-4 border-t border-gray-200 dark:border-gray-700'>
          <button
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString())
              params.set('page', String(page - 1))
              router.push(`/bookmarks?${params.toString()}`)
            }}
            disabled={page <= 1}
            className='px-4 py-2 min-h-[44px] text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer'
          >
            上一页
          </button>
          <span className='text-sm text-gray-600 dark:text-gray-400'>
            第 {page} / {Math.ceil(total / limit)} 页
          </span>
          <button
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString())
              params.set('page', String(page + 1))
              router.push(`/bookmarks?${params.toString()}`)
            }}
            disabled={page >= Math.ceil(total / limit)}
            className='px-4 py-2 min-h-[44px] text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer'
          >
            下一页
          </button>
        </div>
      )}
    </>
  )
}
