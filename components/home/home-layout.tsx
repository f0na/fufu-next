'use client'

import { ProfileCard } from '@/components/entrance/profile-card'
import { Announcement, AnnouncementItem } from '@/components/home/announcement'
import { Live2DMascot } from '@/components/mascot/live2d-mascot'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

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
  }
  className?: string
}

export function HomeLayout({
  children,
  profile_props,
  announcement_props,
  className,
}: HomeLayoutProps) {
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

          {/* 右侧看板娘区域 - 仅桌面端显示 */}
          <aside className="hidden lg:block lg:w-[200px] shrink-0 order-3">
            <Live2DMascot />
          </aside>
        </div>
      </div>
    </div>
  )
}