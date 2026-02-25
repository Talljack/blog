import { Metadata } from 'next'
import { Suspense } from 'react'
import SaveTweetClient from './SaveTweetClient'

export const metadata: Metadata = {
  title: '保存推文',
  description: '保存 X (Twitter) 推文到收藏',
}

export default function SaveTweetPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">加载中...</div>}>
      <SaveTweetClient />
    </Suspense>
  )
}
