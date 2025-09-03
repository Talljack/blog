import Link from 'next/link'
import { BlogPostMeta } from '@/lib/blog'
import { formatDateChinese } from '@/lib/utils'
import ViewCounter from './ViewCounter'

interface BlogCardProps {
  post: BlogPostMeta
  showDescription?: boolean
}

export default function BlogCard({
  post,
  showDescription = true,
}: BlogCardProps) {
  return (
    <article className='py-4 border-b border-gray-100 dark:border-gray-800 last:border-b-0'>
      {/* 文章标题 - 更小的字体，符合参考网站 */}
      <h2 className='heading-font text-base font-medium leading-tight mb-2'>
        <Link
          href={`/blog/${post.slug}`}
          className='elegant-link hover:text-gray-600 dark:hover:text-gray-400 transition-colors'
        >
          {post.title}
        </Link>
      </h2>

      {/* 文章描述 */}
      {showDescription && post.description && (
        <p className='text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-3 line-clamp-2'>
          {post.description}
        </p>
      )}

      {/* 元信息 - 完全按照参考网站的布局 */}
      <div className='flex items-center text-xs text-gray-500 dark:text-gray-500 space-x-1'>
        <time dateTime={post.date}>{formatDateChinese(post.date)}</time>
        <span>·</span>
        {post.readTime && (
          <>
            <span>{post.readTime} 分钟</span>
            <span>·</span>
          </>
        )}
        {post.author && (
          <>
            <span>{post.author}</span>
            <span>·</span>
          </>
        )}
        <span>{Math.ceil((post.readTime || 5) * 200)} 字</span>
        <span>·</span>
        <ViewCounter slug={post.slug} increment={false} />
      </div>

      {/* 标签 - 可点击，hover显示剩余标签 */}
      {post.tags && post.tags.length > 0 && (
        <div className='flex flex-wrap items-center gap-1 mt-2'>
          {post.tags.slice(0, 2).map(tag => (
            <Link
              key={tag}
              href={`/tag/${encodeURIComponent(tag)}`}
              className='inline-flex items-center text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors'
            >
              {tag}
            </Link>
          ))}
          {post.tags.length > 2 && (
            <div className='relative group'>
              <span className='inline-flex items-center text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer'>
                +{post.tags.length - 2}
              </span>
              {/* 悬浮显示剩余标签 */}
              <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto z-10'>
                <div className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 min-w-max'>
                  <div className='flex flex-wrap gap-1 justify-center'>
                    {post.tags.slice(2).map(tag => (
                      <Link
                        key={tag}
                        href={`/tag/${encodeURIComponent(tag)}`}
                        className='inline-flex items-center text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors whitespace-nowrap'
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                  {/* 小三角箭头 - 居中显示 */}
                  <div className='absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-200 dark:border-t-gray-700' />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 推荐标识 - 更简洁 */}
      {post.featured && (
        <div className='mt-2'>
          <span className='inline-block text-xs px-2 py-1 rounded bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'>
            推荐阅读
          </span>
        </div>
      )}
    </article>
  )
}
