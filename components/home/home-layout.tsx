'use client'

import { useLayoutEffect, useRef, useContext, ReactNode } from 'react'
import { ProfileCard } from '@/components/entrance/profile-card'
import { Announcement, AnnouncementItem } from '@/components/home/announcement'
import { RightSidebarPortalContext } from '@/context/right-sidebar-portal-context'
import { cn } from '@/lib/utils'

interface HomeLayoutProps {
  children: ReactNode
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

export function HomeLayout({
  children,
  profile_props,
  announcement_props,
  className,
}: HomeLayoutProps) {
  const portal_target_ref = useRef<HTMLDivElement>(null)
  const { set_portal_target } = useContext(RightSidebarPortalContext)

  // 注册 portal target - 使用 useLayoutEffect 确保在渲染前设置
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
      <div className="w-full max-w-[61.8%] px-4 py-8">
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

          {/* 中间内容区 - 无卡片包裹 */}
          <main className="flex-1 min-w-0 order-2 lg:order-2">
            {children}
          </main>

          {/* 右侧看板娘区域 - 仅桌面端显示，portal target 在顶部 */}
          <aside className="hidden lg:block lg:w-[200px] shrink-0 order-3">
            {/* Portal target - Live2D 会渲染到这里 */}
            <div ref={portal_target_ref} />
          </aside>
        </div>
      </div>
    </div>
  )
}