'use client'

import { useState, useEffect, useRef } from 'react'
import { Tweet } from '@/types/bookmarks'
import { X } from 'lucide-react'

interface EditTweetModalProps {
  tweet: Tweet
  onClose: () => void
  onSave: (
    tweetId: string,
    updates: { tags?: string[]; notes?: string; isPublic?: boolean }
  ) => Promise<void>
}

export default function EditTweetModal({
  tweet,
  onClose,
  onSave,
}: EditTweetModalProps) {
  const [tags, setTags] = useState(tweet.tags.join(', '))
  const [notes, setNotes] = useState(tweet.notes)
  const [isPublic, setIsPublic] = useState(tweet.isPublic)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    modalRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const tagArray = tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0)

      await onSave(tweet.id, {
        tags: tagArray,
        notes,
        isPublic,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败，请重试')
      setSaving(false)
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-modal-title"
    >
      <div 
        ref={modalRef}
        className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto focus:outline-none"
        tabIndex={-1}
      >
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
          <h2 id="edit-modal-title" className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            编辑推文收藏
          </h2>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded cursor-pointer"
            aria-label="关闭对话框"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Tweet Preview */}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <a
              href={tweet.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              @{tweet.authorUsername} 的推文
            </a>
          </div>

          {/* Tags Input */}
          <div>
            <label
              htmlFor="tags"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              标签（用逗号分隔）
            </label>
            <input
              type="text"
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="例如: 技术, AI, 设计"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Notes Textarea */}
          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              笔记
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="添加你的想法和笔记..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Public Checkbox */}
          <div className="flex items-start">
            <div className="flex items-center h-11">
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 border-gray-300 rounded cursor-pointer"
              />
            </div>
            <label
              htmlFor="isPublic"
              className="ml-3 text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none"
            >
              公开显示（其他人可以在公开页面看到）
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg" role="alert">
              <p className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={saving}
              className="min-h-[44px] px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              aria-busy={saving}
            >
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
