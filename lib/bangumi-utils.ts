import type { AnimeResource, BangumiSubject, BangumiSubjectInfo, WeekdayGroup } from './types/bangumi'

const WEEKDAY_LABELS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

// 将 Bangumi API 返回的数据转换为列表页显示格式
export function convert_subject_info_to_subject(info: BangumiSubjectInfo): BangumiSubject {
  return {
    id: info.id,
    name: info.name,
    name_cn: info.name_cn,
    summary: info.summary,
    images: info.images,
    rating: info.rating ? {
      score: info.rating.score,
      total: info.rating.total,
    } : undefined,
    eps: info.eps,
    date: info.date,
    tags: info.tags?.slice(0, 10).map(t => t.name),
    resources: [],
    episode_count: 0,
    cover_url: info.images?.large,
  }
}

// 从标题提取番剧名称
export function extract_bangumi_name(title: string): string {
  // 尝试匹配常见格式: [字幕组] 番剧名 - 集数
  const match = title.match(/^\[[^\]]+\]\s*(.+?)\s*[-–—]/)
  if (match) {
    return match[1].trim()
  }
  // 尝试匹配: 番剧名 / 英文名
  const slash_match = title.match(/^(.+?)\s*\/\s*/)
  if (slash_match) {
    return slash_match[1].trim()
  }
  // 移除常见前缀
  const cleaned = title.replace(/^\[[^\]]+\]\s*/, '').replace(/\s*[-–—].*$/, '').trim()
  return cleaned.length > 30 ? cleaned.slice(0, 30) + '...' : cleaned
}

// 整合 Bangumi 信息和 AnimeGarden 资源
export function merge_bangumi_with_resources(
  bangumi_info: BangumiSubjectInfo,
  resources: AnimeResource[]
): BangumiSubject {
  const sorted_resources = resources.sort(
    (a, b) => b.created_at.getTime() - a.created_at.getTime()
  )

  // 收集所有字幕组
  const fansubs = new Set<string>()
  for (const r of sorted_resources) {
    if (r.fansub?.name) {
      fansubs.add(r.fansub.name)
    }
  }
  const fansub_str = fansubs.size > 0 ? [...fansubs].join(', ') : undefined

  return {
    id: bangumi_info.id,
    name: bangumi_info.name,
    name_cn: bangumi_info.name_cn,
    summary: bangumi_info.summary,
    images: bangumi_info.images,
    rating: bangumi_info.rating ? {
      score: bangumi_info.rating.score,
      total: bangumi_info.rating.total,
    } : undefined,
    eps: bangumi_info.eps,
    date: bangumi_info.date,
    tags: bangumi_info.tags?.slice(0, 10).map(t => t.name),
    resources: sorted_resources,
    latest_episode: sorted_resources[0],
    episode_count: sorted_resources.length,
    fansub: fansub_str,
    cover_url: bangumi_info.images?.large || sorted_resources[0]?.fansub?.avatar || undefined,
  }
}

// 将单集资源按 subject_id 整合为番剧主题（用于无 Bangumi 信息时）
export function group_by_subject(resources: AnimeResource[]): BangumiSubject[] {
  const subjects = new Map<number, BangumiSubject>()

  for (const r of resources) {
    if (!r.subject_id) continue

    if (!subjects.has(r.subject_id)) {
      subjects.set(r.subject_id, {
        id: r.subject_id,
        name: extract_bangumi_name(r.title),
        resources: [],
        episode_count: 0,
        fansub: r.fansub?.name || undefined,
        cover_url: r.fansub?.avatar || undefined,
      })
    }

    const subject = subjects.get(r.subject_id)!
    subject.resources.push(r)
    subject.episode_count++

    // 更新最新一集
    if (!subject.latest_episode || r.created_at > subject.latest_episode.created_at) {
      subject.latest_episode = r
    }
  }

  return [...subjects.values()].sort((a, b) => {
    const a_time = a.latest_episode?.created_at?.getTime() ?? 0
    const b_time = b.latest_episode?.created_at?.getTime() ?? 0
    return b_time - a_time
  })
}

