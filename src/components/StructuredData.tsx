import { siteConfig } from '@/lib/config'
import { BlogPostMeta } from '@/lib/blog'

interface StructuredDataProps {
  type: 'website' | 'article' | 'person' | 'organization'
  data?: BlogPostMeta
}

export default function StructuredData({ type, data }: StructuredDataProps) {
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
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2),
      }}
    />
  )
}