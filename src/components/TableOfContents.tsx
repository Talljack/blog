'use client'

import { useState, useEffect, useRef } from 'react'
import { List } from 'lucide-react'
import type { TableOfContentsItem } from '@/types/blog'

interface TableOfContentsProps {
  content: string
  className?: string
  maxDepth?: number
  position?: 'sticky' | 'fixed' | 'static'
}

export default function TableOfContents({
  content,
  className = '',
  maxDepth = 4,
  position = 'sticky',
}: TableOfContentsProps) {
  const [toc, setToc] = useState<TableOfContentsItem[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const observerRef = useRef<IntersectionObserver | null>(null)

  // 从HTML内容中提取目录结构
  useEffect(() => {
    const extractTOC = (htmlContent: string): TableOfContentsItem[] => {
      const parser = new DOMParser()
      const doc = parser.parseFromString(htmlContent, 'text/html')
      const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6')

      const tocItems: TableOfContentsItem[] = []
      const stack: { item: TableOfContentsItem; level: number }[] = []

      headings.forEach((heading, index) => {
        const level = parseInt(heading.tagName.charAt(1))
        if (level > maxDepth) return

        const id = heading.id || `heading-${index}`
        const title = heading.textContent || ''

        // 如果标题没有ID，为其添加ID
        if (!heading.id) {
          heading.id = id
        }

        const tocItem: TableOfContentsItem = {
          id,
          title,
          level,
          children: [],
        }

        // 处理层级关系
        while (stack.length > 0 && stack[stack.length - 1].level >= level) {
          stack.pop()
        }

        if (stack.length === 0) {
          tocItems.push(tocItem)
        } else {
          const parent = stack[stack.length - 1].item
          parent.children = parent.children || []
          parent.children.push(tocItem)
        }

        stack.push({ item: tocItem, level })
      })

      return tocItems
    }

    if (content) {
      const tocData = extractTOC(content)
      setToc(tocData)
    }
  }, [content, maxDepth])

  // 滚动监听，高亮当前章节
  useEffect(() => {
    const headingElements = Array.from(
      document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    )
      .filter(el => el.id)
      .slice(0, maxDepth * 10) // 防止过多元素

    if (headingElements.length === 0) return

    observerRef.current = new IntersectionObserver(
      entries => {
        const visibleHeadings = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => {
            const aRect = a.boundingClientRect
            const bRect = b.boundingClientRect
            return Math.abs(aRect.top) - Math.abs(bRect.top)
          })

        if (visibleHeadings.length > 0) {
          setActiveId(visibleHeadings[0].target.id)
        }
      },
      {
        rootMargin: '-80px 0px -80% 0px',
        threshold: 0.1,
      }
    )

    headingElements.forEach(el => {
      observerRef.current?.observe(el)
    })

    return () => {
      observerRef.current?.disconnect()
    }
  }, [toc, maxDepth])

  // 点击目录项跳转
  const handleTOCClick = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offsetTop = element.offsetTop - 100 // 考虑固定头部
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth',
      })
      setActiveId(id)
    }
  }

  // 渲染目录项
  const renderTOCItem = (
    item: TableOfContentsItem,
    depth = 0
  ): React.ReactNode => {
    const isActive = activeId === item.id
    const hasChildren = item.children && item.children.length > 0

    return (
      <li key={item.id} className={`${depth > 0 ? `ml-${depth * 3}` : ''}`}>
        <button
          onClick={() => handleTOCClick(item.id)}
          className={`
            w-full text-left text-xs lg:text-sm transition-all duration-200
            hover:text-blue-600 dark:hover:text-blue-400
            ${
              isActive
                ? 'text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/30'
                : 'text-gray-600 dark:text-gray-400'
            }
            px-2 py-1 lg:py-1.5 rounded-md block
          `}
          title={item.title}
        >
          <span className='line-clamp-2 leading-3 lg:leading-4'>
            {item.title}
          </span>
        </button>

        {hasChildren && (
          <ul className='mt-0.5 space-y-0.5'>
            {item.children?.map(child => renderTOCItem(child, depth + 1))}
          </ul>
        )}
      </li>
    )
  }

  if (toc.length === 0) {
    return null
  }

  const positionClasses = {
    sticky: 'sticky top-20',
    fixed: 'fixed top-20 right-4 z-30',
    static: 'static',
  }

  return (
    <nav
      className={`
        ${positionClasses[position]}
        w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md
        border border-gray-200/50 dark:border-gray-700/50
        rounded-xl shadow-xl p-3 lg:p-4
        max-h-[min(60vh,400px)] lg:max-h-[calc(100vh-200px)] overflow-y-auto
        text-sm lg:text-base
        ${className}
      `}
      aria-label='目录导航'
    >
      {/* 头部 */}
      <div className='flex items-center gap-2 mb-4'>
        <List className='w-4 h-4 text-blue-500' />
        <h3 className='font-semibold text-gray-900 dark:text-gray-100 text-sm'>
          目录
        </h3>
      </div>

      {/* 目录内容 */}
      <ul className='space-y-0.5'>{toc.map(item => renderTOCItem(item))}</ul>
    </nav>
  )
}

// 简化版移动端TOC
interface MobileTOCProps {
  content: string
  maxDepth?: number
}

export function MobileTableOfContents({
  content,
  maxDepth = 3,
}: MobileTOCProps) {
  const [toc, setToc] = useState<TableOfContentsItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    // 提取TOC逻辑（简化版）
    const parser = new DOMParser()
    const doc = parser.parseFromString(content, 'text/html')
    const headings = doc.querySelectorAll('h1, h2, h3, h4')

    const tocItems: TableOfContentsItem[] = Array.from(headings)
      .slice(0, maxDepth * 3)
      .map((heading, index) => ({
        id: heading.id || `heading-${index}`,
        title: heading.textContent || '',
        level: parseInt(heading.tagName.charAt(1)),
      }))

    setToc(tocItems)
  }, [content, maxDepth])

  const handleItemClick = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveId(id)
      setIsOpen(false)
    }
  }

  if (toc.length === 0) return null

  return (
    <>
      {/* 移动端触发按钮 */}
      <button
        onClick={() => setIsOpen(true)}
        className='md:hidden fixed bottom-20 left-4 z-40 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center'
        aria-label='打开目录'
      >
        <List className='w-6 h-6' />
      </button>

      {/* 全屏抽屉 */}
      {isOpen && (
        <div className='md:hidden fixed inset-0 z-50 bg-white dark:bg-gray-900 mobile-toc-drawer'>
          <div className='flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700'>
            <h2 className='text-base font-semibold'>目录</h2>
            <button
              onClick={() => setIsOpen(false)}
              className='w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-800 transition-colors'
              aria-label='关闭目录'
            >
              ✕
            </button>
          </div>

          <div className='p-3 overflow-y-auto max-h-[calc(100vh-80px)] mobile-toc-content'>
            <ul className='space-y-1'>
              {toc.map(item => (
                <li key={item.id}>
                  <button
                    onClick={() => handleItemClick(item.id)}
                    className={`
                      w-full text-left p-2 rounded-md transition-colors text-sm
                      ${
                        activeId === item.id
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }
                    `}
                    style={{ marginLeft: `${(item.level - 1) * 12}px` }}
                  >
                    <span className='line-clamp-2 leading-5'>{item.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  )
}
