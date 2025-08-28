import { promises as fs } from 'fs'
import path from 'path'
import { NextRequest, NextResponse } from 'next/server'

const STATS_FILE = path.join(process.cwd(), 'data', 'views.json')

// 获取所有浏览量数据用于同步到GA
export async function GET(_request: NextRequest) {
  try {
    const data = await fs.readFile(STATS_FILE, 'utf-8')
    const viewsData = JSON.parse(data)

    return NextResponse.json({
      success: true,
      data: viewsData,
      timestamp: new Date().toISOString(),
      totalArticles: Object.keys(viewsData).length,
      totalViews: Object.values(viewsData).reduce(
        (sum: number, views) => sum + (views as number),
        0
      ),
    })
  } catch (error) {
    console.error('Error reading views data:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to read views data',
      },
      { status: 500 }
    )
  }
}

// 手动触发同步到Google Analytics
export async function POST(_request: NextRequest) {
  try {
    const data = await fs.readFile(STATS_FILE, 'utf-8')
    const viewsData = JSON.parse(data)

    // 这里可以添加额外的同步逻辑
    // 比如发送到其他分析平台或数据库

    return NextResponse.json({
      success: true,
      message: 'Sync triggered successfully',
      data: viewsData,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error triggering sync:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to trigger sync',
      },
      { status: 500 }
    )
  }
}
