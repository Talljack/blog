import { getAllPosts, getAllTags } from '@/lib/blog'
import BlogCard from '@/components/BlogCard'
import { Search, Filter } from 'lucide-react'

export const metadata = {
  title: '博客',
  description: '浏览所有博客文章',
}

export default async function BlogPage() {
  const [allPosts, allTags] = await Promise.all([
    getAllPosts(),
    getAllTags()
  ])

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">博客</h1>
        <p className="text-muted-foreground">
          共 {allPosts.length} 篇文章
        </p>
      </div>

      {/* Search and Filter (placeholder for future implementation) */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索文章..."
            className="w-full rounded-md border border-input bg-background pl-10 pr-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <select
            className="appearance-none rounded-md border border-input bg-background pl-10 pr-8 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled
          >
            <option>所有标签</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Posts Grid */}
      {allPosts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {allPosts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">还没有文章</h2>
            <p className="text-muted-foreground">
              开始创建你的第一篇博客文章吧！
            </p>
            <p className="text-sm text-muted-foreground">
              在 <code className="bg-muted px-1 py-0.5 rounded">src/content/blog</code> 目录下创建 Markdown 文件
            </p>
          </div>
        </div>
      )}
    </div>
  )
}