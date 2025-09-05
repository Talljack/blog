import BlogCard from '@/components/BlogCard'
import Newsletter from '@/components/Newsletter'
import { getAllPosts, getFeaturedPosts } from '@/lib/blog'

export default async function HomePage() {
  const [allPosts, featuredPosts] = await Promise.all([
    getAllPosts(),
    getFeaturedPosts(),
  ])

  const recentPosts = allPosts.slice(0, 10) // 显示更多文章，如参考网站

  return (
    <main className='max-w-4xl mx-auto px-6 pb-16'>
      {/* 推荐阅读部分 - 完全按照参考网站 */}
      {featuredPosts.length > 0 && (
        <section className='mb-8'>
          <h2 className='heading-font text-base font-medium mb-4 text-gray-900 dark:text-gray-100'>
            推荐阅读
          </h2>

          <div className='space-y-0'>
            {featuredPosts.map(post => (
              <BlogCard key={post.slug} post={post} showDescription={true} />
            ))}
          </div>
        </section>
      )}

      {/* 最近文章部分 - 如果有推荐文章，则不显示标题 */}
      <section className='mb-8'>
        <div className='space-y-0'>
          {recentPosts
            .filter(post => !post.featured) // 排除已在推荐区域显示的文章
            .map(post => (
              <BlogCard key={post.slug} post={post} showDescription={true} />
            ))}
        </div>
      </section>

      {/* Newsletter 订阅部分 */}
      <section>
        <Newsletter
          variant='card'
          title='📧 订阅我的博客'
          description='第一时间获取最新技术文章和深度思考，不定期发送，绝不骚扰。'
        />
      </section>

      {/* 如果没有文章，显示友好提示 */}
      {allPosts.length === 0 && (
        <section className='text-center py-12'>
          <div className='space-y-4'>
            <h2 className='heading-font text-lg font-medium text-gray-900 dark:text-gray-100'>
              还没有文章
            </h2>
            <p className='text-gray-600 dark:text-gray-400 text-sm leading-relaxed max-w-md mx-auto'>
              欢迎来到我的博客！我正在准备一些精彩的内容，请稍后再来查看。
            </p>
            <div className='pt-4'>
              <p className='text-xs text-gray-500 dark:text-gray-500'>
                文章存放在{' '}
                <code className='bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-xs'>
                  src/content/blog
                </code>{' '}
                目录
              </p>
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
