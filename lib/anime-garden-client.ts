import type { AnimeResource } from './types/bangumi'

// AnimeGarden API 基础 URL
const API_BASE_URL = 'https://api.animes.garden'

// @animegarden/client 包与当前 API 不兼容（API 响应格式已变化，缺少 timestamp 字段）
// 直接使用 fetch 调用 API

export interface AnimeGardenSearchParams {
  page?: number
  pageSize?: number
  // 标题搜索（任意匹配）
  search?: string | string[]
  // 包含至少一个标题
  include?: string | string[]
  // 包含所有关键字
  keywords?: string | string[]
  // 排除关键字
  exclude?: string | string[]
  // 资源类型（支持数组）
  type?: string
  types?: string[]
  // 字幕组（支持数组）
  fansub?: string
  fansubs?: string[]
  // 发布者（支持数组）
  publisher?: string
  publishers?: string[]
  // Bangumi subject ID
  subject?: number
  subjects?: number[]
  // 时间范围
  after?: Date
  before?: Date
  // 平台
  provider?: 'dmhy' | 'moe' | 'ani'
  // 是否包含重复
  duplicate?: boolean
  // 返回 metadata
  metadata?: boolean
  // 返回 tracker
  tracker?: boolean
}

interface FetchResourcesResult {
  resources: AnimeResource[]
  complete: boolean
  page: number
  pageSize: number
}

interface AnimeGardenApiResponse {
  status: string
  complete: boolean
  resources: Array<{
    id: number
    provider: string
    providerId: string
    title: string
    href: string
    type: string
    magnet: string
    size: number
    createdAt: string
    fetchedAt: string
    publisher: { id: number; name: string; avatar?: string | null }
    fansub?: { id: number; name: string; avatar?: string | null } | null
    subjectId?: number | null
    metadata?: any
  }>
  pagination: { page: number; pageSize: number; complete: boolean }
  filter: Record<string, any>
}

// 获取资源列表
export async function fetch_resources(params: AnimeGardenSearchParams = {}): Promise<FetchResourcesResult> {
  const {
    page = 1,
    pageSize = 20,
    search,
    include,
    keywords,
    exclude,
    type,
    types,
    fansub,
    fansubs,
    publisher,
    publishers,
    subject,
    subjects,
    after,
    before,
    provider,
    duplicate,
    metadata = false,
    tracker = false,
  } = params

  try {
    // 构建 URL 参数
    const url_params = new URLSearchParams()
    url_params.set('page', String(page))
    url_params.set('pageSize', String(pageSize))

    // 搜索关键词
    if (search) {
      if (Array.isArray(search)) {
        search.forEach(s => url_params.append('search', s))
      } else {
        url_params.set('search', search)
      }
    }
    if (include) {
      if (Array.isArray(include)) {
        include.forEach(i => url_params.append('include', i))
      } else {
        url_params.set('include', include)
      }
    }
    if (keywords) {
      if (Array.isArray(keywords)) {
        keywords.forEach(k => url_params.append('keywords', k))
      } else {
        url_params.set('keywords', keywords)
      }
    }
    if (exclude) {
      if (Array.isArray(exclude)) {
        exclude.forEach(e => url_params.append('exclude', e))
      } else {
        url_params.set('exclude', exclude)
      }
    }

    // 类型
    if (type) {
      url_params.set('type', type)
    } else if (types && types.length > 0) {
      types.forEach(t => url_params.append('type', t))
    }

    // 字幕组
    if (fansub) {
      url_params.set('fansub', fansub)
    } else if (fansubs && fansubs.length > 0) {
      fansubs.forEach(f => url_params.append('fansub', f))
    }

    // 发布者
    if (publisher) {
      url_params.set('publisher', publisher)
    } else if (publishers && publishers.length > 0) {
      publishers.forEach(p => url_params.append('publisher', p))
    }

    // Bangumi subject ID
    if (subject) {
      url_params.set('subject', String(subject))
    } else if (subjects && subjects.length > 0) {
      subjects.forEach(s => url_params.append('subject', String(s)))
    }

    // 时间范围
    if (after) {
      url_params.set('after', after.toISOString())
    }
    if (before) {
      url_params.set('before', before.toISOString())
    }

    // 平台
    if (provider) {
      url_params.set('provider', provider)
    }

    // 其他选项
    if (duplicate) {
      url_params.set('duplicate', 'true')
    }
    if (metadata) {
      url_params.set('metadata', 'true')
    }
    if (tracker) {
      url_params.set('tracker', 'true')
    }

    const response = await fetch(`${API_BASE_URL}/resources?${url_params.toString()}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch resources: ${response.status} ${response.statusText}`)
    }

    const data: AnimeGardenApiResponse = await response.json()

    if (data.status !== 'OK') {
      throw new Error(`API returned error status: ${data.status}`)
    }

    // 转换资源格式
    const resources: AnimeResource[] = data.resources.map(r => ({
      id: r.id,
      title: r.title,
      type: r.type,
      magnet: r.magnet,
      size: r.size,
      created_at: new Date(r.createdAt),
      fetched_at: new Date(r.fetchedAt),
      fansub: r.fansub,
      publisher: r.publisher,
      subject_id: r.subjectId,
      metadata: r.metadata,
    }))

    return {
      resources,
      complete: data.pagination.complete ?? true,
      page: data.pagination.page ?? page,
      pageSize: data.pagination.pageSize ?? pageSize,
    }
  } catch (error) {
    console.error('Failed to fetch resources:', error)
    throw error
  }
}

// 格式化文件大小
export function format_size(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)}MB`
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)}GB`
}

// 获取所有字幕组列表（热门）
export async function fetch_popular_fansubs(limit: number = 20): Promise<{ id: number; name: string; count: number }[]> {
  // AnimeGarden 没有直接提供字幕组列表 API
  // 可以通过获取大量资源然后统计 fansub 字段来获取热门字幕组
  const result = await fetch_resources({ pageSize: 500 })
  const fansub_counts = new Map<number, { name: string; count: number }>()

  for (const r of result.resources) {
    if (r.fansub) {
      const existing = fansub_counts.get(r.fansub.id)
      if (existing) {
        existing.count++
      } else {
        fansub_counts.set(r.fansub.id, { name: r.fansub.name, count: 1 })
      }
    }
  }

  return [...fansub_counts.entries()]
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

// 获取所有发布者列表（热门）
export async function fetch_popular_publishers(limit: number = 20): Promise<{ id: number; name: string; count: number }[]> {
  const result = await fetch_resources({ pageSize: 500 })
  const publisher_counts = new Map<number, { name: string; count: number }>()

  for (const r of result.resources) {
    const existing = publisher_counts.get(r.publisher.id)
    if (existing) {
      existing.count++
    } else {
      publisher_counts.set(r.publisher.id, { name: r.publisher.name, count: 1 })
    }
  }

  return [...publisher_counts.entries()]
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

export type { AnimeResource } from './types/bangumi'