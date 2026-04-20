'use client'

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import type { BangumiStatus } from '@/lib/types/bangumi'

interface StatusFilterProps {
  value: BangumiStatus | 'all'
  on_change: (value: BangumiStatus | 'all') => void
}

const status_labels: Record<BangumiStatus | 'all', string> = {
  all: '全部',
  watching: '在看',
  want_to_watch: '想看',
  watched: '看过',
  dropped: '抛弃',
}

export function StatusFilter({ value, on_change }: StatusFilterProps) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => {
        if (v) on_change(v as BangumiStatus | 'all')
      }}
      className="flex gap-1"
    >
      {(Object.keys(status_labels) as (BangumiStatus | 'all')[]).map((status) => (
        <ToggleGroupItem
          key={status}
          value={status}
          size="sm"
          className="text-xs px-3 h-7"
        >
          {status_labels[status]}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}