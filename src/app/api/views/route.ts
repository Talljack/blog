import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

// 存储统计数据的文件路径
const STATS_FILE = path.join(process.cwd(), 'data', 'views.json')

interface ViewsData {
  [slug: string]: number
}

// 确保数据目录和文件存在
async function ensureStatsFile(): Promise<ViewsData> {
  try {
    const dataDir = path.dirname(STATS_FILE)
    
    // 确保目录存在
    try {
      await fs.mkdir(dataDir, { recursive: true })
    } catch (error) {
      // 目录可能已存在，忽略错误
    }

    // 尝试读取现有文件
    try {
      const data = await fs.readFile(STATS_FILE, 'utf-8')
      return JSON.parse(data)
    } catch (error) {
      // 文件不存在，创建空的统计数据
      const initialData: ViewsData = {}
      await fs.writeFile(STATS_FILE, JSON.stringify(initialData, null, 2))
      return initialData
    }
  } catch (error) {
    console.error('Error ensuring stats file:', error)
    return {}
  }
}

// 获取文章浏览量
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const slug = searchParams.get('slug')

  try {
    const viewsData = await ensureStatsFile()
    
    if (slug) {
      // 返回特定文章的浏览量
      return NextResponse.json({ 
        slug, 
        views: viewsData[slug] || 0 
      })
    } else {
      // 返回所有文章的浏览量
      return NextResponse.json(viewsData)
    }
  } catch (error) {
    console.error('Error reading views:', error)
    return NextResponse.json(
      { error: 'Failed to get views' },
      { status: 500 }
    )
  }
}

// 增加文章浏览量
export async function POST(request: NextRequest) {
  try {
    const { slug } = await request.json()
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Slug is required' },
        { status: 400 }
      )
    }

    const viewsData = await ensureStatsFile()
    
    // 增加浏览量
    viewsData[slug] = (viewsData[slug] || 0) + 1
    
    // 保存数据
    await fs.writeFile(STATS_FILE, JSON.stringify(viewsData, null, 2))
    
    return NextResponse.json({ 
      slug, 
      views: viewsData[slug] 
    })
  } catch (error) {
    console.error('Error updating views:', error)
    return NextResponse.json(
      { error: 'Failed to update views' },
      { status: 500 }
    )
  }
}