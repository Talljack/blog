'use client'

import { useState } from 'react'
import { Printer, Download, Eye } from 'lucide-react'

interface PrintButtonProps {
  title: string
  content: string
  author?: string
  publishDate?: string
  tags?: string[]
  className?: string
}

export default function PrintButton({
  title,
  content,
  author = '',
  publishDate = '',
  tags = [],
  className = '',
}: PrintButtonProps) {
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)

  // 打印文章
  const handlePrint = () => {
    setIsPrinting(true)

    // 创建打印窗口
    const printWindow = window.open('', '_blank', 'width=800,height=600')
    if (!printWindow) {
      setIsPrinting(false)
      return
    }

    // 生成打印页面HTML
    const printHTML = generatePrintHTML({
      title,
      content,
      author,
      publishDate,
      tags,
    })

    printWindow.document.write(printHTML)
    printWindow.document.close()

    // 等待内容加载完成后打印
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
        setIsPrinting(false)
      }, 500)
    }
  }

  // 导出为PDF（使用浏览器内置功能）
  const handleExportPDF = () => {
    const printStyles = `
      <style>
        @media print {
          @page { margin: 2cm; }
          body { font-family: 'Times New Roman', serif; line-height: 1.6; }
          .no-print { display: none !important; }
        }
      </style>
    `

    const newWindow = window.open('', '_blank')
    if (newWindow) {
      newWindow.document.write(
        generatePrintHTML(
          {
            title,
            content,
            author,
            publishDate,
            tags,
          },
          printStyles
        )
      )
      newWindow.document.close()

      setTimeout(() => {
        newWindow.print()
      }, 500)
    }
  }

  // 切换预览模式
  const togglePreview = () => {
    setIsPreviewMode(!isPreviewMode)
    if (!isPreviewMode) {
      // 添加打印预览样式到body
      document.body.classList.add('print-preview-mode')
    } else {
      document.body.classList.remove('print-preview-mode')
    }
  }

  return (
    <>
      {/* 打印按钮组 */}
      <div className={`flex items-center gap-2 ${className}`}>
        <button
          onClick={handlePrint}
          disabled={isPrinting}
          className='flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors'
          title='打印文章'
        >
          <Printer className='w-4 h-4' />
          {isPrinting ? '打印中...' : '打印'}
        </button>

        <button
          onClick={handleExportPDF}
          className='flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors'
          title='导出PDF'
        >
          <Download className='w-4 h-4' />
          导出PDF
        </button>

        <button
          onClick={togglePreview}
          className={`flex items-center gap-2 px-3 py-1.5 text-sm transition-colors rounded-lg ${
            isPreviewMode
              ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
          title='打印预览'
        >
          <Eye className='w-4 h-4' />
          {isPreviewMode ? '退出预览' : '预览'}
        </button>
      </div>

      {/* 预览模式覆盖层 */}
      {isPreviewMode && (
        <div className='fixed inset-0 z-50 bg-gray-100 overflow-auto'>
          <div className='max-w-4xl mx-auto p-4'>
            <div className='mb-4 flex items-center justify-between bg-white rounded-lg p-3 shadow'>
              <h3 className='font-medium text-gray-900'>打印预览</h3>
              <div className='flex gap-2'>
                <button
                  onClick={handlePrint}
                  className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors'
                >
                  打印
                </button>
                <button
                  onClick={togglePreview}
                  className='px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors'
                >
                  关闭预览
                </button>
              </div>
            </div>

            {/* 预览内容 */}
            <div
              className='print-preview bg-white shadow-lg'
              dangerouslySetInnerHTML={{
                __html: generatePrintContent({
                  title,
                  content,
                  author,
                  publishDate,
                  tags,
                }),
              }}
            />
          </div>
        </div>
      )}
    </>
  )
}

// 生成完整的打印HTML
function generatePrintHTML(
  {
    title,
    content,
    author,
    publishDate,
    tags,
  }: {
    title: string
    content: string
    author: string
    publishDate: string
    tags: string[]
  },
  additionalStyles = ''
) {
  return `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        /* 基础打印样式 */
        @media print {
          @page {
            margin: 2cm 1.5cm;
            size: A4;
            @bottom-center {
              content: '第 ' counter(page) ' 页';
              font-size: 10pt;
              color: #666;
            }
          }
          
          * {
            background: transparent !important;
            color: black !important;
            box-shadow: none !important;
          }
          
          body {
            font-family: 'Times New Roman', serif;
            font-size: 12pt;
            line-height: 1.6;
            color: black;
            margin: 0;
            padding: 0;
          }
          
          .print-header {
            border-bottom: 2pt solid #333;
            padding-bottom: 12pt;
            margin-bottom: 20pt;
          }
          
          .print-title {
            font-size: 24pt;
            font-weight: bold;
            margin-bottom: 8pt;
            color: black;
          }
          
          .print-meta {
            font-size: 10pt;
            color: #666;
            margin-bottom: 4pt;
          }
          
          .print-tags {
            margin-top: 8pt;
          }
          
          .print-tag {
            display: inline-block;
            background: #f0f0f0 !important;
            color: #333 !important;
            padding: 2pt 4pt;
            margin-right: 4pt;
            border: 1pt solid #ccc;
            font-size: 9pt;
          }
          
          .print-content {
            line-height: 1.8;
            text-align: justify;
          }
          
          .print-content h1,
          .print-content h2,
          .print-content h3,
          .print-content h4,
          .print-content h5,
          .print-content h6 {
            color: black !important;
            margin-top: 16pt;
            margin-bottom: 8pt;
            page-break-after: avoid;
          }
          
          .print-content p {
            margin-bottom: 8pt;
            orphans: 3;
            widows: 3;
          }
          
          .print-content pre,
          .print-content code {
            background: #f8f8f8 !important;
            border: 1pt solid #ddd;
            color: black !important;
          }
          
          .print-content pre {
            padding: 8pt;
            margin: 8pt 0;
            overflow: visible;
            white-space: pre-wrap;
            page-break-inside: avoid;
          }
          
          .print-content img {
            max-width: 100% !important;
            height: auto !important;
            display: block;
            margin: 8pt auto;
            page-break-inside: avoid;
          }
          
          .print-content blockquote {
            margin: 12pt 2em;
            padding: 8pt 12pt;
            border-left: 3pt solid #333;
            background: #f9f9f9 !important;
            font-style: italic;
            page-break-inside: avoid;
          }
          
          .print-content table {
            width: 100%;
            border-collapse: collapse;
            margin: 12pt 0;
            page-break-inside: avoid;
          }
          
          .print-content th,
          .print-content td {
            border: 1pt solid #333;
            padding: 4pt 6pt;
          }
          
          .print-content th {
            background: #f0f0f0 !important;
            font-weight: bold;
          }
        }
        
        /* 屏幕显示样式 */
        @media screen {
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            max-width: 21cm;
            margin: 20px auto;
            padding: 2cm 1.5cm;
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            min-height: 29.7cm;
          }
        }
        
        ${additionalStyles}
      </style>
    </head>
    <body>
      ${generatePrintContent({ title, content, author, publishDate, tags })}
    </body>
    </html>
  `
}

// 生成打印内容
function generatePrintContent({
  title,
  content,
  author,
  publishDate,
  tags,
}: {
  title: string
  content: string
  author: string
  publishDate: string
  tags: string[]
}) {
  const currentDate = new Date().toLocaleDateString('zh-CN')

  return `
    <div class="print-header">
      <h1 class="print-title">${title}</h1>
      ${author && `<div class="print-meta">作者: ${author}</div>`}
      ${publishDate && `<div class="print-meta">发布时间: ${publishDate}</div>`}
      <div class="print-meta">打印时间: ${currentDate}</div>
      ${
        tags.length > 0 &&
        `
        <div class="print-tags">
          标签: ${tags.map(tag => `<span class="print-tag">#${tag}</span>`).join(' ')}
        </div>
      `
      }
    </div>
    
    <div class="print-content">
      ${content}
    </div>
    
    <div style="margin-top: 20pt; text-align: center; font-size: 10pt; color: #666; border-top: 1pt solid #ccc; padding-top: 8pt;">
      — 全文完 —
    </div>
  `
}

// 快速打印按钮组件
interface QuickPrintProps {
  className?: string
}

export function QuickPrint({ className = '' }: QuickPrintProps) {
  const handleQuickPrint = () => {
    window.print()
  }

  return (
    <button
      onClick={handleQuickPrint}
      className={`flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors ${className}`}
      title='快速打印页面'
    >
      <Printer className='w-3 h-3' />
      打印
    </button>
  )
}
