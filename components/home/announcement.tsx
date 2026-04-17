'use client'

import { cn } from '@/lib/utils'

export interface AnnouncementItem {
  id: string
  content: string
  time: string
}

interface AnnouncementProps {
  title?: string
  announcements?: AnnouncementItem[]
  max_display?: number // 最多显示几条
  className?: string
}

const default_announcements: AnnouncementItem[] = [
  {
    id: '1',
    content: '欢迎来到我的小站！这里是我的个人空间。',
    time: '2026-04-17',
  },
]

export function Announcement({
  title = '公告',
  announcements = default_announcements,
  max_display = 3,
  className,
}: AnnouncementProps) {
  // 只显示前几条
  const display_items = announcements.slice(0, max_display)

  return (
    <div
      className={cn(
        'bg-card/80 backdrop-blur-sm rounded-xl border border-border',
        className
      )}
    >
      {/* 标题 */}
      <div className="px-4 py-3 border-b border-border/50">
        <span className="font-medium text-foreground">{title}</span>
      </div>

      {/* 公告列表 - 不折叠 */}
      <div className="px-4 py-3 space-y-3">
        {display_items.map((item) => (
          <div key={item.id} className="text-sm">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-muted-foreground/60">{item.time}</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">{item.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}