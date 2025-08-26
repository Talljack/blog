import { siteConfig } from '@/lib/config'
import { Github, Twitter, Mail } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: '关于',
  description: '了解更多关于我的信息',
}

export default function AboutPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">关于我</h1>
          <p className="text-xl text-muted-foreground">
            {siteConfig.author.bio}
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <div className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Hello, World! 👋</h2>
              <p>
                欢迎来到我的个人博客！我是一名{siteConfig.author.bio}，
                热爱分享技术心得和生活感悟。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">我的技能</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-muted">
                  <h3 className="font-medium">前端开发</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    React, Next.js, TypeScript
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <h3 className="font-medium">后端开发</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Node.js, Python, Go
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <h3 className="font-medium">数据库</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    MySQL, PostgreSQL, MongoDB
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <h3 className="font-medium">云服务</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    AWS, Vercel, Docker
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <h3 className="font-medium">工具</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Git, VS Code, Linux
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <h3 className="font-medium">其他</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    AI/ML, 区块链, DevOps
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">关于这个博客</h2>
              <p>
                这个博客使用 <strong>Next.js 15</strong> 和 <strong>Tailwind CSS</strong> 构建，
                支持 Markdown/MDX 文章，具有响应式设计和暗色模式。
              </p>
              <p>
                我会在这里分享：
              </p>
              <ul>
                <li>技术教程和实践经验</li>
                <li>开源项目和代码分享</li>
                <li>行业观察和思考</li>
                <li>生活感悟和个人成长</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">联系我</h2>
              <p>
                如果你想与我交流，可以通过以下方式联系我：
              </p>
              <div className="flex flex-wrap gap-4 mt-4">
                {siteConfig.author.social.github && (
                  <Link
                    href={siteConfig.author.social.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 rounded-md bg-muted px-4 py-2 text-sm font-medium hover:bg-muted/80 transition-colors"
                  >
                    <Github className="h-4 w-4" />
                    <span>GitHub</span>
                  </Link>
                )}
                {siteConfig.author.social.twitter && (
                  <Link
                    href={siteConfig.author.social.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 rounded-md bg-muted px-4 py-2 text-sm font-medium hover:bg-muted/80 transition-colors"
                  >
                    <Twitter className="h-4 w-4" />
                    <span>Twitter</span>
                  </Link>
                )}
                {siteConfig.author.social.email && (
                  <Link
                    href={`mailto:${siteConfig.author.social.email}`}
                    className="inline-flex items-center space-x-2 rounded-md bg-muted px-4 py-2 text-sm font-medium hover:bg-muted/80 transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </Link>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}