'use client'

import { useLayoutEffect, useRef, useContext, ReactNode } from 'react'
import { ProfileCard } from '@/components/entrance/profile-card'
import { Announcement, AnnouncementItem } from '@/components/home/announcement'
import { RightSidebarPortalContext } from '@/context/right-sidebar-portal-context'
import { cn } from '@/lib/utils'

interface PostLayoutProps {
  children: ReactNode
  /** 右侧边栏内容 */
  right_sidebar?: ReactNode
  /** 推荐文章区域内容 */
  recommended_posts?: ReactNode
  /** 评论区内容 */
  comments_section?: ReactNode
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
  className?: string
}

export function PostLayout({
  children,
  right_sidebar,
  recommended_posts,
  comments_section,
  profile_props,
  announcement_props,
  className,
}: PostLayoutProps) {
  const portal_target_ref = useRef<HTMLDivElement>(null)
  const { set_portal_target } = useContext(RightSidebarPortalContext)

  // 注册 portal target
  useLayoutEffect(() => {
    if (portal_target_ref.current) {
      set_portal_target(portal_target_ref.current)
    }
    return () => {
      set_portal_target(null)
    }
  }, [set_portal_target])

  return (
    <div className={cn('w-full flex justify-center', className)}>
      {/* 三栏容器 - 黄金比例宽度 61.8% */}
      <div className="w-full max-w-[61.8%] px-4">
        {/* 桌面端三栏布局，移动端单栏 */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 左侧栏 */}
          <aside className="flex flex-col gap-4 lg:w-[180px] shrink-0 order-1">
            <ProfileCard
              {...profile_props}
              className="w-full lg:w-auto"
            />
            <Announcement
              title={announcement_props?.title}
              announcements={announcement_props?.announcements}
            />
          </aside>

          {/* 中间内容区 */}
          <main className="flex-1 min-w-0 order-2 lg:order-2 space-y-6">
            {/* 文章内容 */}
            {children}

            {/* 推荐文章区域 */}
            {recommended_posts && (
              <div className="mt-8">
                {recommended_posts}
              </div>
            )}
          </main>

          {/* 右侧栏 - 文章信息 */}
          <aside className="hidden lg:flex lg:w-[200px] shrink-0 order-3 flex-col gap-4">
            {/* Portal target - Live2D 会渲染到这里（顶部） */}
            <div ref={portal_target_ref} />
            {right_sidebar}
          </aside>
        </div>

        {/* 评论区 - 三栏下方全宽显示 */}
        {comments_section && (
          <div className="mt-8 w-full">
            {comments_section}
          </div>
        )}
      </div>
    </div>
  )
}