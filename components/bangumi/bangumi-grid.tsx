'use client'

import { BangumiCard } from './bangumi-card'
import { Skeleton } from '@/components/ui/skeleton'
import type { BangumiSubject, BangumiRecord } from '@/lib/types/bangumi'

interface BangumiGridProps {
  subjects: BangumiSubject[]
  records: BangumiRecord[]
  on_card_click?: (subject_id: number) => void
  is_loading?: boolean
  has_more?: boolean
  sentinel_ref?: React.RefObject<HTMLDivElement | null>
}

function BangumiCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <Skeleton className="aspect-video w-full" />
      <div className="flex flex-col gap-2 p-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
        <div className="flex gap-1">
          <Skeleton className="h-6 w-12" />
          <Skeleton className="h-6 w-12" />
          <Skeleton className="h-6 w-12" />
        </div>
      </div>
    </div>
  )
}

export function BangumiGrid({
  subjects,
  records,
  on_card_click,
  is_loading,
  has_more,
  sentinel_ref,
}: BangumiGridProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* 番剧网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((subject) => {
          const record = records.find(r => r.subject_id === subject.id)
          return (
            <BangumiCard
              key={subject.id}
              subject={subject}
              record={record}
              on_click={() => on_card_click?.(subject.id)}
            />
          )
        })}
      </div>

      {/* 加载状态 */}
      {is_loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <BangumiCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* 无限滚动 sentinel */}
      {has_more && (
        <div ref={sentinel_ref} className="h-10 flex items-center justify-center">
          <span className="text-muted-foreground text-sm">加载更多...</span>
        </div>
      )}

      {/* 无数据 */}
      {!is_loading && subjects.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          暂无番剧数据
        </div>
      )}
    </div>
  )
}