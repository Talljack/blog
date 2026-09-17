import { ArrowUpRight, Github } from 'lucide-react'
import { featuredProjects } from '@/data/projects'
import { siteConfig } from '@/lib/config'

export const metadata = {
  title: '关于 Talljack',
  description:
    'Talljack 是一名独立开发者，持续构建 AI 产品、开发者工具与原生应用。',
}

const principles = [
  ['从问题开始', '先找到真实工作流中的摩擦，再决定技术和产品形态。'],
  [
    '尽快交付闭环',
    '先让核心路径可用，然后从真实使用中学习，而不是停留在概念里。',
  ],
  ['本地与隐私优先', '能留在设备上的数据，就不要求用户交给云端。'],
  ['开放可复用部分', '把通用能力沉淀为 Skills、MCP、插件或开源库。'],
]

export default function AboutPage() {
  return (
    <div className='mx-auto max-w-4xl px-6 pb-20 sm:px-8'>
      <header className='grid gap-10 border-b border-stone-300/70 pb-14 pt-8 dark:border-white/10 md:grid-cols-[0.7fr_1.3fr] md:pt-14'>
        <div>
          <p className='code-font text-xs tracking-[0.16em] text-stone-500 dark:text-stone-400'>
            ABOUT / TALLJACK
          </p>
          <h1 className='heading-font mt-4 text-4xl font-semibold tracking-[-0.022em] text-stone-950 dark:text-stone-100 sm:text-5xl'>
            一个持续把想法做出来的人。
          </h1>
        </div>
        <div className='space-y-5 text-pretty text-base leading-8 text-stone-600 dark:text-stone-300 sm:text-lg'>
          <p>
            我是 Talljack，一名来自中国的全栈独立开发者。我的工作横跨
            Web、桌面端、macOS 原生应用、AI 与开发者基础设施。
          </p>
          <p>
            我喜欢那些范围明确、能真正改变日常体验的软件：帮助语言学习者形成练习闭环，帮助
            Mac 用户找回被刘海挤走的菜单栏，也帮助开发者少做一次重复劳动。
          </p>
        </div>
      </header>

      <section className='grid gap-10 border-b border-stone-300/70 py-14 dark:border-white/10 md:grid-cols-[0.7fr_1.3fr]'>
        <div>
          <p className='code-font text-xs tracking-[0.16em] text-stone-500 dark:text-stone-400'>
            CURRENT FOCUS
          </p>
          <h2 className='heading-font mt-3 text-2xl font-semibold text-stone-950 dark:text-stone-100'>
            当前关注
          </h2>
        </div>
        <div className='divide-y divide-stone-300/70 border-y border-stone-300/70 dark:divide-white/10 dark:border-white/10'>
          {featuredProjects.map((project, index) => (
            <a
              key={project.name}
              href={project.productHref || project.href}
              target='_blank'
              rel='noreferrer'
              className='group grid grid-cols-[2rem_1fr_auto] gap-4 py-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500'
            >
              <span className='code-font text-xs text-stone-400'>
                0{index + 1}
              </span>
              <div>
                <h3 className='text-lg font-semibold text-stone-950 dark:text-stone-100'>
                  {project.name}
                </h3>
                <p className='mt-2 text-sm leading-6 text-stone-500 dark:text-stone-400'>
                  {project.description}
                </p>
              </div>
              <ArrowUpRight
                aria-hidden='true'
                className='h-4 w-4 text-stone-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5'
              />
            </a>
          ))}
        </div>
      </section>

      <section className='grid gap-10 border-b border-stone-300/70 py-14 dark:border-white/10 md:grid-cols-[0.7fr_1.3fr]'>
        <div>
          <p className='code-font text-xs tracking-[0.16em] text-stone-500 dark:text-stone-400'>
            PRINCIPLES
          </p>
          <h2 className='heading-font mt-3 text-2xl font-semibold text-stone-950 dark:text-stone-100'>
            我如何构建
          </h2>
        </div>
        <ol className='space-y-8'>
          {principles.map(([title, description], index) => (
            <li key={title} className='grid grid-cols-[2rem_1fr] gap-4'>
              <span className='code-font pt-1 text-xs text-lime-700 dark:text-lime-300'>
                0{index + 1}
              </span>
              <div>
                <h3 className='font-semibold text-stone-950 dark:text-stone-100'>
                  {title}
                </h3>
                <p className='mt-2 leading-7 text-stone-600 dark:text-stone-300'>
                  {description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className='grid gap-10 py-14 md:grid-cols-[0.7fr_1.3fr]'>
        <div>
          <p className='code-font text-xs tracking-[0.16em] text-stone-500 dark:text-stone-400'>
            CONTACT
          </p>
          <h2 className='heading-font mt-3 text-2xl font-semibold text-stone-950 dark:text-stone-100'>
            一起交流
          </h2>
        </div>
        <div>
          <p className='max-w-xl text-pretty leading-7 text-stone-600 dark:text-stone-300'>
            如果你也在做开发者工具、AI 产品、语言学习或 macOS
            应用，欢迎分享你的问题与实践。我尤其乐意讨论真实用户反馈、产品取舍和开源协作。
          </p>
          <div className='mt-7 flex flex-wrap gap-5'>
            <a
              href={siteConfig.author.social.github}
              target='_blank'
              rel='noreferrer'
              className='inline-flex min-h-10 items-center gap-2 rounded-lg bg-lime-300 px-4 py-2 text-sm font-semibold text-stone-950 transition-transform duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 focus-visible:ring-offset-2 dark:ring-offset-stone-950'
            >
              <Github aria-hidden='true' className='h-4 w-4' />在 GitHub
              上找到我
            </a>
            <a
              href={siteConfig.author.social.twitter}
              target='_blank'
              rel='noreferrer'
              className='inline-flex min-h-10 items-center gap-1.5 px-1 py-2 text-sm font-medium text-stone-600 underline decoration-stone-300 underline-offset-4 transition-colors hover:text-stone-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 dark:text-stone-300 dark:decoration-stone-600 dark:hover:text-white'
            >
              在 X 上关注构建进展
              <ArrowUpRight aria-hidden='true' className='h-4 w-4' />
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
