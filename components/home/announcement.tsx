'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export interface AnnouncementItem {
  id: string
  content: string
  time: string
}

interface AnnouncementProps {
  title?: string
  announcements?: AnnouncementItem[]
  max_display?: number
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
  const display_items = announcements.slice(0, max_display)

  return (
    <Card size="sm" className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {display_items.map((item) => (
          <div key={item.id} className="text-sm">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-muted-foreground/60">{item.time}</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">{item.content}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}