import Head from 'next/head'
import { siteConfig } from '@/lib/config'
import { getOGImageForPath, getDefaultOGImageUrl } from '@/lib/og'
import { usePathname } from 'next/navigation'

interface SEOProps {
  title?: string
  description?: string
  canonical?: string
  image?: string
  type?: 'website' | 'article' | 'course' | 'template'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  tags?: string[]
  noindex?: boolean
  category?: string
  readTime?: number
  wordCount?: number
  featured?: boolean
}

export default function SEO({
  title,
  description = siteConfig.description,
  canonical,
  image,
  type = 'website',
  publishedTime,
  modifiedTime,
  author = siteConfig.author.name,
  tags = [],
  noindex = false,
  category,
  readTime,
  wordCount,
  featured = false,
}: SEOProps) {
  const pathname = usePathname()
  const pageTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.name

  const pageUrl = canonical ? `${siteConfig.url}${canonical}` : siteConfig.url

  // 自动生成OG图片或使用提供的图片
  const ogImageUrl = image
    ? image.startsWith('http')
      ? image
      : `${siteConfig.url}${image}`
    : getOGImageForPath(pathname, title, description)

  const imageUrl = ogImageUrl || getDefaultOGImageUrl()

  // 增强的JSON-LD结构化数据
  const getJsonLdType = () => {
    switch (type) {
      case 'article':
        return 'BlogPosting'
      case 'course':
        return 'Course'
      case 'template':
        return 'SoftwareApplication'
      default:
        return 'WebSite'
    }
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': getJsonLdType(),
    headline: title || siteConfig.name,
    name: title || siteConfig.name,
    description: description,
    url: pageUrl,
    image: {
      '@type': 'ImageObject',
      url: imageUrl,
      width: 1200,
      height: 630,
      alt: title || siteConfig.name,
    },
    inLanguage: 'zh-CN',
    isAccessibleForFree: true,

    // 文章特定数据
    ...(type === 'article' && {
      author: {
        '@type': 'Person',
        name: author,
        url: siteConfig.author.social?.github || siteConfig.url,
      },
      publisher: {
        '@type': 'Organization',
        name: siteConfig.name,
        url: siteConfig.url,
        logo: {
          '@type': 'ImageObject',
          url: `${siteConfig.url}/logo.png`,
          width: 60,
          height: 60,
        },
      },
      datePublished: publishedTime,
      dateModified: modifiedTime || publishedTime,
      keywords: tags.join(', '),
      articleSection: category || 'Technology',
      wordCount: wordCount,
      timeRequired: readTime ? `PT${readTime}M` : undefined,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': pageUrl,
      },
      audience: {
        '@type': 'Audience',
        audienceType: 'Developers',
      },
      about:
        tags.length > 0
          ? {
              '@type': 'Thing',
              name: tags[0],
            }
          : undefined,
    }),

    // 网站特定数据
    ...(type === 'website' && {
      publisher: {
        '@type': 'Organization',
        name: siteConfig.name,
        url: siteConfig.url,
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: `${siteConfig.url}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    }),

    // 课程特定数据
    ...(type === 'course' && {
      provider: {
        '@type': 'Organization',
        name: siteConfig.name,
        url: siteConfig.url,
      },
      instructor: {
        '@type': 'Person',
        name: author,
      },
      educationalLevel: 'Intermediate',
      teaches: tags,
    }),
  }

  return (
    <Head>
      {/* 基本 SEO */}
      <title>{pageTitle}</title>
      <meta name='description' content={description} />
      {canonical && <link rel='canonical' href={pageUrl} />}
      {noindex && <meta name='robots' content='noindex,nofollow' />}

      {/* 关键词 */}
      {tags.length > 0 && <meta name='keywords' content={tags.join(', ')} />}

      {/* Open Graph */}
      <meta property='og:type' content={type} />
      <meta property='og:title' content={title || siteConfig.name} />
      <meta property='og:description' content={description} />
      <meta property='og:url' content={pageUrl} />
      <meta property='og:image' content={imageUrl} />
      <meta property='og:site_name' content={siteConfig.name} />
      <meta property='og:locale' content='zh_CN' />

      {/* Article specific Open Graph */}
      {type === 'article' && (
        <>
          <meta property='article:author' content={author} />
          {publishedTime && (
            <meta property='article:published_time' content={publishedTime} />
          )}
          {modifiedTime && (
            <meta property='article:modified_time' content={modifiedTime} />
          )}
          {tags.map((tag, index) => (
            <meta key={index} property='article:tag' content={tag} />
          ))}
        </>
      )}

      {/* Twitter Card */}
      <meta name='twitter:card' content='summary_large_image' />
      {siteConfig.author.social?.twitter && (
        <>
          <meta
            name='twitter:site'
            content={`@${siteConfig.author.social.twitter.replace('@', '')}`}
          />
          <meta
            name='twitter:creator'
            content={`@${siteConfig.author.social.twitter.replace('@', '')}`}
          />
        </>
      )}
      <meta name='twitter:title' content={title || siteConfig.name} />
      <meta name='twitter:description' content={description} />
      <meta name='twitter:image' content={imageUrl} />
      <meta
        name='twitter:image:alt'
        content={`${title || siteConfig.name} - ${siteConfig.description}`}
      />

      {/* 结构化数据 */}
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      {/* 额外的 SEO 标签 */}
      <meta name='author' content={author} />
      <meta name='language' content='zh-CN' />
      <meta name='revisit-after' content='7 days' />
      <meta name='rating' content='General' />

      {/* 文章特定元数据 */}
      {type === 'article' && (
        <>
          {category && <meta name='article:section' content={category} />}
          {readTime && (
            <meta name='reading-time' content={`${readTime} minutes`} />
          )}
          {wordCount && (
            <meta name='word-count' content={wordCount.toString()} />
          )}
          {featured && <meta name='article:featured' content='true' />}
        </>
      )}

      {/* 高级SEO标签 */}
      <meta name='format-detection' content='telephone=no' />
      <meta name='apple-mobile-web-app-capable' content='yes' />
      <meta
        name='apple-mobile-web-app-status-bar-style'
        content='black-translucent'
      />

      {/* 预取和DNS预连接 */}
      <link rel='dns-prefetch' href='//fonts.googleapis.com' />
      <link rel='dns-prefetch' href='//www.google-analytics.com' />

      {/* Favicon */}
      <link rel='icon' type='image/x-icon' href='/favicon.ico' />
      <link
        rel='icon'
        type='image/png'
        sizes='16x16'
        href='/favicon-16x16.png'
      />
      <link
        rel='icon'
        type='image/png'
        sizes='32x32'
        href='/favicon-32x32.png'
      />
      <link rel='apple-touch-icon' href='/apple-touch-icon.png' />

      {/* 移动端优化 */}
      <meta
        name='viewport'
        content='width=device-width, initial-scale=1.0, maximum-scale=5.0'
      />
      <meta name='theme-color' content='#3b82f6' />
      <meta name='color-scheme' content='light dark' />

      {/* 预连接 */}
      <link rel='preconnect' href='https://fonts.googleapis.com' />
      <link
        rel='preconnect'
        href='https://fonts.gstatic.com'
        crossOrigin='anonymous'
      />
    </Head>
  )
}
