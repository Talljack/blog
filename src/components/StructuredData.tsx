import { BlogPostMeta } from '@/lib/blog'
import { siteConfig } from '@/lib/config'

interface StructuredDataProps {
  type:
    | 'website'
    | 'article'
    | 'person'
    | 'organization'
    | 'breadcrumb'
    | 'faq'
    | 'blog'
  data?: BlogPostMeta | any
  breadcrumbs?: Array<{ name: string; url: string }>
  faq?: Array<{ question: string; answer: string }>
}

export default function StructuredData({
  type,
  data,
  breadcrumbs,
  faq,
}: StructuredDataProps) {
  let structuredData: any = {}

  switch (type) {
    case 'website':
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: siteConfig.name,
        description: siteConfig.description,
        url: siteConfig.url,
        author: {
          '@type': 'Person',
          name: siteConfig.author.name,
          url: siteConfig.url,
        },
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
      }
      break

    case 'article':
      if (!data) break
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: data.title,
        description: data.description,
        image: `${siteConfig.url}/og-image.jpg`,
        author: {
          '@type': 'Person',
          name: data.author || siteConfig.author.name,
          url: siteConfig.author.social.github || siteConfig.url,
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
        datePublished: new Date(data.date).toISOString(),
        dateModified: data.lastModified
          ? new Date(data.lastModified).toISOString()
          : new Date(data.date).toISOString(),
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `${siteConfig.url}/blog/${data.slug}`,
        },
        keywords: data.tags?.join(', ') || '',
        wordCount: Math.ceil((data.readTime || 5) * 200),
        articleSection: 'Technology',
        inLanguage: 'zh-CN',
      }
      break

    case 'person':
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: siteConfig.author.name,
        description: siteConfig.author.bio,
        url: siteConfig.url,
        image: `${siteConfig.url}/avatar.jpg`,
        sameAs: [
          siteConfig.author.social.github,
          siteConfig.author.social.twitter,
        ].filter(Boolean),
        jobTitle: '全栈开发者',
        worksFor: {
          '@type': 'Organization',
          name: 'Independent',
        },
      }
      break

    case 'organization':
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: siteConfig.name,
        description: siteConfig.description,
        url: siteConfig.url,
        logo: `${siteConfig.url}/logo.png`,
        founder: {
          '@type': 'Person',
          name: siteConfig.author.name,
        },
        sameAs: [
          siteConfig.author.social.github,
          siteConfig.author.social.twitter,
        ].filter(Boolean),
      }
      break

    case 'blog':
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: siteConfig.name,
        description: siteConfig.description,
        url: `${siteConfig.url}/blog`,
        author: {
          '@type': 'Person',
          name: siteConfig.author.name,
          url: siteConfig.url,
        },
        publisher: {
          '@type': 'Organization',
          name: siteConfig.name,
          url: siteConfig.url,
          logo: {
            '@type': 'ImageObject',
            url: `${siteConfig.url}/logo.png`,
          },
        },
        inLanguage: 'zh-CN',
        potentialAction: {
          '@type': 'SearchAction',
          target: `${siteConfig.url}/blog?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      }
      break

    case 'breadcrumb':
      if (!breadcrumbs) break
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((crumb, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: crumb.name,
          item: crumb.url,
        })),
      }
      break

    case 'faq':
      if (!faq) break
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faq.map(item => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      }
      break
  }

  // 如果没有结构化数据，不渲染
  if (!structuredData['@type']) {
    return null
  }

  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2),
      }}
    />
  )
}
