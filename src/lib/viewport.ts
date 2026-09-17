import type { Viewport } from 'next'

/**
 * Next.js 15+ viewport configuration
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf9f5' },
    { media: '(prefers-color-scheme: dark)', color: '#1c1917' },
  ],
}

/**
 * 生成动态viewport配置
 */
export function generateViewport(
  options: {
    themeColor?: { light?: string; dark?: string }
    initialScale?: number
    maximumScale?: number
  } = {}
): Viewport {
  const { themeColor, initialScale = 1, maximumScale = 5 } = options

  return {
    width: 'device-width',
    initialScale,
    maximumScale,
    themeColor: themeColor
      ? [
          {
            media: '(prefers-color-scheme: light)',
            color: themeColor.light || '#faf9f5',
          },
          {
            media: '(prefers-color-scheme: dark)',
            color: themeColor.dark || '#1c1917',
          },
        ]
      : [
          { media: '(prefers-color-scheme: light)', color: '#faf9f5' },
          { media: '(prefers-color-scheme: dark)', color: '#1c1917' },
        ],
  }
}
