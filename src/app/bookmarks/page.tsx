import { Suspense } from 'react'
import { Metadata } from 'next'
import BookmarksClient from './BookmarksClient'

export const metadata: Metadata = {
  title: 'X 推文收藏',
  description: '我收藏的 X (Twitter) 推文',
}

export default function BookmarksPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            X 推文收藏
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            我在 X 上收藏的推文和灵感
          </p>
        </div>

        <Suspense
          fallback={
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                加载中...
              </p>
            </div>
          }
        >
          <BookmarksClient />
        </Suspense>
      </div>
    </div>
  )
}
