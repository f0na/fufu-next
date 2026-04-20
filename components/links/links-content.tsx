'use client'

import { useState, useEffect, useRef } from 'react'
import { LinksList } from './links-list'
import { LinksSidebar } from './links-sidebar'
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll'
import { ProfileCard } from '@/components/entrance/profile-card'
import { Announcement } from '@/components/home/announcement'
import type { LinkItem } from '@/lib/types/link'
import type { AnnouncementItem } from '@/components/home/announcement'

interface LinksContentProps {
  className?: string
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

export function LinksContent({ className, profile_props, announcement_props }: LinksContentProps) {
  const [links, set_links] = useState<LinkItem[]>([])
  const [page, set_page] = useState(1)
  const [has_more, set_has_more] = useState(true)
  const [is_loading, set_is_loading] = useState(false)
  const [selected_tags, set_selected_tags] = useState<string[]>([])
  const [starred, set_starred] = useState(false)
  const [all_tags, set_all_tags] = useState<string[]>([])

  // 使用 ref 防止重复加载
  const is_loading_ref = useRef(false)

  // 获取标签元数据
  useEffect(() => {
    const fetch_meta = async () => {
      try {
        const response = await fetch('/api/links/meta')
        if (response.ok) {
          const data = await response.json()
          set_all_tags(data.all_tags || [])
        }
      } catch (error) {
        console.error('Failed to fetch links meta:', error)
      }
    }
    fetch_meta()
  }, [])

  // 获取链接列表
  const fetch_links = async (page_num: number, reset: boolean = false) => {
    // 使用 ref 检查，避免状态闭包问题
    if (is_loading_ref.current) return

    is_loading_ref.current = true
    set_is_loading(true)

    try {
      const params = new URLSearchParams()
      params.set('page', page_num.toString())
      params.set('limit', '12')
      if (selected_tags.length > 0) {
        params.set('tags', selected_tags.join(','))
      }
      if (starred) {
        params.set('starred', 'true')
      }

      const response = await fetch(`/api/links?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        if (reset) {
          set_links(data.links)
          set_page(1)
        } else {
          set_links(prev => [...prev, ...data.links])
          set_page(page_num)
        }
        set_has_more(data.has_more)
      }
    } catch (error) {
      console.error('Failed to fetch links:', error)
    } finally {
      set_is_loading(false)
      is_loading_ref.current = false
    }
  }

  // 初始加载和筛选变化时重新加载
  useEffect(() => {
    const do_initial_load = async () => {
      if (is_loading_ref.current) return
      is_loading_ref.current = true
      set_is_loading(true)
      set_links([])
      set_page(1)
      set_has_more(true)

      try {
        const params = new URLSearchParams()
        params.set('page', '1')
        params.set('limit', '12')
        if (selected_tags.length > 0) {
          params.set('tags', selected_tags.join(','))
        }
        if (starred) {
          params.set('starred', 'true')
        }

        const response = await fetch(`/api/links?${params.toString()}`)
        if (response.ok) {
          const data = await response.json()
          set_links(data.links)
          set_has_more(data.has_more)
        }
      } catch (error) {
        console.error('Failed to fetch links:', error)
      } finally {
        set_is_loading(false)
        is_loading_ref.current = false
      }
    }
    do_initial_load()
  }, [selected_tags, starred])

  // 无限滚动加载更多
  const { sentinelRef, isLoading: scroll_loading } = useInfiniteScroll({
    has_more,
    onLoadMore: async () => {
      if (!is_loading_ref.current && has_more) {
        await fetch_links(page + 1)
      }
    },
    root_margin: '100px',
    disabled: is_loading || links.length === 0,
  })

  const handle_tags_change = (updater: (prev: string[]) => string[]) => {
    set_selected_tags(updater)
  }

  const handle_starred_change = (new_starred: boolean) => {
    set_starred(new_starred)
  }

  return (
    <div className="w-full max-w-[61.8%] px-4 py-8">
      {/* 三栏布局 - 桌面端显示三栏，移动端只显示侧边栏和列表 */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* 左侧边栏 - 桌面端约16%，移动端隐藏 */}
        <aside className="hidden lg:flex flex-col gap-4 w-[16%] shrink-0">
          <ProfileCard
            {...profile_props}
            className="w-full"
          />
          <Announcement
            title={announcement_props?.title}
            announcements={announcement_props?.announcements}
          />
        </aside>

        {/* 中间链接列表区 - 桌面端约60%，移动端100% */}
        <main className="flex-1 lg:w-[60%] min-w-0">
          {/* 移动端筛选栏 - 只在移动端显示 */}
          <div className="lg:hidden mb-4">
            <LinksSidebar
              tags={selected_tags}
              onTagsChange={handle_tags_change}
              starred={starred}
              onStarredChange={handle_starred_change}
              all_tags={all_tags}
              is_portal_target={false}
            />
          </div>

          {/* 链接列表 */}
          <LinksList
            links={links}
            isLoading={is_loading || scroll_loading}
            hasMore={has_more}
            sentinelRef={sentinelRef}
          />
        </main>

        {/* 右侧边栏 - 桌面端约20%，移动端隐藏 */}
        <aside className="hidden lg:block w-[20%] shrink-0">
          <LinksSidebar
            tags={selected_tags}
            onTagsChange={handle_tags_change}
            starred={starred}
            onStarredChange={handle_starred_change}
            all_tags={all_tags}
            is_portal_target={true}
          />
        </aside>
      </div>
    </div>
  )
}