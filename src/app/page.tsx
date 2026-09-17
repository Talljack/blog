import Link from 'next/link'
import { ArrowUpRight, Github } from 'lucide-react'
import BlogCard from '@/components/BlogCard'
import Newsletter from '@/components/Newsletter'
import { featuredProjects, openSourceProjects } from '@/data/projects'
import { getAllPosts, getFeaturedPosts } from '@/lib/blog'

const accentClasses = {
  lime: 'bg-lime-300 text-stone-950',
  amber: 'bg-amber-300 text-stone-950',
  sky: 'bg-sky-300 text-stone-950',
}

export default async function HomePage() {
  const [allPosts, featuredPosts] = await Promise.all([
    getAllPosts(),
    getFeaturedPosts(),
  ])

  const recentPosts = allPosts
    .filter(
      post => !featuredPosts.some(featured => featured.slug === post.slug)
    )
    .slice(0, 4)

  return (
    <div className='mx-auto max-w-5xl px-6 pb-20 sm:px-8'>
      <section className='grid gap-12 border-b border-stone-300/70 pb-16 pt-8 dark:border-white/10 md:grid-cols-[minmax(0,1.7fr)_minmax(15rem,0.8fr)] md:items-end md:pt-14'>
        <div className='fade-in'>
          <p className='code-font mb-5 text-xs font-medium tracking-[0.16em] text-stone-500 dark:text-stone-400'>
            INDEPENDENT BUILDER · CHINA → THE INTERNET
          </p>
          <h1 className='heading-font max-w-3xl text-balance text-[2rem] font-semibold leading-[1.15] tracking-[-0.022em] text-stone-950 dark:text-stone-100 sm:text-5xl sm:leading-[1.08] lg:text-[3.5rem]'>
            把值得解决的问题，
            <span className='block text-stone-500 dark:text-stone-400'>
              做成真正可用的产品。
            </span>
          </h1>
          <p className='mt-7 max-w-2xl text-pretty text-base leading-8 text-stone-600 dark:text-stone-300 sm:text-lg'>
            我是 Talljack，一名全栈独立开发者。我持续交付 AI
            产品、开发者工具和原生应用，关注学习效率、个人生产力与本地优先的软件体验。
          </p>
          <div className='mt-8 flex flex-wrap items-center gap-4'>
            <a
              href='#work'
              className='inline-flex min-h-10 items-center gap-2 rounded-lg bg-lime-300 px-4 py-2 text-sm font-semibold text-stone-950 transition-transform duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 focus-visible:ring-offset-2 dark:ring-offset-stone-950'
            >
              查看正在做的产品
              <ArrowUpRight aria-hidden='true' className='h-4 w-4' />
            </a>
            <a
              href='https://github.com/Talljack'
              target='_blank'
              rel='noreferrer'
              className='inline-flex min-h-10 items-center gap-2 px-1 py-2 text-sm font-medium text-stone-600 underline decoration-stone-300 underline-offset-4 transition-colors hover:text-stone-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 dark:text-stone-300 dark:decoration-stone-600 dark:hover:text-white'
            >
              <Github aria-hidden='true' className='h-4 w-4' />
              GitHub / Talljack
            </a>
          </div>
        </div>

        <aside className='border-t border-stone-300/70 pt-6 dark:border-white/10 md:border-l md:border-t-0 md:pl-8 md:pt-0'>
          <p className='code-font text-[11px] tracking-[0.18em] text-stone-500 dark:text-stone-400'>
            BUILD LOG
          </p>
          <dl className='mt-5 space-y-5'>
            <div>
              <dt className='text-3xl font-semibold tabular-nums text-stone-950 dark:text-stone-100'>
                200+
              </dt>
              <dd className='mt-1 text-sm text-stone-500 dark:text-stone-400'>
                EchoType GitHub Stars
              </dd>
            </div>
            <div>
              <dt className='text-3xl font-semibold tabular-nums text-stone-950 dark:text-stone-100'>
                100+
              </dt>
              <dd className='mt-1 text-sm text-stone-500 dark:text-stone-400'>
                公开代码仓库
              </dd>
            </div>
            <div>
              <dt className='text-3xl font-semibold tabular-nums text-stone-950 dark:text-stone-100'>
                2017 →
              </dt>
              <dd className='mt-1 text-sm text-stone-500 dark:text-stone-400'>
                持续构建与开源
              </dd>
            </div>
          </dl>
        </aside>
      </section>

      <section id='work' className='scroll-mt-10 py-16'>
        <div className='mb-9 flex items-end justify-between gap-6'>
          <div>
            <p className='code-font text-xs tracking-[0.16em] text-stone-500 dark:text-stone-400'>
              01 / SELECTED WORK
            </p>
            <h2 className='heading-font mt-3 text-2xl font-semibold tracking-[-0.012em] text-stone-950 dark:text-stone-100 sm:text-3xl'>
              正在交付的产品
            </h2>
          </div>
          <span className='hidden items-center gap-2 text-xs text-stone-500 sm:flex'>
            <span className='h-2 w-2 rounded-full bg-lime-400' />
            actively maintained
          </span>
        </div>

        <div className='space-y-5'>
          {featuredProjects.map((project, index) => (
            <article
              key={project.name}
              className={`group grid gap-7 rounded-xl p-6 transition-transform duration-300 motion-safe:[@media(hover:hover)]:hover:-translate-y-1 sm:p-8 md:grid-cols-[minmax(0,1fr)_auto] ${
                index === 0
                  ? 'bg-white shadow-[0_12px_40px_rgba(28,25,23,0.10)] dark:bg-white/[0.05] dark:shadow-none'
                  : 'bg-stone-100/80 dark:bg-white/[0.025]'
              }`}
            >
              <div>
                <div className='flex flex-wrap items-center gap-3'>
                  <span
                    className={`code-font rounded px-2 py-1 text-[10px] font-bold tracking-[0.12em] ${accentClasses[project.accent]}`}
                  >
                    {project.eyebrow}
                  </span>
                  <span className='code-font text-[11px] text-stone-500 dark:text-stone-400'>
                    {project.signal}
                  </span>
                </div>
                <h3 className='heading-font mt-5 text-3xl font-semibold tracking-[-0.018em] text-stone-950 dark:text-stone-100'>
                  {project.name}
                </h3>
                <p className='mt-3 max-w-2xl text-pretty leading-7 text-stone-600 dark:text-stone-300'>
                  {project.description}
                </p>
                <ul className='mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-stone-500 dark:text-stone-400'>
                  {project.stack.map(item => (
                    <li key={item}>· {item}</li>
                  ))}
                </ul>
              </div>

              <div className='flex min-w-36 flex-row items-end gap-4 md:flex-col md:justify-between'>
                <span className='code-font text-xs text-stone-400'>
                  0{index + 1}
                </span>
                <div className='flex flex-wrap gap-3 md:flex-col md:items-end'>
                  {project.productHref && (
                    <a
                      href={project.productHref}
                      target='_blank'
                      rel='noreferrer'
                      className='inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-stone-950 underline decoration-lime-400 decoration-2 underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 dark:text-stone-100'
                    >
                      {project.productLabel}
                      <ArrowUpRight aria-hidden='true' className='h-4 w-4' />
                    </a>
                  )}
                  <a
                    href={project.href}
                    target='_blank'
                    rel='noreferrer'
                    className='inline-flex min-h-10 items-center gap-1.5 text-sm text-stone-500 transition-colors hover:text-stone-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 dark:text-stone-400 dark:hover:text-white'
                  >
                    源码
                    <ArrowUpRight aria-hidden='true' className='h-3.5 w-3.5' />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className='border-t border-stone-300/70 py-16 dark:border-white/10'>
        <div className='grid gap-10 md:grid-cols-[0.7fr_1.3fr]'>
          <div>
            <p className='code-font text-xs tracking-[0.16em] text-stone-500 dark:text-stone-400'>
              02 / OPEN SOURCE
            </p>
            <h2 className='heading-font mt-3 text-2xl font-semibold tracking-[-0.012em] text-stone-950 dark:text-stone-100'>
              把重复工作，沉淀成公共工具。
            </h2>
            <p className='mt-4 text-sm leading-7 text-stone-500 dark:text-stone-400'>
              从 Agent Skills、MCP
              到编辑器插件，我更愿意把可复用的部分留下来，让下一次构建更快。
            </p>
          </div>

          <div className='divide-y divide-stone-300/70 border-y border-stone-300/70 dark:divide-white/10 dark:border-white/10'>
            {openSourceProjects.map(project => (
              <a
                key={project.name}
                href={project.href}
                target='_blank'
                rel='noreferrer'
                className='group grid min-h-24 grid-cols-[1fr_auto] items-center gap-5 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 sm:grid-cols-[0.65fr_1.35fr_auto]'
              >
                <strong className='font-semibold text-stone-900 transition-colors group-hover:text-lime-700 dark:text-stone-100 dark:group-hover:text-lime-300'>
                  {project.name}
                </strong>
                <span className='hidden text-sm leading-6 text-stone-500 dark:text-stone-400 sm:block'>
                  {project.description}
                </span>
                <span className='code-font flex items-center gap-2 text-[10px] tracking-[0.1em] text-stone-400'>
                  {project.meta}
                  <ArrowUpRight
                    aria-hidden='true'
                    className='h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5'
                  />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className='border-t border-stone-300/70 py-16 dark:border-white/10'>
        <div className='mb-7 flex items-end justify-between gap-5'>
          <div>
            <p className='code-font text-xs tracking-[0.16em] text-stone-500 dark:text-stone-400'>
              03 / WRITING
            </p>
            <h2 className='heading-font mt-3 text-2xl font-semibold tracking-[-0.012em] text-stone-950 dark:text-stone-100'>
              构建笔记
            </h2>
          </div>
          <Link
            href='/blog'
            className='inline-flex min-h-10 items-center gap-1.5 text-sm text-stone-600 transition-colors hover:text-stone-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 dark:text-stone-300 dark:hover:text-white'
          >
            所有文章
            <ArrowUpRight aria-hidden='true' className='h-4 w-4' />
          </Link>
        </div>

        <div className='space-y-0'>
          {[...featuredPosts, ...recentPosts].slice(0, 5).map(post => (
            <BlogCard key={post.slug} post={post} showDescription />
          ))}
        </div>
      </section>

      <section className='border-t border-stone-300/70 pt-14 dark:border-white/10'>
        <Newsletter
          variant='card'
          title='订阅我的构建日志'
          description='获取新产品、开源工具和工程实践更新。不定期发送，只写值得分享的内容。'
        />
      </section>
    </div>
  )
}
