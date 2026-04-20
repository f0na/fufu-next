// Bangumi API 番剧信息
export interface BangumiSubjectInfo {
  id: number
  name: string
  name_cn: string
  summary: string
  date: string
  platform: string
  images: {
    small: string
    grid: string
    large: string
    medium: string
    common: string
  }
  rating?: {
    score: number
    total: number
    count: { 1: number; 2: number; 3: number; 4: number; 5: number; 6: number; 7: number; 8: number; 9: number; 10: number }
  }
  tags?: Array<{ name: string; count: number }>
  eps?: number
  collection?: {
    doing: number
    wish: number
    collect: number
    on_hold: number
    dropped: number
  }
}

// AnimeGarden 单集资源响应
export interface AnimeResource {
  id: number
  title: string
  type: string
  magnet: string
  tracker?: string | null
  size: number
  created_at: Date
  fetched_at: Date
  fansub?: {
    id: number
    name: string
    avatar?: string | null
  } | null
  publisher: {
    id: number
    name: string
    avatar?: string | null
  }
  subject_id?: number | null
  metadata?: {
    anipar?: {
      episode?: { number: number }
      title?: string
      titles?: string[]
      fansub?: { name: string }
      platform?: string
      file?: {
        video?: { resolution?: string; term?: string }
        audio?: { term?: string }
        extension?: string
      }
    }
  } | null
}

// AnimeGarden API 原始响应格式（snake_case）
export interface AnimeResourceRaw {
  id: number
  title: string
  type: string
  magnet: string
  size: number
  createdAt: string
  fetchedAt: string
  fansub?: {
    id: number
    name: string
    avatar?: string
  }
  publisher: {
    id: number
    name: string
    avatar?: string
  }
  subjectId?: number
}

// 番剧主题（整合 Bangumi 信息 + AnimeGarden 资源）
export interface BangumiSubject {
  id: number  // Bangumi subject_id
  name: string
  name_cn?: string
  summary?: string
  images?: {
    small: string
    grid: string
    large: string
    medium: string
    common: string
  }
  rating?: {
    score: number
    total: number
  }
  eps?: number
  date?: string
  tags?: string[]
  resources: AnimeResource[]  // AnimeGarden 资源列表
  latest_episode?: AnimeResource
  episode_count: number
  fansub?: string
  cover_url?: string  // 从 images.large 或 fansub.avatar
}

// AnimeGarden 主题信息
export interface AnimeGardenSubjectInfo {
  id: number
  name: string
  keywords: string[]
  actived_at?: Date
  is_archived: boolean
}

// 星期分组
export interface WeekdayGroup {
  weekday: number // 0-6, 0=周日
  label: string
  subjects: BangumiSubject[]
}

// 本地番剧记录状态
export type BangumiStatus = 'watching' | 'want_to_watch' | 'watched' | 'dropped'

// 本地番剧记录
export interface BangumiRecord {
  id: string
  subject_id: number
  title: string
  status: BangumiStatus
  progress: string
  added_at: string
  cover_url?: string
  fansub?: string
}