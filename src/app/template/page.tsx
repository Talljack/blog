import Link from 'next/link'
import { getAllTemplates } from '@/lib/templates'

// 使用定义的模板数据
// const templates = [
// 移动到 src/lib/templates.ts 文件中
// ]

export default function TemplatePage() {
  const templates = getAllTemplates()
  
  return (
    <main className="max-w-4xl mx-auto px-6 pb-16">
      <div className="space-y-6">
        {templates.map((template) => (
          <div 
            key={template.id} 
            className="border-b border-gray-200 dark:border-gray-800 pb-6 last:border-b-0"
          >
            <div className="mb-3">
              <Link 
                href={template.link}
                className="heading-font text-lg font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {template.title}
              </Link>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
              {template.description}
            </p>

            {/* 标签 */}
            <div className="flex flex-wrap gap-2 mb-3">
              {template.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-300 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* 项目信息 */}
            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-500">
              <div className="flex items-center">
                <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                {template.stars}
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                {template.language}
              </div>
              <div>更新于 {template.updated}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 更多模板提示 */}
      <div className="mt-12 text-center py-8 border-t border-gray-200 dark:border-gray-800">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          更多模板持续更新中...
        </p>
        <Link 
          href="https://github.com/guangzhengli"
          target="_blank"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          关注 GitHub 获取最新模板
        </Link>
      </div>
    </main>
  )
}