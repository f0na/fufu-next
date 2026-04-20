'use client'

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

interface ViewToggleProps {
  value: 'latest' | 'records'
  on_change: (value: 'latest' | 'records') => void
}

export function ViewToggle({ value, on_change }: ViewToggleProps) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => {
        if (v) on_change(v as 'latest' | 'records')
      }}
      className="flex gap-1"
    >
      <ToggleGroupItem value="latest" size="sm" className="text-xs px-3 h-7">
        最新番剧
      </ToggleGroupItem>
      <ToggleGroupItem value="records" size="sm" className="text-xs px-3 h-7">
        番剧记录
      </ToggleGroupItem>
    </ToggleGroup>
  )
}