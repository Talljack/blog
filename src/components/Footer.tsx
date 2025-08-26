import { siteConfig } from '@/lib/config'

export default function Footer() {
  return (
    <footer className="mt-16 py-8 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-2xl mx-auto px-6">
        <div className="text-center space-y-4">
          {/* 版权信息 */}
          <div className="text-xs text-gray-500 dark:text-gray-500">
            <p>
              © {new Date().getFullYear()} {siteConfig.author.name}. 保留所有权利。
            </p>
          </div>
          
          {/* 技术栈信息 */}
          <div className="text-xs text-gray-400 dark:text-gray-600">
            <p>
              使用 <span className="font-medium">Next.js</span> 构建，部署在 <span className="font-medium">Vercel</span>
            </p>
          </div>

          {/* 优雅的装饰 */}
          <div className="flex justify-center">
            <div className="w-12 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />
          </div>
        </div>
      </div>
    </footer>
  )
}