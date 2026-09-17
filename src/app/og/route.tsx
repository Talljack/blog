import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { siteConfig } from '@/lib/config'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    // 获取参数
    const title = searchParams.get('title') || siteConfig.name
    const description =
      searchParams.get('description') || siteConfig.description
    const type = searchParams.get('type') || 'website'
    const tags = searchParams.get('tags')?.split(',') || []
    const author = searchParams.get('author') || siteConfig.author.name
    const date = searchParams.get('date')

    // 根据类型选择不同的模板
    const isArticle = type === 'article'
    const isCourse = type === 'course'
    const isTemplate = type === 'template'

    return new ImageResponse(
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          backgroundColor: '#1c1917',
          padding: '80px',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
            }}
          >
            {/* Monogram */}
            <div
              style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#bef264',
                color: '#1c1917',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
              }}
            >
              TJ/
            </div>

            {/* Site Name */}
            <div
              style={{
                color: '#f5f5f4',
                fontSize: '32px',
                fontWeight: '700',
              }}
            >
              {siteConfig.name}
            </div>
          </div>

          {/* Type Badge */}
          <div
            style={{
              backgroundColor: '#bef264',
              color: '#1c1917',
              padding: '12px 24px',
              borderRadius: '999px',
              fontSize: '18px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            {isArticle
              ? 'Article'
              : isCourse
                ? 'Course'
                : isTemplate
                  ? 'Template'
                  : 'Page'}
          </div>
        </div>

        {/* Main Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '30px',
            flex: 1,
            width: '100%',
          }}
        >
          {/* Title */}
          <h1
            style={{
              color: '#f5f5f4',
              fontSize: title.length > 60 ? '48px' : '64px',
              fontWeight: '800',
              lineHeight: '1.1',
              margin: '0',
              maxWidth: '100%',
              wordWrap: 'break-word',
            }}
          >
            {title}
          </h1>

          {/* Description */}
          {description && (
            <p
              style={{
                color: '#d6d3d1',
                fontSize: '28px',
                fontWeight: '400',
                lineHeight: '1.4',
                margin: '0',
                opacity: 0.9,
                maxWidth: '100%',
              }}
            >
              {description.length > 120
                ? `${description.substring(0, 120)}...`
                : description}
            </p>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div
              style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                marginTop: '20px',
              }}
            >
              {tags.slice(0, 4).map((tag, index) => (
                <span
                  key={index}
                  style={{
                    backgroundColor: 'rgba(190, 242, 100, 0.12)',
                    color: '#d9f99d',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '18px',
                    fontWeight: '500',
                    border: '1px solid rgba(190, 242, 100, 0.25)',
                  }}
                >
                  #{tag.trim()}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            marginTop: '40px',
            borderTop: '2px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '30px',
          }}
        >
          {/* Author & Date */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div
              style={{
                color: '#f5f5f4',
                fontSize: '24px',
                fontWeight: '600',
              }}
            >
              {author}
            </div>
            {date && (
              <div
                style={{
                  color: '#a8a29e',
                  fontSize: '20px',
                }}
              >
                {new Date(date).toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            )}
          </div>

          {/* URL */}
          <div
            style={{
              color: '#a8a29e',
              fontSize: '20px',
              fontWeight: '500',
            }}
          >
            {siteConfig.url.replace('https://', '').replace('http://', '')}
          </div>
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
        // Remove custom fonts to avoid loading issues, use system fonts instead
      }
    )
  } catch (error) {
    console.error('Error generating OG image:', error)

    // 返回一个简单的错误图片
    return new ImageResponse(
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ef4444',
          color: 'white',
          fontSize: '32px',
          fontWeight: 'bold',
        }}
      >
        Error generating image
      </div>,
      {
        width: 1200,
        height: 630,
      }
    )
  }
}
