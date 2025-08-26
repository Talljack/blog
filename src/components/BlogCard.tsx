import Link from 'next/link'
import { BlogPostMeta } from '@/lib/blog'
import { formatDateChinese } from '@/lib/utils'
import { Clock, Calendar } from 'lucide-react'

interface BlogCardProps {
  post: BlogPostMeta
}

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="group relative rounded-lg border p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">
            <Link 
              href={`/blog/${post.slug}`}
              className="hover:underline decoration-2 underline-offset-2"
            >
              {post.title}
            </Link>
          </h2>
          <p className="text-muted-foreground line-clamp-2">
            {post.description}
          </p>
        </div>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <time dateTime={post.date}>
                {formatDateChinese(post.date)}
              </time>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{post.readTime} 分钟阅读</span>
            </div>
          </div>
          
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {post.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
              {post.tags.length > 2 && (
                <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium">
                  +{post.tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      
      {post.featured && (
        <div className="absolute -top-2 -right-2">
          <div className="rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground">
            推荐
          </div>
        </div>
      )}
    </article>
  )
}