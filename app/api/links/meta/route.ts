import { NextResponse } from 'next/server'
import { get_links_meta } from '@/lib/links'

/**
 * GET /api/links/meta
 * 获取链接元数据（所有标签）
 */
export async function GET() {
  try {
    const meta = await get_links_meta()
    return NextResponse.json(meta)
  } catch (error) {
    console.error('Failed to fetch links meta:', error)
    return NextResponse.json(
      { error: 'Failed to fetch links meta data' },
      { status: 500 }
    )
  }
}