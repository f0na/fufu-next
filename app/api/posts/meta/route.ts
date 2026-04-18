import { NextResponse } from 'next/server'
import { get_all_tags, get_all_years } from '@/lib/posts'

export async function GET() {
  try {
    // 使用专门的函数获取完整数据
    const tag_counts = get_all_tags()
    const year_counts = get_all_years()

    return NextResponse.json({
      all_tags: Object.keys(tag_counts).sort(),
      years: Object.keys(year_counts).sort((a, b) => Number(b) - Number(a)),
      tag_counts,
      year_counts,
    })
  } catch (error) {
    console.error('Failed to fetch meta:', error)
    return NextResponse.json(
      { error: 'Failed to fetch meta data' },
      { status: 500 }
    )
  }
}