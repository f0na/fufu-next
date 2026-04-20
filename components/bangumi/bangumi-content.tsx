'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { ProfileCard } from '@/components/entrance/profile-card'
import { Announcement } from '@/components/home/announcement'
import { LatestSection } from './latest-section'
import { BangumiDetail } from './bangumi-detail'
import { BangumiSidebar } from './bangumi-sidebar'
import { RecordsSection } from './records-section'
import { SearchSection } from './search-section'
import { get_storage } from '@/lib/bangumi-storage'
import { fetch_resources } from '@/lib/anime-garden-client'
import { fetch_calendar, fetch_bangumi_subject } from '@/lib/bangumi-api'
import { merge_bangumi_with_resources, convert_subject_info_to_subject } from '@/lib/bangumi-utils'
import type { BangumiRecord, BangumiStatus, BangumiSubject, WeekdayGroup } from '@/lib/types/bangumi'
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
  const [view, set_view] = useState<'latest' | 'records' | 'search'>('latest')
  const [subjects, set_subjects] = useState<BangumiSubject[]>([])
  const [weekday_groups, set_weekday_groups] = useState<WeekdayGroup[]>([])
  const [records, set_records] = useState<BangumiRecord[]>([])
  const [is_loading, set_is_loading] = useState(false)

  // 详情页状态
  const [selected_subject_id, set_selected_subject_id] = useState<number | null>(null)
  const [selected_subject, set_selected_subject] = useState<BangumiSubject | null>(null)
  const [is_detail_loading, set_detail_loading] = useState(false)
  const [resource_error, set_resource_error] = useState<string | null>(null)

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

  // 点击卡片进入详情 - 渐进式加载
  const handle_card_click = useCallback(async (subject_id: number) => {
    set_selected_subject_id(subject_id)
    set_selected_subject(null)
    set_detail_loading(true)
    set_resource_error(null)

    try {
      // 从 Bangumi API 获取完整信息（先显示基本信息）
      const bgm_info = await fetch_bangumi_subject(subject_id)
      if (bgm_info) {
        // 立即显示番剧基本信息（无资源）
        const basic_subject = convert_subject_info_to_subject(bgm_info)
        set_selected_subject(basic_subject)
        set_detail_loading(false)

        // 然后加载资源列表
        try {
          const resources_result = await fetch_resources({
            pageSize: 200,
            subject: subject_id,
          })
          const full_subject = merge_bangumi_with_resources(bgm_info, resources_result.resources)
          set_selected_subject(full_subject)
        } catch (resource_err) {
          console.error('Failed to load resources:', resource_err)
          set_resource_error(resource_err instanceof Error ? resource_err.message : '资源加载失败，请稍后重试')
        }
      }
    } catch (error) {
      console.error('Failed to load subject details:', error)
      set_detail_loading(false)
      set_resource_error(error instanceof Error ? error.message : '番剧信息加载失败')
    }
  }, [])

  // 关闭详情页
  const handle_close_detail = useCallback(() => {
    set_selected_subject_id(null)
    set_selected_subject(null)
    set_resource_error(null)
  }, [])

  // 删除记录
  const handle_delete_record = useCallback(async (id: string) => {
    const storage = get_storage()
    await storage.delete(id)
    set_records(prev => prev.filter(r => r.id !== id))
  }, [])

  // 状态变更
  const handle_status_change = useCallback(async (subject_id: number, status: BangumiStatus) => {
    const storage = get_storage()
    const subject = selected_subject
    if (!subject) return

    const existing_record = records.find(r => r.subject_id === subject_id)

    if (existing_record) {
      await storage.update(existing_record.id, { status })
      set_records(prev =>
        prev.map(r => r.id === existing_record.id ? { ...r, status } : r)
      )
    } else {
      const display_name = subject.name_cn || subject.name
      const new_record: BangumiRecord = {
        id: generate_id(),
        subject_id,
        title: display_name,
        status,
        progress: '',
        added_at: new Date().toISOString(),
        cover_url: subject.images?.large || subject.cover_url,
        fansub: subject.fansub,
      }
      await storage.add(new_record)
      set_records(prev => [...prev, new_record])
    }
  }, [records, selected_subject])

  // 进度变更
  const handle_progress_change = useCallback(async (subject_id: number, progress: string) => {
    const storage = get_storage()
    const subject = selected_subject
    if (!subject) return

    const existing_record = records.find(r => r.subject_id === subject_id)

    if (existing_record) {
      await storage.update(existing_record.id, { progress })
      set_records(prev =>
        prev.map(r => r.id === existing_record.id ? { ...r, progress } : r)
      )
    } else {
      // 如果没有记录，先创建一个默认状态为"在看"的记录
      const display_name = subject.name_cn || subject.name
      const new_record: BangumiRecord = {
        id: generate_id(),
        subject_id,
        title: display_name,
        status: 'watching',
        progress,
        added_at: new Date().toISOString(),
        cover_url: subject.images?.large || subject.cover_url,
        fansub: subject.fansub,
      }
      await storage.add(new_record)
      set_records(prev => [...prev, new_record])
    }
  }, [records, selected_subject])

  return (
    <div className="w-full max-w-[61.8%] px-4 py-8">
      {/* 三栏布局 */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* 左侧边栏 */}
        <aside className="hidden lg:flex flex-col gap-4 w-[20%] shrink-0">
          <ProfileCard {...profile_props} className="w-full" />
          <Announcement
            title={announcement_props?.title}
            announcements={announcement_props?.announcements}
          />
        </aside>

        {/* 中间内容区 */}
        <main className="flex-1 lg:w-[60%] min-w-0">
          {selected_subject_id ? (
            // 详情页
            <BangumiDetail
              subject={selected_subject}
              is_loading={is_detail_loading}
              resource_error={resource_error}
              on_close={handle_close_detail}
            />
          ) : (
            // 视图切换
            view === 'search' ? (
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
            )
          )}
        </main>

        {/* 右侧边栏 */}
        <aside className="hidden lg:block w-[20%] shrink-0">
          <BangumiSidebar
            view={view}
            on_view_change={set_view}
            selected_subject={selected_subject}
            records={records}
            on_status_change={handle_status_change}
            on_progress_change={handle_progress_change}
            portal_ref={sidebar_ref}
          />
        </aside>
      </div>
    </div>
  )
}

function generate_id(): string {
  return `record_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}