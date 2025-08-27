import Head from 'next/head'
import { siteConfig } from '@/lib/config'

interface SEOProps {
  title?: string
  description?: string
  canonical?: string
  image?: string
  type?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  tags?: string[]
  noindex?: boolean
}

export default function SEO({
  title,
  description = siteConfig.description,
  canonical,
  image = siteConfig.ogImage,
  type = 'website',
  publishedTime,
  modifiedTime,
  author = siteConfig.author.name,
  tags = [],
  noindex = false,
}: SEOProps) {
  const pageTitle = title 
    ? `${title} | ${siteConfig.name}` 
    : siteConfig.name

  const pageUrl = canonical 
    ? `${siteConfig.url}${canonical}` 
    : siteConfig.url

  const imageUrl = image?.startsWith('http') 
    ? image 
    : `${siteConfig.url}${image}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': type === 'article' ? 'BlogPosting' : 'WebSite',
    headline: title || siteConfig.name,
    description: description,
    url: pageUrl,
    ...(type === 'article' && {
      author: {
        '@type': 'Person',
        name: author,
      },
      publisher: {
        '@type': 'Organization',
        name: siteConfig.name,
        logo: {
          '@type': 'ImageObject',
          url: `${siteConfig.url}/logo.png`,
        },
      },
      datePublished: publishedTime,
      dateModified: modifiedTime || publishedTime,
      keywords: tags.join(', '),
    }),
    ...(type === 'website' && {
      name: siteConfig.name,
      publisher: {
        '@type': 'Organization',
        name: siteConfig.name,
      },
    }),
    image: imageUrl,
  }

  return (
    <Head>
      {/* 基本 SEO */}
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      {canonical && <link rel="canonical" href={pageUrl} />}
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      
      {/* 关键词 */}
      {tags.length > 0 && <meta name="keywords" content={tags.join(', ')} />}
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title || siteConfig.name} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:site_name" content={siteConfig.name} />
      <meta property="og:locale" content="zh_CN" />
      
      {/* Article specific Open Graph */}
      {type === 'article' && (
        <>
          <meta property="article:author" content={author} />
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {tags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@yourusername" />
      <meta name="twitter:creator" content="@yourusername" />
      <meta name="twitter:title" content={title || siteConfig.name} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      
      {/* 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />
      
      {/* 额外的 SEO 标签 */}
      <meta name="author" content={author} />
      <meta name="language" content="zh-CN" />
      <meta name="revisit-after" content="7 days" />
      <meta name="rating" content="General" />
      
      {/* 移动端优化 */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#ffffff" />
      
      {/* 预连接 */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    </Head>
  )
}