import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkToc from 'remark-toc'
import remarkRehype from 'remark-rehype'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeStringify from 'rehype-stringify'
import { JSDOM } from 'jsdom'
import type { TableOfContentsItem } from '@/types/blog'

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
  newsletter?: boolean // 是否发送到邮件订阅
  lastModified?: string
  tableOfContents?: TableOfContentsItem[]
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
  newsletter?: boolean // 是否发送到邮件订阅
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

function extractTableOfContents(
  htmlContent: string,
  maxDepth = 4
): TableOfContentsItem[] {
  const dom = new JSDOM(htmlContent)
  const document = dom.window.document
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')

  const tocItems: TableOfContentsItem[] = []
  const stack: { item: TableOfContentsItem; level: number }[] = []

  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.charAt(1))
    if (level > maxDepth) return

    let id = heading.id
    if (!id) {
      id =
        heading.textContent
          ?.toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w\u4e00-\u9fff-]/g, '') || `heading-${index}`
      heading.id = id
    }

    const title = heading.textContent || ''

    const tocItem: TableOfContentsItem = {
      id,
      title,
      level,
      children: [],
    }

    while (stack.length > 0 && stack[stack.length - 1].level >= level) {
      stack.pop()
    }

    if (stack.length === 0) {
      tocItems.push(tocItem)
    } else {
      const parent = stack[stack.length - 1].item
      parent.children = parent.children || []
      parent.children.push(tocItem)
    }

    stack.push({ item: tocItem, level })
  })

  return tocItems
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
          newsletter: data.newsletter || false,
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
      .use(remarkToc, { heading: '目录', tight: true })
      .use(remarkRehype)
      .use(rehypeSlug)
      .use(rehypeAutolinkHeadings, {
        behavior: 'wrap',
        properties: {
          className: ['anchor-link'],
        },
      })
      .use(rehypeStringify)
      .process(content)

    const contentHtml = processedContent.toString()
    const tableOfContents = extractTableOfContents(contentHtml)

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
      newsletter: data.newsletter || false,
      tableOfContents,
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

export async function getNewsletterPosts(): Promise<BlogPostMeta[]> {
  const allPosts = await getAllPosts()
  return allPosts.filter(post => post.newsletter === true)
}
