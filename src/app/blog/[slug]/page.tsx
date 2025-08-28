import { ArrowLeft, Calendar, Clock, Tag, User } from 'lucide-react'
import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Comments from '@/components/Comments'
import StructuredData from '@/components/StructuredData'
import ViewCounter from '@/components/ViewCounter'
import { getPostBySlug, getAllPosts } from '@/lib/blog'
import { formatDateChinese } from '@/lib/utils'

interface PostPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map(post => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    return {
      title: '文章未找到',
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const publishedTime = new Date(post.date).toISOString()
  const modifiedTime = post.lastModified
    ? new Date(post.lastModified).toISOString()
    : publishedTime

  return {
    title: post.title,
    description: post.description,
    keywords: post.tags?.join(', '),
    authors: [{ name: post.author || 'Anonymous' }],
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime,
      modifiedTime,
      authors: [post.author || 'Anonymous'],
      tags: post.tags,
      images: [
        {
          url: '/og-image.jpg', // 你可以为每篇文章设置特定的图片
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: ['/og-image.jpg'],
    },
    alternates: {
      canonical: `/blog/${slug}`,
    },
    other: {
      'article:author': post.author || 'Anonymous',
      'article:published_time': publishedTime,
      'article:modified_time': modifiedTime,
      'article:section': 'Technology',
      ...post.tags?.reduce(
        (acc, tag, index) => ({
          ...acc,
          [`article:tag:${index}`]: tag,
        }),
        {}
      ),
    },
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  return (
    <>
      <StructuredData type='article' data={post} />
      <div className='max-w-2xl mx-auto px-6 pb-16'>
        {/* 返回链接 - 简洁优雅 */}
        <div className='mb-8'>
          <Link
            href='/blog'
            className='inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors group'
          >
            <ArrowLeft className='w-4 h-4 mr-2 group-hover:-translate-x-0.5 transition-transform' />
            返回博客
          </Link>
        </div>

        {/* 文章头部 */}
        <header className='mb-8'>
          {/* 文章标题 */}
          <h1 className='heading-font text-2xl md:text-3xl font-semibold leading-tight mb-4 text-gray-900 dark:text-gray-100'>
            {post.title}
          </h1>

          {/* 文章描述 */}
          {post.description && (
            <p className='text-gray-600 dark:text-gray-400 text-base leading-relaxed mb-6'>
              {post.description}
            </p>
          )}

          {/* 文章元信息 - 优雅排版 */}
          <div className='flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-500 mb-6'>
            <div className='flex items-center gap-1'>
              <Calendar className='w-4 h-4' />
              <time dateTime={post.date}>{formatDateChinese(post.date)}</time>
            </div>

            {post.readTime && (
              <div className='flex items-center gap-1'>
                <Clock className='w-4 h-4' />
                <span>{post.readTime} 分钟阅读</span>
              </div>
            )}

            {post.author && (
              <div className='flex items-center gap-1'>
                <User className='w-4 h-4' />
                <span>{post.author}</span>
              </div>
            )}

            {/* 字数统计 */}
            <div className='flex items-center gap-1'>
              <span>约 {Math.ceil(post.readTime * 200)} 字</span>
            </div>

            {/* 浏览量统计 */}
            <span className='text-gray-300 dark:text-gray-600'>·</span>
            <ViewCounter slug={post.slug} increment={true} />
          </div>

          {/* 标签 */}
          {post.tags && post.tags.length > 0 && (
            <div className='flex items-center gap-2 flex-wrap'>
              <Tag className='w-4 h-4 text-gray-400' />
              {post.tags.map(tag => (
                <span key={tag} className='tag'>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* 优雅的分割线 */}
        <div className='elegant-divider mb-8' />

        {/* 文章内容 - 专注阅读模式 */}
        <article className='prose reading-mode'>
          <div
            dangerouslySetInnerHTML={{ __html: post.content }}
            className='prose max-w-none'
          />
        </article>

        {/* 文章底部信息 */}
        <footer className='mt-12 pt-8 border-t border-gray-200 dark:border-gray-800'>
          <div className='flex flex-col space-y-4'>
            {/* 文章发布信息 */}
            <div className='text-sm text-gray-500 dark:text-gray-500'>
              <p>
                发布于{' '}
                <time dateTime={post.date}>{formatDateChinese(post.date)}</time>
                {post.author && <span> · 作者：{post.author}</span>}
              </p>
            </div>

            {/* 返回链接 */}
            <div className='flex justify-between items-center'>
              <Link href='/blog' className='elegant-button'>
                <ArrowLeft className='w-4 h-4 mr-2' />
                更多博客
              </Link>

              {/* 分享按钮 - 可以后续添加 */}
              <div className='text-xs text-gray-400'>感谢阅读</div>
            </div>
          </div>
        </footer>

        {/* 评论系统 */}
        <div className='mt-12'>
          <div className='elegant-divider mb-8' />
          <Comments slug={post.slug} title={post.title} />
        </div>
      </div>
    </>
  )
}
