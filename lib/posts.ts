import * as fs from 'fs'
import * as path from 'path'
import matter from 'gray-matter'
import type { Post, PostsResponse } from './types/post'

const POSTS_DIR = path.join(process.cwd(), 'content/posts')

/**
 * 获取所有文章的元数据
 */
function get_all_posts(): Post[] {
  // 确保目录存在
  if (!fs.existsSync(POSTS_DIR)) {
    return []
  }

  const file_names = fs.readdirSync(POSTS_DIR)
  const posts: Post[] = []

  for (const file_name of file_names) {
    // 只处理 .md 和 .mdx 文件
    if (!file_name.endsWith('.md') && !file_name.endsWith('.mdx')) {
      continue
    }

    const file_path = path.join(POSTS_DIR, file_name)
    const file_content = fs.readFileSync(file_path, 'utf-8')
    const { data, content } = matter(file_content)

    // 从文件名获取 slug（去除扩展名）
    const slug = file_name.replace(/\.mdx?$/, '')

    posts.push({
      slug,
      title: data.title || slug,
      date: data.date || '',
      tags: Array.isArray(data.tags) ? data.tags : [],
      cover: data.cover,
      excerpt: data.excerpt || generate_excerpt(content),
    })
  }

  return posts
}

/**
 * 从内容生成摘要
 */
function generate_excerpt(content: string, length: number = 150): string {
  // 移除 frontmatter
  const content_without_fm = content.replace(/^---[\s\S]*?---/, '')
  // 移除 markdown 语法
  const plain_text = content_without_fm
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/`/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (plain_text.length <= length) {
    return plain_text
  }
  return plain_text.slice(0, length) + '...'
}

/**
 * 获取文章列表（支持分页和筛选）
 */
export function get_posts(options: {
  page?: number
  limit?: number
  year?: string
  tag?: string
  tags?: string[]
  sort?: 'asc' | 'desc'
} = {}): PostsResponse {
  const {
    page = 1,
    limit = 10,
    year,
    tag,
    tags,
    sort = 'desc',
  } = options

  let posts = get_all_posts()

  // 按年份筛选
  if (year) {
    posts = posts.filter((post) => post.date.startsWith(year))
  }

  // 按单标签筛选（兼容旧接口）
  if (tag) {
    posts = posts.filter((post) => post.tags.includes(tag))
  }

  // 按多标签筛选（文章需要包含所有选中标签）
  if (tags && tags.length > 0) {
    posts = posts.filter((post) =>
      tags.every(selected_tag => post.tags.includes(selected_tag))
    )
  }

  // 排序（默认按日期降序）
  posts.sort((a, b) => {
    const date_a = new Date(a.date).getTime()
    const date_b = new Date(b.date).getTime()
    return sort === 'desc' ? date_b - date_a : date_a - date_b
  })

  // 分页
  const start_index = (page - 1) * limit
  const end_index = start_index + limit
  const paginated_posts = posts.slice(start_index, end_index)
  const has_more = end_index < posts.length

  return {
    posts: paginated_posts,
    page,
    has_more,
  }
}

/**
 * 获取所有标签及其文章数量
 */
export function get_all_tags(): Record<string, number> {
  const posts = get_all_posts()
  const tag_counts: Record<string, number> = {}

  for (const post of posts) {
    for (const tag of post.tags) {
      tag_counts[tag] = (tag_counts[tag] || 0) + 1
    }
  }

  return tag_counts
}

/**
 * 获取所有年份及其文章数量
 */
export function get_all_years(): Record<string, number> {
  const posts = get_all_posts()
  const year_counts: Record<string, number> = {}

  for (const post of posts) {
    if (!post.date) continue
    const year = post.date.split('-')[0]
    if (year) {
      year_counts[year] = (year_counts[year] || 0) + 1
    }
  }

  return year_counts
}

/**
 * 根据 slug 获取单篇文章
 */
export function get_post_by_slug(slug: string): Post | null {
  const posts = get_all_posts()
  return posts.find((post) => post.slug === slug) || null
}