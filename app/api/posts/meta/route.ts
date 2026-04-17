import { NextResponse } from 'next/server'
import { get_all_tags, get_all_years, get_posts } from '@/lib/posts'

export async function GET() {
  try {
    // 使用get_posts来获取年份和标签信息
    const response = get_posts({ limit: 100 })
    const posts = response.posts

    // 从文章中提取年份和标签
    const year_set = new Set<string>()
    const tag_set = new Set<string>()

    for (const post of posts) {
      if (post.date) {
        const year = post.date.split('-')[0]
        if (year) year_set.add(year)
      }
      for (const tag of post.tags) {
        tag_set.add(tag)
      }
    }

    return NextResponse.json({
      tags: Array.from(tag_set),
      years: Array.from(year_set).sort((a, b) => Number(b) - Number(a)),
    })
  } catch (error) {
    console.error('Failed to fetch meta:', error)
    return NextResponse.json(
      { error: 'Failed to fetch meta data' },
      { status: 500 }
    )
  }
}