import Link from 'next/link'
import { getAllPosts, getFeaturedPosts } from '@/lib/blog'
import { siteConfig } from '@/lib/config'
import BlogCard from '@/components/BlogCard'
import { ArrowRight } from 'lucide-react'

export default async function HomePage() {
  const [allPosts, featuredPosts] = await Promise.all([
    getAllPosts(),
    getFeaturedPosts()
  ])

  const recentPosts = allPosts.slice(0, 6)

  return (
    <div className="container mx-auto py-8 px-4 space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            欢迎来到{siteConfig.name}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {siteConfig.description}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/blog"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            浏览博客
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            了解更多
          </Link>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">推荐阅读</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredPosts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* Recent Posts */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">最近文章</h2>
          <Link
            href="/blog"
            className="inline-flex items-center text-sm font-medium hover:underline"
          >
            查看全部
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {recentPosts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      </section>

      {/* Empty State */}
      {allPosts.length === 0 && (
        <section className="text-center py-12">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">还没有文章</h2>
            <p className="text-muted-foreground">
              开始创建你的第一篇博客文章吧！
            </p>
            <p className="text-sm text-muted-foreground">
              在 <code className="bg-muted px-1 py-0.5 rounded">src/content/blog</code> 目录下创建 Markdown 文件
            </p>
          </div>
        </section>
      )}
    </div>
  )
}