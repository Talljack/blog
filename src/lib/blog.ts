import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import html from 'remark-html'

const postsDirectory = path.join(process.cwd(), 'src/content/blog')

export interface BlogPost {
  slug: string
  title: string
  date: string
  description: string
  content: string
  readTime: number
  tags: string[]
  author?: string
  featured?: boolean
  lastModified?: string
}

export interface BlogPostMeta {
  slug: string
  title: string
  date: string
  description: string
  readTime: number
  tags: string[]
  author?: string
  featured?: boolean
  lastModified?: string
}

function ensurePostsDirectory() {
  if (!fs.existsSync(postsDirectory)) {
    fs.mkdirSync(postsDirectory, { recursive: true })
  }
}

function calculateReadTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

export async function getAllPosts(): Promise<BlogPostMeta[]> {
  ensurePostsDirectory()

  const fileNames = fs.readdirSync(postsDirectory)
  const allPostsData = await Promise.all(
    fileNames
      .filter(fileName => fileName.endsWith('.md') || fileName.endsWith('.mdx'))
      .map(async fileName => {
        const slug = fileName.replace(/\.(md|mdx)$/, '')
        const fullPath = path.join(postsDirectory, fileName)
        const fileContents = fs.readFileSync(fullPath, 'utf8')
        const { data, content } = matter(fileContents)

        return {
          slug,
          title: data.title || slug,
          date: data.date || new Date().toISOString(),
          description: data.description || '',
          readTime: calculateReadTime(content),
          tags: data.tags || [],
          author: data.author,
          featured: data.featured || false,
        } as BlogPostMeta
      })
  )

  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1))
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  ensurePostsDirectory()

  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`)
    let fileContents: string

    if (fs.existsSync(fullPath)) {
      fileContents = fs.readFileSync(fullPath, 'utf8')
    } else {
      const fullPathMdx = path.join(postsDirectory, `${slug}.mdx`)
      if (fs.existsSync(fullPathMdx)) {
        fileContents = fs.readFileSync(fullPathMdx, 'utf8')
      } else {
        return null
      }
    }

    const { data, content } = matter(fileContents)

    const processedContent = await remark()
      .use(remarkGfm)
      .use(html, { sanitize: false })
      .process(content)

    const contentHtml = processedContent.toString()

    return {
      slug,
      title: data.title || slug,
      date: data.date || new Date().toISOString(),
      description: data.description || '',
      content: contentHtml,
      readTime: calculateReadTime(content),
      tags: data.tags || [],
      author: data.author,
      featured: data.featured || false,
    }
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error)
    return null
  }
}

export async function getFeaturedPosts(): Promise<BlogPostMeta[]> {
  const allPosts = await getAllPosts()
  return allPosts.filter(post => post.featured).slice(0, 3)
}

export async function getPostsByTag(tag: string): Promise<BlogPostMeta[]> {
  const allPosts = await getAllPosts()
  return allPosts.filter(post => post.tags.includes(tag))
}

export async function getAllTags(): Promise<string[]> {
  const allPosts = await getAllPosts()
  const tags = new Set<string>()
  allPosts.forEach(post => {
    post.tags.forEach(tag => tags.add(tag))
  })
  return Array.from(tags).sort()
}
