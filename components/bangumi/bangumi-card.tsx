'use client'

import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import type { BangumiSubject, BangumiRecord } from '@/lib/types/bangumi'

interface BangumiCardProps {
  subject: BangumiSubject
  record?: BangumiRecord
  on_click: (subject_id: number) => void
  className?: string
}

export function BangumiCard({
  subject,
  record,
  on_click,
  className,
}: BangumiCardProps) {
  const display_name = subject.name_cn || subject.name

  return (
    <Card
      className={cn('relative overflow-hidden cursor-pointer group', className)}
      onClick={() => on_click(subject.id)}
    >
      {/* 封面 */}
      {subject.images?.large ? (
        <img
          src={subject.images.large}
          alt={display_name}
          className="aspect-[3/4] w-full object-cover transition-transform group-hover:scale-105"
        />
      ) : subject.images?.grid ? (
        <img
          src={subject.images.grid}
          alt={display_name}
          className="aspect-[3/4] w-full object-cover transition-transform group-hover:scale-105"
        />
      ) : subject.cover_url ? (
        <img
          src={subject.cover_url}
          alt={display_name}
          className="aspect-[3/4] w-full object-cover transition-transform group-hover:scale-105"
        />
      ) : (
        <div className="aspect-[3/4] w-full bg-muted flex items-center justify-center">
          <span className="text-muted-foreground text-lg font-medium">{display_name.slice(0, 2)}</span>
        </div>
      )}

      {/* 标题 */}
      <div className="p-1.5">
        <h3 className="font-medium text-sm leading-tight line-clamp-2">
          {display_name}
        </h3>
        {record?.progress ? (
          <p className="text-xs text-muted-foreground mt-0.5">进度: {record.progress}</p>
        ) : null}
      </div>
    </Card>
  )
}