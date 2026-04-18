import * as fs from 'fs'
import * as path from 'path'
import type { LinkItem, LinksResponse, LinksMeta } from './types/link'

const LINKS_FILE = path.join(process.cwd(), 'content/links/links.json')

// 数据源配置，预留后端 API 适配层
const DATA_SOURCE = process.env.DATA_SOURCE || 'local'

/**
 * 从 JSON 文件读取链接数据
 */
function read_links_from_file(): LinkItem[] {
  if (!fs.existsSync(LINKS_FILE)) {
    return []
  }

  try {
    const file_content = fs.readFileSync(LINKS_FILE, 'utf-8')
    const data = JSON.parse(file_content)
    return Array.isArray(data.links) ? data.links : []
  } catch (error) {
    console.error('Failed to read links file:', error)
    return []
  }
}

/**
 * 获取所有链接（根据数据源）
 */
async function fetch_all_links(): Promise<LinkItem[]> {
  if (DATA_SOURCE === 'api') {
    // TODO: 实现 API 数据源
    // const response = await fetch(`${process.env.API_URL}/links`)
    // return response.json()
    return read_links_from_file()
  }

  return read_links_from_file()
}

/**
 * 获取链接列表（支持分页和筛选）
 */
export async function get_links(options: {
  page?: number
  limit?: number
  tags?: string[]
  starred?: boolean
  sort?: 'asc' | 'desc'
} = {}): Promise<LinksResponse> {
  const {
    page = 1,
    limit = 10,
    tags,
    starred,
    sort = 'desc',
  } = options

  let links = await fetch_all_links()

  // 按标签筛选（链接需要包含所有选中标签）
  if (tags && tags.length > 0) {
    links = links.filter((link) =>
      tags.every((selected_tag) => link.tags.includes(selected_tag))
    )
  }

  // 按星标筛选
  if (starred !== undefined) {
    links = links.filter((link) =>
      starred ? link.is_starred === true : !link.is_starred
    )
  }

  // 排序（默认按创建日期降序）
  links.sort((a, b) => {
    const date_a = new Date(a.created_at).getTime()
    const date_b = new Date(b.created_at).getTime()
    return sort === 'desc' ? date_b - date_a : date_a - date_b
  })

  // 分页
  const start_index = (page - 1) * limit
  const end_index = start_index + limit
  const paginated_links = links.slice(start_index, end_index)
  const has_more = end_index < links.length

  return {
    links: paginated_links,
    page,
    has_more,
  }
}

/**
 * 获取链接元数据（所有标签）
 */
export async function get_links_meta(): Promise<LinksMeta> {
  const links = await fetch_all_links()

  // 收集所有标签并去重
  const tag_set = new Set<string>()
  for (const link of links) {
    for (const tag of link.tags) {
      tag_set.add(tag)
    }
  }

  return {
    all_tags: Array.from(tag_set).sort(),
  }
}

/**
 * 根据 ID 获取单个链接
 */
export async function get_link_by_id(id: string): Promise<LinkItem | null> {
  const links = await fetch_all_links()
  return links.find((link) => link.id === id) || null
}

/**
 * 获取星标链接
 */
export async function get_starred_links(limit?: number): Promise<LinkItem[]> {
  const links = await fetch_all_links()
  const starred = links.filter((link) => link.is_starred === true)

  // 按创建日期降序
  starred.sort((a, b) => {
    const date_a = new Date(a.created_at).getTime()
    const date_b = new Date(b.created_at).getTime()
    return date_b - date_a
  })

  return limit ? starred.slice(0, limit) : starred
}