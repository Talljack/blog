import Image from 'next/image'
import { useState } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  caption?: string
  title?: string
  sizes?: string
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  // SEO specific props
  author?: string
  license?: string
  source?: string
  relatedContent?: string
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  caption,
  title,
  sizes,
  placeholder = 'empty',
  blurDataURL,
  author,
  license,
  source,
  relatedContent,
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // 生成结构化数据
  const generateImageStructuredData = () => {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'ImageObject',
      contentUrl: src,
      name: title || alt,
      description: alt,
      ...(author && {
        creator: {
          '@type': 'Person',
          name: author,
        },
      }),
      ...(license && { license }),
      ...(source && {
        creditText: source,
        url: source,
      }),
      ...(width &&
        height && {
          width: width.toString(),
          height: height.toString(),
        }),
      encodingFormat: getImageFormat(src),
    }

    return structuredData
  }

  // 获取图片格式
  const getImageFormat = (src: string): string => {
    const extension = src.split('.').pop()?.toLowerCase()
    const formatMap: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      avif: 'image/avif',
      svg: 'image/svg+xml',
      gif: 'image/gif',
    }
    return formatMap[extension || ''] || 'image/jpeg'
  }

  // 错误处理
  const handleError = () => {
    setHasError(true)
    setIsLoading(false)
  }

  const handleLoad = () => {
    setIsLoading(false)
  }

  // 如果图片加载失败，显示占位符
  if (hasError) {
    return (
      <div
        className={`bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${className}`}
        style={{ width: width || 'auto', height: height || 200 }}
        role='img'
        aria-label={alt}
      >
        <div className='text-center text-gray-500 dark:text-gray-400 p-4'>
          <svg
            className='w-12 h-12 mx-auto mb-2'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
            />
          </svg>
          <p className='text-sm'>图片加载失败</p>
          <p className='text-xs mt-1'>{alt}</p>
        </div>
      </div>
    )
  }

  const imageElement = (
    <div className='relative'>
      {/* 加载状态指示器 */}
      {isLoading && (
        <div
          className='absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center'
          style={{ width: width || '100%', height: height || 200 }}
          aria-hidden='true'
        >
          <div className='text-gray-400 text-sm'>加载中...</div>
        </div>
      )}

      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        priority={priority}
        title={title || alt}
        sizes={sizes}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        onError={handleError}
        onLoad={handleLoad}
        // SEO优化属性
        itemProp='image'
        loading={priority ? 'eager' : 'lazy'}
        decoding='async'
        // 为屏幕阅读器提供更多上下文
        role='img'
        aria-describedby={
          caption ? `caption-${src.replace(/[^a-zA-Z0-9]/g, '')}` : undefined
        }
      />

      {/* 图片覆盖层信息 */}
      {(author || source) && (
        <div className='absolute bottom-0 right-0 bg-black/70 text-white text-xs p-1 rounded-tl'>
          {author && <div>© {author}</div>}
          {source && <div className='text-gray-300'>{source}</div>}
        </div>
      )}
    </div>
  )

  // 如果有caption，包装在figure元素中
  if (caption) {
    const captionId = `caption-${src.replace(/[^a-zA-Z0-9]/g, '')}`

    return (
      <figure
        className='my-6'
        itemScope
        itemType='https://schema.org/ImageObject'
      >
        {imageElement}

        <figcaption
          id={captionId}
          className='mt-2 text-sm text-gray-600 dark:text-gray-400 text-center italic'
          itemProp='caption'
        >
          {caption}

          {/* 图片元信息 */}
          {(author || source || license) && (
            <div className='mt-1 text-xs text-gray-500'>
              {author && <span>作者: {author}</span>}
              {source && (
                <span>
                  {author ? ' | ' : ''}来源: {source}
                </span>
              )}
              {license && (
                <span>
                  {author || source ? ' | ' : ''}许可证: {license}
                </span>
              )}
            </div>
          )}
        </figcaption>

        {/* 结构化数据 */}
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateImageStructuredData()),
          }}
        />
      </figure>
    )
  }

  return (
    <span
      itemScope
      itemType='https://schema.org/ImageObject'
      className='inline-block'
    >
      {imageElement}

      {/* 结构化数据 */}
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateImageStructuredData()),
        }}
      />
    </span>
  )
}

// 图片画廊组件
interface ImageGalleryProps {
  images: Array<{
    src: string
    alt: string
    caption?: string
    width?: number
    height?: number
    author?: string
    source?: string
  }>
  title?: string
  description?: string
  columns?: 2 | 3 | 4
}

export function ImageGallery({
  images,
  title,
  description,
  columns = 3,
}: ImageGalleryProps) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }

  return (
    <section
      className='my-8'
      itemScope
      itemType='https://schema.org/ImageGallery'
    >
      {title && (
        <h3 className='text-xl font-semibold mb-4' itemProp='name'>
          {title}
        </h3>
      )}

      {description && (
        <p
          className='text-gray-600 dark:text-gray-400 mb-6'
          itemProp='description'
        >
          {description}
        </p>
      )}

      <div className={`grid gap-4 ${gridCols[columns]}`}>
        {images.map((image, index) => (
          <div
            key={index}
            itemProp='associatedMedia'
            itemScope
            itemType='https://schema.org/ImageObject'
          >
            <OptimizedImage
              src={image.src}
              alt={image.alt}
              width={image.width || 400}
              height={image.height || 300}
              caption={image.caption}
              author={image.author}
              source={image.source}
              className='w-full h-auto rounded-lg'
              sizes='(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'
            />
          </div>
        ))}
      </div>

      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ImageGallery',
            name: title,
            description: description,
            image: images.map(img => ({
              '@type': 'ImageObject',
              contentUrl: img.src,
              name: img.alt,
              caption: img.caption,
            })),
          }),
        }}
      />
    </section>
  )
}