// 按星期分组番剧主题
export function group_subjects_by_weekday(subjects: BangumiSubject[]): WeekdayGroup[] {
  const groups = new Map<number, BangumiSubject[]>()

  for (const s of subjects) {
    // 使用 Bangumi 的 date 或最新一集的发布时间
    const date = s.date ? new Date(s.date) : s.latest_episode?.created_at
    if (!date) continue
    const weekday = date.getDay()
    if (!groups.has(weekday)) groups.set(weekday, [])
    groups.get(weekday)?.push(s)
  }

  // 返回周一到周日顺序
  return [1, 2, 3, 4, 5, 6, 0]
    .map(w => ({
      weekday: w,
      label: WEEKDAY_LABELS[w],
      subjects: (groups.get(w) || []).sort((a, b) => {
        const a_rating = a.rating?.score ?? 0
        const b_rating = b.rating?.score ?? 0
        return b_rating - a_rating
      }),
    }))
    .filter(g => g.subjects.length > 0)
}

// 按列分组（用于瀑布流布局）
export function group_into_columns(subjects: BangumiSubject[], column_count: number = 3): BangumiSubject[][] {
  const columns: BangumiSubject[][] = Array.from({ length: column_count }, () => [])

  subjects.forEach((subject, index) => {
    columns[index % column_count].push(subject)
  })

  return columns
}

// 格式化发布日期
export function format_date(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days === 2) return '前天'
  if (days < 7) return `${days}天前`

  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

// 提取集数信息
export function extract_episode(title: string): string {
  // 常见集数格式匹配（按优先级排序）

  // 1. 明确的集数标识: EP01, ep01, EP.01, 第01集, 第01话, 第1集, 第1话
  const explicit_match = title.match(/(?:EP\.?|ep\.?|第)\s*(\d+)(?:集|话)?/i)
  if (explicit_match) {
    const num = explicit_match[1]
    return `EP${num.padStart(2, '0')}`
  }

  // 2. PV格式: PV01, pv01, PV.01
  const pv_match = title.match(/PV\.?\s*(\d+)/i)
  if (pv_match) {
    return `PV${pv_match[1].padStart(2, '0')}`
  }

  // 3. SxxExx格式: S01E01, S1E1
  const season_match = title.match(/S(\d+)E(\d+)/i)
  if (season_match) {
    return `S${season_match[1]}E${season_match[2].padStart(2, '0')}`
  }

  // 4. 分隔符后数字: - 01, – 01, — 01, _01 (支持任意集数)
  const separator_match = title.match(/[-–—_]\s*(\d{1,4})(?:\s*[\[【\(（]|$|\s)/)
  if (separator_match) {
    const num = parseInt(separator_match[1])
    // 排除年份（1900-2100）
    if (num < 1900 || num > 2100) {
      return `EP${separator_match[1].padStart(2, '0')}`
    }
  }

  // 5. 方括号内数字开头（如 [08 三流喜剧的幕后]）
  const bracket_num_text_match = title.match(/\[\s*(\d{1,3})\s+[^\]]*\]/)
  if (bracket_num_text_match) {
    const num = parseInt(bracket_num_text_match[1])
    if (num < 100) {
      return `EP${bracket_num_text_match[1].padStart(2, '0')}`
    }
  }

  // 6. 方括号/括号内纯数字: [01], 【01】, （01）
  const bracket_match = title.match(/\[(\d+)\]|【(\d+)】|（(\d+)）/)
  if (bracket_match) {
    const num = bracket_match[1] || bracket_match[2] || bracket_match[3]
    if (parseInt(num) < 100) {
      return `EP${num.padStart(2, '0')}`
    }
  }

  // 7. Vol格式: Vol.01, VOL.01
  const vol_match = title.match(/Vol\.?\s*(\d+)/i)
  if (vol_match) {
    return `Vol.${vol_match[1].padStart(2, '0')}`
  }

  // 8. 结尾数字: 番剧名 01, 番剧名01（需要排除年份等）
  const end_num_match = title.match(/\s+(\d{1,2})\s*$/)
  if (end_num_match && parseInt(end_num_match[1]) < 100) {
    return `EP${end_num_match[1].padStart(2, '0')}`
  }

  return ''
}