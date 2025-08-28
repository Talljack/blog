import { ReactNode } from 'react'

interface SemanticLayoutProps {
  children: ReactNode
  className?: string
  type?: 'article' | 'page' | 'list' | 'course' | 'template'
  title?: string
  description?: string
  author?: string
  publishDate?: string
  modifiedDate?: string
  tags?: string[]
  category?: string
  readingTime?: number
}

export default function SemanticLayout({
  children,
  className = '',
  type = 'page',
  title,
  description,
  author,
  publishDate,
  modifiedDate,
  tags = [],
  category,
  readingTime,
}: SemanticLayoutProps) {
  // 文章类型的语义化结构
  if (type === 'article') {
    return (
      <article
        className={`${className} prose prose-lg dark:prose-invert max-w-none`}
        itemScope
        itemType='https://schema.org/BlogPosting'
      >
        {/* 文章头部元信息 */}
        <header className='mb-8 not-prose'>
          {title && (
            <h1
              className='text-3xl md:text-4xl font-bold mb-4'
              itemProp='headline'
            >
              {title}
            </h1>
          )}

          {description && (
            <p
              className='text-lg text-gray-600 dark:text-gray-400 mb-6'
              itemProp='description'
            >
              {description}
            </p>
          )}

          <div className='flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400'>
            {author && (
              <span
                itemProp='author'
                itemScope
                itemType='https://schema.org/Person'
              >
                作者: <span itemProp='name'>{author}</span>
              </span>
            )}

            {publishDate && (
              <time dateTime={publishDate} itemProp='datePublished'>
                发布于 {new Date(publishDate).toLocaleDateString('zh-CN')}
              </time>
            )}

            {modifiedDate && modifiedDate !== publishDate && (
              <time dateTime={modifiedDate} itemProp='dateModified'>
                更新于 {new Date(modifiedDate).toLocaleDateString('zh-CN')}
              </time>
            )}

            {readingTime && <span>预计阅读时间: {readingTime} 分钟</span>}
          </div>

          {/* 标签和分类 */}
          {(tags.length > 0 || category) && (
            <div className='mt-4 flex flex-wrap gap-2'>
              {category && (
                <span
                  className='px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs'
                  itemProp='articleSection'
                >
                  {category}
                </span>
              )}

              {tags.map(tag => (
                <span
                  key={tag}
                  className='px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded text-xs'
                  itemProp='keywords'
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* 文章正文 */}
        <section itemProp='articleBody' className='article-content'>
          {children}
        </section>

        {/* 文章底部信息 */}
        <footer className='mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 not-prose'>
          <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
            <div className='text-sm text-gray-500 dark:text-gray-400'>
              {publishDate && (
                <>
                  首次发布于{' '}
                  <time dateTime={publishDate}>
                    {new Date(publishDate).toLocaleDateString('zh-CN')}
                  </time>
                </>
              )}
              {modifiedDate && modifiedDate !== publishDate && (
                <>
                  ，最后更新于{' '}
                  <time dateTime={modifiedDate}>
                    {new Date(modifiedDate).toLocaleDateString('zh-CN')}
                  </time>
                </>
              )}
            </div>

            {/* 社交分享 */}
            <div className='flex gap-2'>
              <button
                type='button'
                className='px-3 py-1 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-800 dark:text-blue-200 rounded text-sm transition-colors'
                onClick={() => {
                  if (navigator.share && title) {
                    navigator.share({
                      title,
                      text: description,
                      url: window.location.href,
                    })
                  }
                }}
                aria-label='分享文章'
              >
                分享
              </button>
            </div>
          </div>
        </footer>
      </article>
    )
  }

  // 课程类型的语义化结构
  if (type === 'course') {
    return (
      <article
        className={`${className}`}
        itemScope
        itemType='https://schema.org/Course'
      >
        <header className='mb-8'>
          {title && (
            <h1 className='text-3xl md:text-4xl font-bold mb-4' itemProp='name'>
              {title}
            </h1>
          )}

          {description && (
            <p
              className='text-lg text-gray-600 dark:text-gray-400 mb-6'
              itemProp='description'
            >
              {description}
            </p>
          )}

          <div className='flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400'>
            {author && (
              <span
                itemProp='instructor'
                itemScope
                itemType='https://schema.org/Person'
              >
                讲师: <span itemProp='name'>{author}</span>
              </span>
            )}

            {readingTime && (
              <span itemProp='timeRequired' content={`PT${readingTime}H`}>
                课程时长: {readingTime} 小时
              </span>
            )}
          </div>
        </header>

        <section itemProp='courseContent'>{children}</section>
      </article>
    )
  }

  // 列表页面的语义化结构
  if (type === 'list') {
    return (
      <section className={className} role='main'>
        <header className='mb-8'>
          {title && (
            <h1 className='text-3xl md:text-4xl font-bold mb-4'>{title}</h1>
          )}

          {description && (
            <p className='text-lg text-gray-600 dark:text-gray-400'>
              {description}
            </p>
          )}
        </header>

        <div role='list' className='space-y-6'>
          {children}
        </div>
      </section>
    )
  }

  // 默认页面结构
  return (
    <section className={className} role='main' aria-label={title || '主要内容'}>
      {title && (
        <header className='mb-8'>
          <h1 className='text-3xl md:text-4xl font-bold mb-4'>{title}</h1>

          {description && (
            <p className='text-lg text-gray-600 dark:text-gray-400'>
              {description}
            </p>
          )}
        </header>
      )}

      {children}
    </section>
  )
}

// 面包屑导航组件
interface BreadcrumbProps {
  items: Array<{
    label: string
    href?: string
    current?: boolean
  }>
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label='面包屑导航' className='mb-6'>
      <ol
        className='flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400'
        itemScope
        itemType='https://schema.org/BreadcrumbList'
      >
        {items.map((item, index) => (
          <li
            key={index}
            itemScope
            itemType='https://schema.org/ListItem'
            itemProp='itemListElement'
          >
            {item.href && !item.current ? (
              <>
                <a
                  href={item.href}
                  className='hover:text-gray-700 dark:hover:text-gray-300 transition-colors'
                  itemProp='item'
                >
                  <span itemProp='name'>{item.label}</span>
                </a>
                <meta itemProp='position' content={String(index + 1)} />
                {index < items.length - 1 && (
                  <span className='mx-2' aria-hidden='true'>
                    /
                  </span>
                )}
              </>
            ) : (
              <>
                <span
                  className='text-gray-900 dark:text-gray-100 font-medium'
                  itemProp='name'
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.label}
                </span>
                <meta itemProp='position' content={String(index + 1)} />
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

// 相关文章推荐组件
interface RelatedArticlesProps {
  articles: Array<{
    title: string
    href: string
    description?: string
    date?: string
    readTime?: number
  }>
}

export function RelatedArticles({ articles }: RelatedArticlesProps) {
  if (articles.length === 0) return null

  return (
    <aside className='mt-12 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg'>
      <h2 className='text-xl font-bold mb-4'>相关文章</h2>
      <ul className='space-y-3' role='list'>
        {articles.map((article, index) => (
          <li key={index} role='listitem'>
            <article>
              <h3>
                <a
                  href={article.href}
                  className='text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors'
                >
                  {article.title}
                </a>
              </h3>

              {article.description && (
                <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
                  {article.description}
                </p>
              )}

              <div className='flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-2'>
                {article.date && (
                  <time dateTime={article.date}>
                    {new Date(article.date).toLocaleDateString('zh-CN')}
                  </time>
                )}

                {article.readTime && <span>{article.readTime} 分钟阅读</span>}
              </div>
            </article>
          </li>
        ))}
      </ul>
    </aside>
  )
}
