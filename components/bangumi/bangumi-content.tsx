'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ProfileCard } from '@/components/entrance/profile-card'
import { Announcement } from '@/components/home/announcement'
import { LatestSection } from './latest-section'
import { BangumiSidebar } from './bangumi-sidebar'
import { RecordsSection } from './records-section'
import { SearchSection } from './search-section'
import { get_storage } from '@/lib/bangumi-storage'
import { fetch_resources } from '@/lib/anime-garden-client'
import { fetch_calendar, fetch_bangumi_subject } from '@/lib/bangumi-api'
import { merge_bangumi_with_resources, convert_subject_info_to_subject } from '@/lib/bangumi-utils'
import type { BangumiRecord, BangumiSubject, WeekdayGroup } from '@/lib/types/bangumi'
import type { AnnouncementItem } from '@/components/home/announcement'

interface BangumiContentProps {
  profile_props?: {
    name?: string
    avatar_url?: string
    greeting?: string
    social_links?: {
      bilibili?: string
      github?: string
      email?: string
    }
  }
  announcement_props?: {
    title?: string
    announcements?: AnnouncementItem[]
    max_display?: number
  }
}

export function BangumiContent({
  profile_props,
  announcement_props,
}: BangumiContentProps) {
  const router = useRouter()
  const [view, set_view] = useState<'latest' | 'records' | 'search'>('latest')
  const [subjects, set_subjects] = useState<BangumiSubject[]>([])
  const [weekday_groups, set_weekday_groups] = useState<WeekdayGroup[]>([])
  const [records, set_records] = useState<BangumiRecord[]>([])
  const [is_loading, set_is_loading] = useState(false)

  const sidebar_ref = useRef<HTMLDivElement>(null)
  const is_loading_ref = useRef(false)

  // 加载本地记录
  useEffect(() => {
    const load_records = async () => {
      const storage = get_storage()
      const all_records = await storage.get_all()
      set_records(all_records)
    }
    load_records()
  }, [])

  // 加载每周番剧 - 渐进式加载
  const load_bangumi = useCallback(async () => {
    if (is_loading_ref.current) return
    is_loading_ref.current = true
    set_is_loading(true)

    try {
      // 每周放送
      const calendar = await fetch_calendar()

      const WEEKDAY_MAP: Record<number, string> = {
        1: '周一', 2: '周二', 3: '周三', 4: '周四', 5: '周五', 6: '周六', 7: '周日'
      }
      const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 7]

      // 渐进式加载：每加载完一个星期组就立即显示
      for (const weekday of WEEKDAY_ORDER) {
        const day_data = calendar.find(d => d.weekday === weekday)
        if (!day_data || day_data.items.length === 0) continue

        // 转换为列表显示格式
        const converted_items = day_data.items.map(convert_subject_info_to_subject)

        // 立即更新状态，让用户看到数据
        set_weekday_groups(prev => [...prev, {
          weekday,
          label: WEEKDAY_MAP[weekday] || '未知',
          subjects: converted_items,
        }])
        set_subjects(prev => [...prev, ...converted_items])
      }
    } catch (error) {
      console.error('Failed to load bangumi:', error)
    } finally {
      set_is_loading(false)
      is_loading_ref.current = false
    }
  }, [])

  // 初始加载
  useEffect(() => {
    load_bangumi()
  }, [])

  // 点击卡片进入详情页
  const handle_card_click = useCallback((subject_id: number) => {
    router.push(`/anime/${subject_id}`)
  }, [router])

  // 删除记录
  const handle_delete_record = useCallback(async (id: string) => {
    const storage = get_storage()
    await storage.delete(id)
    set_records(prev => prev.filter(r => r.id !== id))
  }, [])

  return (
    <div className="w-full max-w-[61.8%] px-4 py-8">
      {/* 三栏布局 */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* 左侧边栏 */}
        <aside className="hidden lg:flex flex-col gap-4 w-[16%] shrink-0">
          <ProfileCard {...profile_props} className="w-full" />
          <Announcement
            title={announcement_props?.title}
            announcements={announcement_props?.announcements}
          />
        </aside>

        {/* 中间内容区 */}
        <main className="flex-1 lg:w-[60%] min-w-0">
          {view === 'search' ? (
            <SearchSection
              records={records}
              on_card_click={handle_card_click}
            />
          ) : view === 'latest' ? (
            <LatestSection
              weekday_groups={weekday_groups}
              subjects={subjects}
              records={records}
              is_loading={is_loading}
              on_card_click={handle_card_click}
            />
          ) : (
            <RecordsSection
              records={records}
              on_delete={handle_delete_record}
              on_card_click={handle_card_click}
            />
          )}
        </main>

        {/* 右侧边栏 */}
        <aside className="hidden lg:block w-[20%] shrink-0">
          <BangumiSidebar
            view={view}
            on_view_change={set_view}
            selected_subject={null}
            records={records}
            on_status_change={() => {}}
            on_progress_change={() => {}}
            portal_ref={sidebar_ref}
          />
        </aside>
      </div>
    </div>
  )
}