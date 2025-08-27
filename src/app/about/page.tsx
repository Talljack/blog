import { siteConfig } from '@/lib/config'
import Link from 'next/link'

export const metadata = {
  title: '关于我',
  description: `了解更多关于${siteConfig.author.name}的信息，包括技术栈、项目经验和联系方式`,
}

export default function AboutPage() {
  return (
    <main className='max-w-2xl mx-auto px-6 pb-16'>
      {/* 页面标题 - 简洁优雅 */}
      <div className='mb-12'>
        <h1 className='heading-font text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100'>
          关于我
        </h1>
        {siteConfig.author.avatar && (
          <div className='mb-6'>
            <div className='w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-3xl'>
              👨‍💻
            </div>
          </div>
        )}
        <p className='text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-4'>
          {siteConfig.author.bio}
        </p>
        <p className='text-sm text-gray-500 dark:text-gray-500'>
          欢迎来到我的个人博客！
        </p>
      </div>

      {/* 优雅的分割线 */}
      <div className='w-12 h-px bg-gray-200 dark:bg-gray-700 mb-12' />

      {/* 内容区域 - 现代卡片式设计 */}
      <div className='space-y-8'>
        {/* 简单的自我介绍 */}
        <section className='bg-gray-50 dark:bg-gray-900 rounded-lg p-6'>
          <h2 className='heading-font text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100 flex items-center'>
            <span className='mr-2'>👋</span>
            你好
          </h2>
          <p className='text-gray-700 dark:text-gray-300 leading-relaxed'>
            我是一名热爱技术的开发者，专注于创造有意义的数字体验。
            喜欢通过代码解决实际问题，也热爱分享技术心得和生活感悟。
          </p>
          <p className='text-gray-700 dark:text-gray-300 leading-relaxed mt-4'>
            这个博客是我记录成长、分享知识的地方，
            期待与志同道合的朋友们一起交流学习！
          </p>
        </section>

        {/* 技能与兴趣 - 现代标签式 */}
        <section className='bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700'>
          <h2 className='heading-font text-lg font-semibold mb-6 text-gray-900 dark:text-gray-100 flex items-center'>
            <span className='mr-2'>🛠️</span>
            技术栈
          </h2>
          <div className='space-y-6'>
            <div>
              <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3'>
                前端开发
              </h3>
              <div className='flex flex-wrap gap-2'>
                {[
                  'React',
                  'Next.js',
                  'TypeScript',
                  'Tailwind CSS',
                  'Vue.js',
                ].map(tech => (
                  <span
                    key={tech}
                    className='px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full text-sm'
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3'>
                后端开发
              </h3>
              <div className='flex flex-wrap gap-2'>
                {['Node.js', 'Python', 'Go', 'PostgreSQL', 'MongoDB'].map(
                  tech => (
                    <span
                      key={tech}
                      className='px-3 py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-full text-sm'
                    >
                      {tech}
                    </span>
                  )
                )}
              </div>
            </div>
            <div>
              <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3'>
                开发工具
              </h3>
              <div className='flex flex-wrap gap-2'>
                {['Git', 'VS Code', 'Docker', 'Vercel', 'AWS'].map(tech => (
                  <span
                    key={tech}
                    className='px-3 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full text-sm'
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 博客相关 */}
        <section className='bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-6'>
          <h2 className='heading-font text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100 flex items-center'>
            <span className='mr-2'>📝</span>
            关于这个博客
          </h2>
          <div className='space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed'>
            <p>
              这个博客使用现代化技术栈构建：
              <span className='inline-block mx-1 px-2 py-0.5 bg-black dark:bg-white text-white dark:text-black rounded text-xs font-mono'>
                Next.js 15
              </span>
              +
              <span className='inline-block mx-1 px-2 py-0.5 bg-cyan-500 text-white rounded text-xs font-mono'>
                Tailwind CSS
              </span>
            </p>
            <p>
              支持 Markdown 文章、响应式设计、暗色模式，以及现代化的用户体验。
            </p>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              💡 我会在这里分享技术教程、开源项目、行业观察和生活感悟
            </p>
          </div>
        </section>

        {/* 联系方式 - 现代卡片式 */}
        <section className='bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700'>
          <h2 className='heading-font text-lg font-semibold mb-6 text-gray-900 dark:text-gray-100 flex items-center'>
            <span className='mr-2'>📧</span>
            联系我
          </h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {siteConfig.author.social.github && (
              <Link
                href={siteConfig.author.social.github}
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors group'
              >
                <div className='flex-shrink-0 w-10 h-10 bg-black dark:bg-white rounded-full flex items-center justify-center mr-4'>
                  <svg
                    className='w-5 h-5 text-white dark:text-black'
                    viewBox='0 0 24 24'
                    fill='currentColor'
                  >
                    <path d='M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z' />
                  </svg>
                </div>
                <div>
                  <div className='font-medium text-gray-900 dark:text-gray-100'>
                    GitHub
                  </div>
                  <div className='text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'>
                    {siteConfig.author.social.github.replace(
                      'https://github.com/',
                      '@'
                    )}
                  </div>
                </div>
              </Link>
            )}

            {siteConfig.author.social.email && (
              <Link
                href={`mailto:${siteConfig.author.social.email}`}
                className='flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors group'
              >
                <div className='flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-4'>
                  <svg
                    className='w-5 h-5 text-white'
                    viewBox='0 0 24 24'
                    fill='currentColor'
                  >
                    <path d='M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z' />
                  </svg>
                </div>
                <div>
                  <div className='font-medium text-gray-900 dark:text-gray-100'>
                    Email
                  </div>
                  <div className='text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'>
                    {siteConfig.author.social.email}
                  </div>
                </div>
              </Link>
            )}

            {siteConfig.author.social.twitter && (
              <Link
                href={siteConfig.author.social.twitter}
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors group sm:col-span-2'
              >
                <div className='flex-shrink-0 w-10 h-10 bg-black dark:bg-white rounded-full flex items-center justify-center mr-4'>
                  <svg
                    className='w-5 h-5 text-white dark:text-black'
                    viewBox='0 0 24 24'
                    fill='currentColor'
                  >
                    <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
                  </svg>
                </div>
                <div>
                  <div className='font-medium text-gray-900 dark:text-gray-100'>
                    Twitter / X
                  </div>
                  <div className='text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'>
                    {siteConfig.author.social.twitter.replace(
                      'https://twitter.com/',
                      '@'
                    )}
                  </div>
                </div>
              </Link>
            )}
          </div>

          <div className='mt-6 pt-6 border-t border-gray-200 dark:border-gray-600'>
            <p className='text-sm text-gray-600 dark:text-gray-400 text-center'>
              💭 欢迎通过任何方式与我交流，我很乐意结识志同道合的朋友！
            </p>
          </div>
        </section>
      </div>

      {/* 底部优雅装饰 */}
      <div className='mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 text-center'>
        <p className='text-xs text-gray-500 dark:text-gray-500'>感谢您的阅读</p>
      </div>
    </main>
  )
}
