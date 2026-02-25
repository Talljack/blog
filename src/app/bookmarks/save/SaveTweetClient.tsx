'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Bookmark, Copy, Check } from 'lucide-react'

function getAuthHeaders(): HeadersInit {
  const urlParams = new URLSearchParams(window.location.search)
  const username = urlParams.get('username')
  const password = urlParams.get('password')

  if (username && password) {
    const credentials = btoa(`${username}:${password}`)
    return { Authorization: `Basic ${credentials}` }
  }

  return {}
}

export default function SaveTweetClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlParam = searchParams.get('url')

  const [url, setUrl] = useState(urlParam || '')
  const [tags, setTags] = useState('')
  const [notes, setNotes] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [copiedBookmarklet, setCopiedBookmarklet] = useState(false)

  const bookmarkletCode = `javascript:(function(){const url=window.location.href;const match=url.match(/(?:twitter\\.com|x\\.com)\\/\\w+\\/status\\/\\d+/);if(!match){alert('请在 X (Twitter) 推文页面使用此书签');return;}window.open('${typeof window !== 'undefined' ? window.location.origin : 'https://talljack.me'}/bookmarks/save?url='+encodeURIComponent(url),'SaveTweet','width=500,height=700');})();`

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    try {
      const tagArray = tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0)

      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          url,
          tags: tagArray,
          notes,
          isPublic,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save bookmark')
      }

      setSuccess(true)
      setTimeout(() => {
        if (window.opener) {
          window.close()
        } else {
          router.push('/bookmarks')
        }
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save bookmark')
    } finally {
      setSaving(false)
    }
  }

  const handleCopyBookmarklet = () => {
    navigator.clipboard.writeText(bookmarkletCode)
    setCopiedBookmarklet(true)
    setTimeout(() => setCopiedBookmarklet(false), 2000)
  }

  if (success) {
    return (
      <div className='min-h-screen flex items-center justify-center p-4'>
        <div className='text-center'>
          <div className='inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4'>
            <Check className='h-8 w-8 text-green-600 dark:text-green-400' />
          </div>
          <h2 className='text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2'>
            保存成功！
          </h2>
          <p className='text-gray-600 dark:text-gray-400'>推文已添加到收藏</p>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen py-8 px-4'>
      <div className='max-w-2xl mx-auto'>
        <div className='bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6'>
          <div className='flex items-center mb-6'>
            <Bookmark className='h-6 w-6 text-blue-600 dark:text-blue-400 mr-2' />
            <h1 className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
              保存推文
            </h1>
          </div>

          {/* Bookmarklet Section */}
          {!urlParam && (
            <div className='mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
              <h3 className='text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2'>
                快速保存书签
              </h3>
              <p className='text-sm text-gray-600 dark:text-gray-400 mb-3'>
                拖拽下面的按钮到浏览器书签栏，在 X 推文页面点击即可快速保存
              </p>
              <div className='flex items-center space-x-2'>
                <a
                  href={bookmarkletCode}
                  className='inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium cursor-move'
                  onClick={e => e.preventDefault()}
                >
                  <Bookmark className='h-4 w-4 mr-2' />
                  保存到博客
                </a>
                <button
                  onClick={handleCopyBookmarklet}
                  className='inline-flex items-center justify-center min-h-[44px] min-w-[44px] px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 cursor-pointer'
                  title='复制书签代码'
                  aria-label={copiedBookmarklet ? '已复制' : '复制书签代码'}
                >
                  {copiedBookmarklet ? (
                    <Check className='h-4 w-4' />
                  ) : (
                    <Copy className='h-4 w-4' />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className='space-y-4'>
            {/* URL Input */}
            <div>
              <label
                htmlFor='url'
                className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
              >
                推文链接 *
              </label>
              <input
                type='url'
                id='url'
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder='https://x.com/username/status/123456789'
                required
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            {/* Tags Input */}
            <div>
              <label
                htmlFor='tags'
                className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
              >
                标签（用逗号分隔）
              </label>
              <input
                type='text'
                id='tags'
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder='例如: 技术, AI, 设计'
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            {/* Notes Textarea */}
            <div>
              <label
                htmlFor='notes'
                className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
              >
                笔记
              </label>
              <textarea
                id='notes'
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={4}
                placeholder='添加你的想法和笔记...'
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none'
              />
            </div>

            {/* Public Checkbox */}
            <div className='flex items-start'>
              <div className='flex items-center h-11'>
                <input
                  type='checkbox'
                  id='isPublic'
                  checked={isPublic}
                  onChange={e => setIsPublic(e.target.checked)}
                  className='h-5 w-5 text-blue-600 focus:ring-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 border-gray-300 rounded cursor-pointer'
                />
              </div>
              <label
                htmlFor='isPublic'
                className='ml-3 text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none'
              >
                公开显示（其他人可以在公开页面看到）
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div
                className='p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg'
                role='alert'
              >
                <p className='text-sm text-red-600 dark:text-red-400'>
                  {error}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className='flex items-center justify-end space-x-3 pt-4'>
              <button
                type='button'
                onClick={() =>
                  window.opener ? window.close() : router.push('/bookmarks')
                }
                className='min-h-[44px] px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 cursor-pointer'
              >
                取消
              </button>
              <button
                type='submit'
                disabled={saving}
                className='min-h-[44px] px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
                aria-busy={saving}
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
