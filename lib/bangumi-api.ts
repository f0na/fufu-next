import type { BangumiSubjectInfo } from './types/bangumi'

// 使用本地 API 代理（解决 CORS 和 User-Agent 问题）
const API_PROXY = '/api/bangumi'

// 条目类型枚举
export const SUBJECT_TYPES = {
  book: 1,      // 书籍
  anime: 2,     // 动漫
  music: 3,     // 音乐
  game: 4,      // 游戏
  real: 6,      // 三次元
}

// 排序类型
export const SORT_TYPES = ['match', 'heat', 'rank', 'score'] as const
export type SortType = typeof SORT_TYPES[number]

export const SORT_LABELS: Record<SortType, string> = {
  match: '匹配度',
  heat: '热度',
  rank: '排名',
  score: '评分',
}

interface SearchSubjectsFilter {
  // 条目类型（或关系）
  type?: number[]
  // 公共标签（且关系，可用 `-` 排除）
  meta_tags?: string[]
  // 标签（且关系）
  tag?: string[]
  // 播出日期（格式如 `>=2020-07-01`, `<2020-10-01`）
  air_date?: string[]
  // 评分筛选（格式如 `>=6`, `<8`）
  rating?: string[]
  // 评分人数筛选
  rating_count?: string[]
  // 排名筛选
  rank?: string[]
  // NSFW 筛选
  nsfw?: boolean | null
}

interface SearchSubjectsParams {
  keyword: string
  // 排序规则
  sort?: SortType
  // 筛选条件
  filter?: SearchSubjectsFilter
  // 分页
  limit?: number
  offset?: number
}

interface SearchSubjectsResult {
  data: BangumiSubjectInfo[]
  total: number
  limit: number
  offset: number
}

// 搜索番剧（通过代理）
export async function search_bangumi_subjects(params: SearchSubjectsParams): Promise<SearchSubjectsResult> {
  const {
    keyword,
    sort = 'heat',
    filter = { type: [SUBJECT_TYPES.anime] },
    limit = 10,
    offset = 0
  } = params

  try {
    const response = await fetch(
      `${API_PROXY}?path=v0/search/subjects&limit=${limit}&offset=${offset}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword,
          sort,
          filter,
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to search bangumi: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Failed to search bangumi subjects:', error)
    return { data: [], total: 0, limit, offset }
  }
}

// 获取番剧详情（通过代理）
export async function fetch_bangumi_subject(id: number): Promise<BangumiSubjectInfo | null> {
  try {
    const response = await fetch(`${API_PROXY}?path=v0/subjects/${id}`)

    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error(`Failed to fetch bangumi subject: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Failed to fetch bangumi subject ${id}:`, error)
    return null
  }
}

// 获取每周放送番剧（通过代理）
export async function fetch_calendar(): Promise<Array<{ weekday: number; items: BangumiSubjectInfo[] }>> {
  try {
    const response = await fetch(`${API_PROXY}?path=calendar`)

    if (!response.ok) {
      throw new Error(`Failed to fetch calendar: ${response.status}`)
    }

    const data = await response.json()
    // Bangumi calendar 返回格式: [{ weekday: { en, cn, ja, id }, items: [...] }]
    return data.map((day: any) => ({
      weekday: day.weekday?.id ?? 0,
      items: day.items || [],
    }))
  } catch (error) {
    console.error('Failed to fetch calendar:', error)
    return []
  }
}

// 获取指定星期的番剧
export async function fetch_weekday_bangumi(weekday: number): Promise<BangumiSubjectInfo[]> {
  const calendar = await fetch_calendar()
  const day_data = calendar.find(d => d.weekday === weekday)
  return day_data?.items || []
}

// 浏览条目（通过代理）
interface BrowseSubjectsParams {
  type: number  // 必需
  cat?: number  // 分类
  series?: boolean  // 是否系列（书籍）
  platform?: string  // 平台（游戏）
  sort?: 'date' | 'rank'
  year?: number
  month?: number
  limit?: number
  offset?: number
}

export async function browse_subjects(params: BrowseSubjectsParams): Promise<{ data: BangumiSubjectInfo[]; total: number }> {
  const {
    type,
    cat,
    series,
    platform,
    sort,
    year,
    month,
    limit = 20,
    offset = 0
  } = params

  try {
    const query_params = new URLSearchParams()
    query_params.set('type', String(type))
    if (cat) query_params.set('cat', String(cat))
    if (series !== undefined) query_params.set('series', String(series))
    if (platform) query_params.set('platform', platform)
    if (sort) query_params.set('sort', sort)
    if (year) query_params.set('year', String(year))
    if (month) query_params.set('month', String(month))
    query_params.set('limit', String(limit))
    query_params.set('offset', String(offset))

    const response = await fetch(`${API_PROXY}?path=v0/subjects&${query_params.toString()}`)

    if (!response.ok) {
      throw new Error(`Failed to browse subjects: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Failed to browse subjects:', error)
    return { data: [], total: 0 }
  }
}