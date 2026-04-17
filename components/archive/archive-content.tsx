'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { ArchiveList } from './archive-list'
import { ArchiveSidebar } from './archive-sidebar'
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll'
import { ProfileCard } from '@/components/entrance/profile-card'
import { Announcement } from '@/components/home/announcement'
import type { Post } from '@/lib/types/post'
import type { AnnouncementItem } from '@/components/home/announcement'

interface ArchiveContentProps {
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

export function ArchiveContent({ className, profile_props, announcement_props }: ArchiveContentProps) {
  const [posts, set_posts] = useState<Post[]>([])
  const [page, set_page] = useState(1)
  const [has_more, set_has_more] = useState(true)
  const [is_loading, set_is_loading] = useState(false)
  const [sort, set_sort] = useState<'asc' | 'desc'>('desc')
  const [year, set_year] = useState<string | undefined>(undefined)
  const [selected_tags, set_selected_tags] = useState<string[]>([])
  const [years, set_years] = useState<string[]>([])

  // 使用 ref 防止重复加载
  const is_loading_ref = useRef(false)

  // 从文章数据中提取年份
  useEffect(() => {
    const fetch_all_posts = async () => {
      try {
        const response = await fetch('/api/posts?limit=100')
        if (response.ok) {
          const data = await response.json()
          const year_set = new Set<string>()

          for (const post of data.posts) {
            if (post.date) {
              const year = post.date.split('-')[0]
              if (year) year_set.add(year)
            }
          }

          set_years(Array.from(year_set).sort((a, b) => Number(b) - Number(a)))
        }
      } catch (error) {
        console.error('Failed to fetch all posts for meta:', error)
      }
    }
    fetch_all_posts()
  }, [])

  // 获取文章列表 - 不使用 useCallback，避免依赖循环
  const fetch_posts = async (page_num: number, reset: boolean = false) => {
    // 使用 ref 检查，避免状态闭包问题
    if (is_loading_ref.current) return

    is_loading_ref.current = true
    set_is_loading(true)

    try {
      const params = new URLSearchParams()
      params.set('page', page_num.toString())
      params.set('limit', '10')
      if (year) params.set('year', year)
      if (selected_tags.length > 0) {
        params.set('tags', selected_tags.join(','))
      }
      params.set('sort', sort)

      const response = await fetch(`/api/posts?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        if (reset) {
          set_posts(data.posts)
          set_page(1)
        } else {
          set_posts(prev => [...prev, ...data.posts])
          set_page(page_num)
        }
        set_has_more(data.has_more)
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      set_is_loading(false)
      is_loading_ref.current = false
    }
  }

  // 初始加载和筛选变化时重新加载 - 使用独立函数避免依赖
  useEffect(() => {
    const do_initial_load = async () => {
      if (is_loading_ref.current) return
      is_loading_ref.current = true
      set_is_loading(true)
      set_posts([])
      set_page(1)
      set_has_more(true)

      try {
        const params = new URLSearchParams()
        params.set('page', '1')
        params.set('limit', '10')
        if (year) params.set('year', year)
        if (selected_tags.length > 0) {
          params.set('tags', selected_tags.join(','))
        }
        params.set('sort', sort)

        const response = await fetch(`/api/posts?${params.toString()}`)
        if (response.ok) {
          const data = await response.json()
          set_posts(data.posts)
          set_has_more(data.has_more)
        }
      } catch (error) {
        console.error('Failed to fetch posts:', error)
      } finally {
        set_is_loading(false)
        is_loading_ref.current = false
      }
    }
    do_initial_load()
  }, [year, selected_tags, sort])

  // 无限滚动加载更多 - 初始加载时禁用
  const { sentinelRef, isLoading: scroll_loading } = useInfiniteScroll({
    has_more,
    onLoadMore: async () => {
      if (!is_loading_ref.current && has_more) {
        await fetch_posts(page + 1)
      }
    },
    root_margin: '100px',
    disabled: is_loading || posts.length === 0,
  })

  const handle_sort_change = (new_sort: 'asc' | 'desc') => {
    set_sort(new_sort)
  }

  const handle_year_change = (new_year: string | undefined) => {
    set_year(new_year)
  }

  const handle_tags_change = (new_tags: string[]) => {
    set_selected_tags(new_tags)
  }

  return (
    <div className={className}>
      {/* 三栏布局 - 桌面端显示三栏，移动端只显示侧边栏和列表 */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* 左侧边栏 - 桌面端约20%，移动端隐藏 */}
        <aside className="hidden lg:flex flex-col gap-4 w-[20%] shrink-0">
          <ProfileCard
            {...profile_props}
            className="w-full"
          />
          <Announcement
            title={announcement_props?.title}
            announcements={announcement_props?.announcements}
          />
        </aside>

        {/* 中间归档列表区 - 桌面端约60%，移动端100% */}
        <main className="flex-1 lg:w-[60%] min-w-0">
          {/* 移动端筛选栏 - 只在移动端显示 */}
          <div className="lg:hidden mb-4">
            <ArchiveSidebar
              sort={sort}
              onSortChange={handle_sort_change}
              year={year}
              onYearChange={handle_year_change}
              years={years}
              tags={selected_tags}
              onTagsChange={handle_tags_change}
              is_portal_target={false}
            />
          </div>

          {/* 文章列表 - 只渲染一次 */}
          <ArchiveList
            posts={posts}
            isLoading={is_loading || scroll_loading}
            hasMore={has_more}
            sentinelRef={sentinelRef}
          />
        </main>

        {/* 右侧边栏 - 桌面端约20%，移动端隐藏 */}
        <aside className="hidden lg:block w-[20%] shrink-0">
          <ArchiveSidebar
            sort={sort}
            onSortChange={handle_sort_change}
            year={year}
            onYearChange={handle_year_change}
            years={years}
            tags={selected_tags}
            onTagsChange={handle_tags_change}
            is_portal_target={true}
          />
        </aside>
      </div>
    </div>
  )
}