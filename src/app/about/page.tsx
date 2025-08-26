import { siteConfig } from '@/lib/config'
import Link from 'next/link'

export const metadata = {
  title: '关于',
  description: '了解更多关于我的信息',
}

export default function AboutPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 pb-16">
      {/* 页面标题 - 简洁优雅 */}
      <div className="mb-8">
        <h1 className="heading-font text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          关于我
        </h1>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          {siteConfig.author.bio}
        </p>
      </div>

      {/* 优雅的分割线 */}
      <div className="elegant-divider mb-8" />

      {/* 内容区域 - 专注阅读模式 */}
      <article className="prose reading-mode">
        <div className="space-y-8">
          {/* 简单的自我介绍 */}
          <section>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              欢迎来到我的个人博客！我热爱分享技术心得和生活感悟，
              希望通过文字记录成长的点点滴滴，也期待与志同道合的朋友交流。
            </p>
          </section>

          {/* 技能与兴趣 - 简洁文本形式 */}
          <section>
            <h2 className="heading-font text-base font-medium mb-4 text-gray-900 dark:text-gray-100">
              技术栈
            </h2>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <p>
                <span className="text-gray-900 dark:text-gray-100">前端：</span>
                React, Next.js, TypeScript, Tailwind CSS
              </p>
              <p>
                <span className="text-gray-900 dark:text-gray-100">后端：</span>
                Node.js, Python, Go, PostgreSQL
              </p>
              <p>
                <span className="text-gray-900 dark:text-gray-100">工具：</span>
                Git, VS Code, Docker, Vercel
              </p>
            </div>
          </section>

          {/* 博客相关 */}
          <section>
            <h2 className="heading-font text-base font-medium mb-4 text-gray-900 dark:text-gray-100">
              关于这个博客
            </h2>
            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              <p>
                这个博客使用 <span className="text-gray-900 dark:text-gray-100">Next.js 15</span> 和 
                <span className="text-gray-900 dark:text-gray-100"> Tailwind CSS</span> 构建，
                支持 Markdown 文章，具有响应式设计和暗色模式。
              </p>
              <p>
                我会在这里分享技术教程、开源项目、行业观察和生活感悟。
              </p>
            </div>
          </section>

          {/* 联系方式 - 简洁版本 */}
          <section>
            <h2 className="heading-font text-base font-medium mb-4 text-gray-900 dark:text-gray-100">
              联系方式
            </h2>
            <div className="space-y-2 text-sm">
              {siteConfig.author.social.github && (
                <div>
                  <span className="text-gray-500 dark:text-gray-500">GitHub:</span>{' '}
                  <Link
                    href={siteConfig.author.social.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="elegant-link"
                  >
                    {siteConfig.author.social.github.replace('https://github.com/', '@')}
                  </Link>
                </div>
              )}
              {siteConfig.author.social.twitter && (
                <div>
                  <span className="text-gray-500 dark:text-gray-500">Twitter:</span>{' '}
                  <Link
                    href={siteConfig.author.social.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="elegant-link"
                  >
                    {siteConfig.author.social.twitter.replace('https://twitter.com/', '@')}
                  </Link>
                </div>
              )}
              {siteConfig.author.social.email && (
                <div>
                  <span className="text-gray-500 dark:text-gray-500">Email:</span>{' '}
                  <Link
                    href={`mailto:${siteConfig.author.social.email}`}
                    className="elegant-link"
                  >
                    {siteConfig.author.social.email}
                  </Link>
                </div>
              )}
            </div>
          </section>
        </div>
      </article>

      {/* 底部优雅装饰 */}
      <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-500">
          感谢您的阅读
        </p>
      </div>
    </main>
  )
}