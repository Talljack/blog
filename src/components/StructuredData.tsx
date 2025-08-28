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
    | 'course'
    | 'softwareApplication'
    | 'howTo'
    | 'techArticle'
    | 'webPage'
  data?: BlogPostMeta | any
  breadcrumbs?: Array<{ name: string; url: string }>
  faq?: Array<{ question: string; answer: string }>
  courseData?: {
    title: string
    description: string
    instructor: string
    duration?: string
    difficulty?: 'Beginner' | 'Intermediate' | 'Advanced'
    tags?: string[]
  }
  howToSteps?: Array<{ name: string; text: string; image?: string }>
  webPageData?: {
    title: string
    description: string
    url: string
    lastModified?: string
  }
}

export default function StructuredData({
  type,
  data,
  breadcrumbs,
  faq,
  courseData,
  howToSteps,
  webPageData,
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
        articleSection: data.category || 'Technology',
        inLanguage: 'zh-CN',
        isAccessibleForFree: true,
        genre: data.tags || ['Technology', 'Programming'],
        about: {
          '@type': 'Thing',
          name: data.tags?.[0] || 'Technology',
        },
        audience: {
          '@type': 'Audience',
          audienceType: 'Developers',
        },
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

    case 'course':
      if (!courseData) break
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: courseData.title,
        description: courseData.description,
        provider: {
          '@type': 'Organization',
          name: siteConfig.name,
          url: siteConfig.url,
        },
        instructor: {
          '@type': 'Person',
          name: courseData.instructor || siteConfig.author.name,
        },
        educationalLevel: courseData.difficulty || 'Intermediate',
        timeRequired: courseData.duration || 'P1W',
        coursePrerequisites: courseData.tags?.join(', ') || '',
        inLanguage: 'zh-CN',
        isAccessibleForFree: true,
        teaches: courseData.tags || [],
      }
      break

    case 'softwareApplication':
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: siteConfig.name,
        description: siteConfig.description,
        url: siteConfig.url,
        applicationCategory: 'WebApplication',
        operatingSystem: 'Web Browser',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'CNY',
        },
        author: {
          '@type': 'Person',
          name: siteConfig.author.name,
        },
      }
      break

    case 'howTo':
      if (!howToSteps) break
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: data?.title || 'How To Guide',
        description: data?.description || '',
        image: `${siteConfig.url}/og-image.jpg`,
        estimatedCost: {
          '@type': 'MonetaryAmount',
          currency: 'CNY',
          value: '0',
        },
        step: howToSteps.map((step, index) => ({
          '@type': 'HowToStep',
          position: index + 1,
          name: step.name,
          text: step.text,
          image: step.image,
        })),
        totalTime: 'PT30M',
      }
      break

    case 'techArticle':
      if (!data) break
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
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
        dependencies: 'Basic programming knowledge',
        proficiencyLevel: 'Intermediate',
        isAccessibleForFree: true,
      }
      break

    case 'webPage':
      const pageData = webPageData || data
      if (!pageData) break
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: pageData.title,
        description: pageData.description,
        url: pageData.url || `${siteConfig.url}`,
        inLanguage: 'zh-CN',
        isPartOf: {
          '@type': 'WebSite',
          name: siteConfig.name,
          url: siteConfig.url,
        },
        author: {
          '@type': 'Person',
          name: siteConfig.author.name,
        },
        publisher: {
          '@type': 'Organization',
          name: siteConfig.name,
          url: siteConfig.url,
        },
        dateModified: pageData.lastModified
          ? new Date(pageData.lastModified).toISOString()
          : new Date().toISOString(),
        mainContentOfPage: {
          '@type': 'WebPageElement',
          cssSelector: 'main',
        },
      }
      break
  }

  // 添加通用的 WebSite 数据到所有类型
  if (structuredData['@type'] && type !== 'website') {
    structuredData.mainEntityOfPage = structuredData.mainEntityOfPage || {
      '@type': 'WebPage',
      '@id':
        typeof window !== 'undefined' ? window.location.href : siteConfig.url,
      isPartOf: {
        '@type': 'WebSite',
        name: siteConfig.name,
        url: siteConfig.url,
      },
    }
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
