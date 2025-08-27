'use client'

import { useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'
import { siteConfig } from '@/lib/config'

interface CommentsProps {
  slug: string
  title: string
}

export default function Comments({ slug, title }: CommentsProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { theme, resolvedTheme } = useTheme()

  useEffect(() => {
    if (!ref.current) return

    // 清理之前的评论组件
    const existingScript = ref.current.querySelector('script')
    if (existingScript) {
      ref.current.removeChild(existingScript)
    }

    // 创建新的 Giscus 脚本
    const script = document.createElement('script')
    const config = siteConfig.giscus

    script.src = 'https://giscus.app/client.js'
    script.setAttribute('data-repo', config.repo || 'your-username/your-repo')
    script.setAttribute('data-repo-id', config.repoId || 'your-repo-id')
    script.setAttribute('data-category', config.category || 'Announcements')
    script.setAttribute('data-category-id', config.categoryId || 'your-category-id')
    script.setAttribute('data-mapping', 'pathname')
    script.setAttribute('data-strict', '0')
    script.setAttribute('data-reactions-enabled', '1')
    script.setAttribute('data-emit-metadata', '0')
    script.setAttribute('data-input-position', 'bottom')
    script.setAttribute('data-theme', 'preferred_color_scheme')
    script.setAttribute('data-lang', 'en')
    script.setAttribute('data-loading', 'lazy')
    script.crossOrigin = 'anonymous'
    script.async = true

    ref.current.appendChild(script)
  }, [resolvedTheme])

  // 如果没有配置 Giscus，显示备用评论界面
  if (!siteConfig.giscus?.repo || siteConfig.giscus.repo === 'your-username/your-repo') {
    return (
      <section className="mt-8">
        <h3 className="heading-font text-base font-semibold mb-6 text-gray-900 dark:text-gray-100">
          评论
        </h3>
        
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            评论功能尚未配置。
          </p>
          <div className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
            <p>要启用评论功能，请：</p>
            <p>1. 创建 GitHub 仓库并启用 Discussions</p>
            <p>2. 在 <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded">src/lib/config.ts</code> 中配置 Giscus</p>
            <p>3. 访问 <a href="https://giscus.app/zh-CN" target="_blank" rel="noopener noreferrer" className="elegant-link">giscus.app</a> 获取配置参数</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="mt-8">
      <h3 className="heading-font text-base font-semibold mb-6 text-gray-900 dark:text-gray-100">
        评论
      </h3>
      
      {/* Giscus 评论组件容器 */}
      <div 
        ref={ref}
        className="giscus-container"
        style={{
          minHeight: '200px', // 防止布局跳动
        }}
      />
      
      {/* 加载提示 */}
      <div className="text-center mt-4">
        <p className="text-xs text-gray-500 dark:text-gray-500">
          评论由 <a 
            href="https://giscus.app/zh-CN" 
            target="_blank" 
            rel="noopener noreferrer"
            className="elegant-link"
          >
            Giscus
          </a> 提供支持
        </p>
      </div>
    </section>
  )
}