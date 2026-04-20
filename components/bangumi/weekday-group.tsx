'use client'

import { BangumiCard } from './bangumi-card'
import type { WeekdayGroup, BangumiRecord } from '@/lib/types/bangumi'

interface WeekdayGroupProps {
  group: WeekdayGroup
  records: BangumiRecord[]
  on_card_click: (subject_id: number) => void
}

export function WeekdayGroup({ group, records, on_card_click }: WeekdayGroupProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* 星期标题 */}
      <div className="flex items-center gap-2">
        <h2 className="font-semibold text-lg">{group.label}</h2>
        <span className="text-muted-foreground text-sm">
          ({group.subjects.length}部)
        </span>
      </div>

      {/* 番剧网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {group.subjects.map((subject) => {
          const record = records.find(r => r.subject_id === subject.id)
          return (
            <BangumiCard
              key={subject.id}
              subject={subject}
              record={record}
              on_click={() => on_card_click(subject.id)}
            />
          )
        })}
      </div>
    </div>
  )
}