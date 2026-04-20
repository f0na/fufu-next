'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { BangumiDetail } from '@/components/bangumi/bangumi-detail'
import { BangumiSidebar } from '@/components/bangumi/bangumi-sidebar'
import { ProfileCard } from '@/components/entrance/profile-card'
import { Announcement } from '@/components/home/announcement'
import { fetch_resources } from '@/lib/anime-garden-client'
import { merge_bangumi_with_resources, convert_subject_info_to_subject } from '@/lib/bangumi-utils'
import { get_storage } from '@/lib/bangumi-storage'
import type { BangumiSubject, BangumiRecord, BangumiStatus, BangumiSubjectInfo } from '@/lib/types/bangumi'

interface BangumiDetailPageProps {
  subject_info: BangumiSubjectInfo
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
    announcements?: Array<{
      id: string
      content: string
      time: string
    }>
    max_display?: number
  }
}

export function BangumiDetailPage({
  subject_info,
  profile_props,
  announcement_props,
}: BangumiDetailPageProps) {
  const router = useRouter()
  const [subject, set_subject] = useState<BangumiSubject>(() => convert_subject_info_to_subject(subject_info))
  const [is_loading, set_loading] = useState(true)
  const [resource_error, set_resource_error] = useState<string | null>(null)
  const [records, set_records] = useState<BangumiRecord[]>([])

  const sidebar_ref = useRef<HTMLDivElement>(null)

  // 加载本地记录
  useEffect(() => {
    const load_records = async () => {
      const storage = get_storage()
      const all_records = await storage.get_all()
      set_records(all_records)
    }
    load_records()
  }, [])

  // 加载资源列表
  useEffect(() => {
    const load_resources = async () => {
      set_loading(true)
      set_resource_error(null)

      try {
        const resources_result = await fetch_resources({
          pageSize: 200,
          subject: subject_info.id,
        })
        const full_subject = merge_bangumi_with_resources(subject_info, resources_result.resources)
        set_subject(full_subject)
      } catch (error) {
        console.error('Failed to load resources:', error)
        set_resource_error(error instanceof Error ? error.message : '资源加载失败，请稍后重试')
      } finally {
        set_loading(false)
      }
    }

    load_resources()
  }, [subject_info])

  // 返回列表
  const handle_close = useCallback(() => {
    router.push('/anime')
  }, [router])

  // 状态变更
  const handle_status_change = useCallback(async (subject_id: number, status: BangumiStatus) => {
    const storage = get_storage()
    const current_subject = subject
    if (!current_subject) return

    const existing_record = records.find(r => r.subject_id === subject_id)

    if (existing_record) {
      await storage.update(existing_record.id, { status })
      set_records(prev =>
        prev.map(r => r.id === existing_record.id ? { ...r, status } : r)
      )
    } else {
      const display_name = current_subject.name_cn || current_subject.name
      const new_record: BangumiRecord = {
        id: generate_id(),
        subject_id,
        title: display_name,
        status,
        progress: '',
        added_at: new Date().toISOString(),
        cover_url: current_subject.images?.large || current_subject.cover_url,
        fansub: current_subject.fansub,
      }
      await storage.add(new_record)
      set_records(prev => [...prev, new_record])
    }
  }, [records, subject])

  // 进度变更
  const handle_progress_change = useCallback(async (subject_id: number, progress: string) => {
    const storage = get_storage()
    const current_subject = subject
    if (!current_subject) return

    const existing_record = records.find(r => r.subject_id === subject_id)

    if (existing_record) {
      await storage.update(existing_record.id, { progress })
      set_records(prev =>
        prev.map(r => r.id === existing_record.id ? { ...r, progress } : r)
      )
    } else {
      const display_name = current_subject.name_cn || current_subject.name
      const new_record: BangumiRecord = {
        id: generate_id(),
        subject_id,
        title: display_name,
        status: 'watching',
        progress,
        added_at: new Date().toISOString(),
        cover_url: current_subject.images?.large || current_subject.cover_url,
        fansub: current_subject.fansub,
      }
      await storage.add(new_record)
      set_records(prev => [...prev, new_record])
    }
  }, [records, subject])

  return (
    <div className="w-full max-w-[61.8%] px-4 py-8">
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
          <BangumiDetail
            subject={subject}
            is_loading={is_loading}
            resource_error={resource_error}
            on_close={handle_close}
          />
        </main>

        {/* 右侧边栏 */}
        <aside className="hidden lg:block w-[20%] shrink-0">
          <BangumiSidebar
            view="detail"
            on_view_change={() => {}}
            selected_subject={subject}
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