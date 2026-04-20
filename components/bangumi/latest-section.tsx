'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { BangumiCard } from './bangumi-card'
import { Skeleton } from '@/components/ui/skeleton'
import type { BangumiSubject, BangumiRecord, WeekdayGroup as WeekdayGroupType } from '@/lib/types/bangumi'

interface LatestSectionProps {
  weekday_groups: WeekdayGroupType[]
  subjects: BangumiSubject[]
  records: BangumiRecord[]
  is_loading: boolean
  on_card_click: (subject_id: number) => void
}

function BangumiCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('overflow-hidden rounded-xl border border-border', className)}>
      <Skeleton className="aspect-[3/4] w-full" />
      <div className="p-1.5">
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  )
}

export function LatestSection({
  weekday_groups,
  subjects,
  records,
  is_loading,
  on_card_click,
}: LatestSectionProps) {
  const [selected_weekday, set_selected_weekday] = useState<number | null>(null)

  // 根据筛选过滤星期分组
  const filtered_groups = selected_weekday
    ? weekday_groups.filter(g => g.weekday === selected_weekday)
    : weekday_groups

  return (
    <div className="flex flex-col gap-6">
      {/* 星期筛选 */}
      {weekday_groups.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selected_weekday === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => set_selected_weekday(null)}
          >
            全部
          </Button>
          {weekday_groups.map((group) => (
            <Button
              key={group.weekday}
              variant={selected_weekday === group.weekday ? 'default' : 'outline'}
              size="sm"
              onClick={() => set_selected_weekday(group.weekday)}
            >
              {group.label}
            </Button>
          ))}
        </div>
      )}

      {/* 星期分组显示 */}
      {filtered_groups.length > 0 && (
        <div className="flex flex-col gap-8">
          {filtered_groups.map((group) => (
            <div key={group.weekday} className="flex flex-col gap-4">
              {/* 星期标题 */}
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-lg">{group.label}</h2>
                <span className="text-muted-foreground text-sm">
                  ({group.subjects.length}部)
                </span>
              </div>

              {/* 番剧瀑布流 */}
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
                {group.subjects.map((subject) => (
                  <BangumiCard
                    key={subject.id}
                    subject={subject}
                    record={records.find(r => r.subject_id === subject.id)}
                    on_click={() => on_card_click(subject.id)}
                    className="break-inside-avoid"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 无数据 */}
      {!is_loading && subjects.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          暂无番剧数据
        </div>
      )}

      {/* 加载状态 */}
      {is_loading && (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <BangumiCardSkeleton key={i} className="break-inside-avoid" />
          ))}
        </div>
      )}
    </div>
  )
}