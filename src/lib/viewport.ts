import type { Viewport } from 'next'

/**
 * Next.js 15+ viewport configuration
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
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
            color: themeColor.light || '#ffffff',
          },
          {
            media: '(prefers-color-scheme: dark)',
            color: themeColor.dark || '#0f172a',
          },
        ]
      : [
          { media: '(prefers-color-scheme: light)', color: '#ffffff' },
          { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
        ],
  }
}
