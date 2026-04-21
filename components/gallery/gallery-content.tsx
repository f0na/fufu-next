'use client'

import { useState, useMemo } from 'react'
import { GalleryList } from './gallery-list'
import { GallerySidebar } from './gallery-sidebar'
import { ProfileCard } from '@/components/entrance/profile-card'
import { Announcement } from '@/components/home/announcement'
import type { Gallery } from '@/lib/types/gallery'
import type { AnnouncementItem } from '@/components/home/announcement'

interface GalleryContentProps {
  galleries: Gallery[]
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

export function GalleryContent({
  galleries,
  profile_props,
  announcement_props,
}: GalleryContentProps) {
  const [selected_tags, set_selected_tags] = useState<string[]>([])

  // 获取所有标签
  const all_tags = useMemo(() => {
    const tag_set = new Set<string>()
    galleries.forEach((gallery) => {
      gallery.tags?.forEach((tag) => tag_set.add(tag))
    })
    return Array.from(tag_set)
  }, [galleries])

  // 根据标签筛选相册
  const filtered_galleries = useMemo(() => {
    if (selected_tags.length === 0) return galleries

    return galleries.filter((gallery) =>
      gallery.tags?.some((tag) => selected_tags.includes(tag))
    )
  }, [galleries, selected_tags])

  return (
    <div className="w-full max-w-[61.8%] px-4">
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

        {/* 中间相册列表区 */}
        <main className="flex-1 lg:w-[60%] min-w-0">
          {/* 移动端筛选栏 */}
          <div className="lg:hidden mb-4">
            <GallerySidebar
              tags={selected_tags}
              onTagsChange={set_selected_tags}
              all_tags={all_tags}
              is_portal_target={false}
            />
          </div>

          {/* 相册列表 */}
          <GalleryList galleries={filtered_galleries} />
        </main>

        {/* 右侧边栏 */}
        <aside className="hidden lg:block w-[20%] shrink-0">
          <GallerySidebar
            tags={selected_tags}
            onTagsChange={set_selected_tags}
            all_tags={all_tags}
            is_portal_target={true}
          />
        </aside>
      </div>
    </div>
  )
}