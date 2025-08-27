import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import { getAllPosts, getAllTags } from '@/lib/blog'
import BlogCard from '@/components/BlogCard'
import { ArrowLeft } from 'lucide-react'

interface TagPageProps {
  params: Promise<{
    tag: string
  }>
}

export async function generateStaticParams() {
  const tags = await getAllTags()
  return tags.map((tag) => ({
    tag: tag,
  }))
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { tag } = await params
  const decodedTag = decodeURIComponent(tag)
  
  return {
    title: `标签: ${decodedTag}`,
    description: `查看所有标记为 "${decodedTag}" 的文章`,
    openGraph: {
      title: `标签: ${decodedTag}`,
      description: `查看所有标记为 "${decodedTag}" 的文章`,
      type: 'website',
    },
  }
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag } = await params
  const decodedTag = decodeURIComponent(tag)
  
  // 获取所有文章
  const allPosts = await getAllPosts()
  
  // 筛选包含该标签的文章
  const filteredPosts = allPosts.filter(post => 
    post.tags && post.tags.includes(decodedTag)
  )

  // 如果没有找到相关文章，显示404
  if (filteredPosts.length === 0) {
    notFound()
  }

  return (
    <main className="max-w-2xl mx-auto px-6 pb-16">
      {/* 返回链接 */}
      <div className="mb-8">
        <Link
          href="/blog"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-0.5 transition-transform" />
          返回博客
        </Link>
      </div>

      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="heading-font text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
          标签: {decodedTag}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          共 {filteredPosts.length} 篇文章
        </p>
      </div>

      {/* 文章列表 */}
      <section>
        <div className="space-y-0">
          {filteredPosts.map((post) => (
            <BlogCard 
              key={post.slug} 
              post={post} 
              showDescription={true} 
            />
          ))}
        </div>
      </section>

      {/* 相关标签推荐 */}
      <aside className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
        <h2 className="heading-font text-base font-medium mb-4 text-gray-900 dark:text-gray-100">
          相关标签
        </h2>
        <div className="flex flex-wrap gap-2">
          {/* 获取其他标签（从当前标签的文章中） */}
          {Array.from(new Set(
            filteredPosts
              .flatMap(post => post.tags || [])
              .filter(t => t !== decodedTag)
          )).slice(0, 8).map((relatedTag) => (
            <Link
              key={relatedTag}
              href={`/tag/${encodeURIComponent(relatedTag)}`}
              className="inline-block text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {relatedTag}
            </Link>
          ))}
        </div>
      </aside>
    </main>
  )
}