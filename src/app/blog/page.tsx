import BlogCard from '@/components/BlogCard'
import TagCloud from '@/components/TagCloud'
import { getAllPosts, getAllTags } from '@/lib/blog'

export const metadata = {
  title: '博客',
  description: '所有博客文章',
}

export default async function BlogPage() {
  const [allPosts, allTags] = await Promise.all([getAllPosts(), getAllTags()])

  return (
    <main className='max-w-2xl mx-auto px-6 pb-16'>
      {/* 页面标题和描述 - 简洁版本 */}
      <div className='mb-8'>
        <h1 className='heading-font text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100'>
          博客
        </h1>
        <p className='text-sm text-gray-600 dark:text-gray-400'>
          共 {allPosts.length} 篇文章
        </p>
      </div>

      {/* 标签云 */}
      <div className='mb-8 pb-8 border-b border-gray-200 dark:border-gray-800'>
        <h2 className='heading-font text-sm font-medium mb-4 text-gray-900 dark:text-gray-100'>
          标签
        </h2>
        <TagCloud maxTags={15} />
      </div>

      {/* 文章列表 */}
      {allPosts.length > 0 ? (
        <section>
          <div className='space-y-0'>
            {allPosts.map(post => (
              <BlogCard key={post.slug} post={post} showDescription={true} />
            ))}
          </div>
        </section>
      ) : (
        <section className='text-center py-16'>
          <div className='space-y-4'>
            <h2 className='heading-font text-lg font-medium text-gray-900 dark:text-gray-100'>
              还没有文章
            </h2>
            <p className='text-gray-600 dark:text-gray-400 text-sm leading-relaxed max-w-md mx-auto'>
              这里将展示所有的博客文章。请稍后再来查看精彩内容。
            </p>
          </div>
        </section>
      )}

      {/* 文章统计 */}
      {allPosts.length > 0 && (
        <div className='mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 text-center'>
          <p className='text-xs text-gray-500 dark:text-gray-500'>
            共 {allPosts.length} 篇文章 · {allTags.length} 个标签
          </p>
        </div>
      )}
    </main>
  )
}
