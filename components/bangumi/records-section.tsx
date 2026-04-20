'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import type { BangumiRecord, BangumiStatus } from '@/lib/types/bangumi'

const status_order: BangumiStatus[] = ['watching', 'want_to_watch', 'watched', 'dropped']

const status_labels: Record<BangumiStatus, string> = {
  watching: '在看',
  want_to_watch: '想看',
  watched: '看过',
  dropped: '抛弃',
}

interface RecordsSectionProps {
  records: BangumiRecord[]
  on_delete: (id: string) => void
  on_card_click: (subject_id: number) => void
}

export function RecordsSection({
  records,
  on_delete,
  on_card_click,
}: RecordsSectionProps) {
  const [selected_status, set_selected_status] = useState<BangumiStatus | 'all'>('all')

  // 按状态分组
  const grouped_records = status_order.reduce((acc, status) => {
    acc[status] = records.filter(r => r.status === status)
    return acc
  }, {} as Record<BangumiStatus, BangumiRecord[]>)

  // 有记录的状态
  const active_statuses = status_order.filter(s => grouped_records[s].length > 0)

  // 筛选后的显示
  const display_groups = selected_status === 'all'
    ? active_statuses.map(s => ({ status: s, records: grouped_records[s] }))
    : [{ status: selected_status, records: grouped_records[selected_status] || [] }]

  if (records.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>暂无追番记录</p>
        <p className="text-sm mt-2">在番剧详情页点击追番状态按钮添加记录</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 状态筛选 */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selected_status === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => set_selected_status('all')}
        >
          全部 ({records.length})
        </Button>
        {active_statuses.map((status) => (
          <Button
            key={status}
            variant={selected_status === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => set_selected_status(status)}
          >
            {status_labels[status]} ({grouped_records[status].length})
          </Button>
        ))}
      </div>

      {/* 记录列表 */}
      {display_groups.map(({ status, records: group_records }) => (
        <div key={status} className="flex flex-col gap-3">
          {/* 状态标题（仅在全部模式下显示） */}
          {selected_status === 'all' && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{status_labels[status]}</Badge>
              <span className="text-muted-foreground text-sm">
                ({group_records.length}部)
              </span>
            </div>
          )}

          {/* 番剧瀑布流 */}
          {group_records.length > 0 ? (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
              {group_records.map((record) => (
                <Card
                  key={record.id}
                  className={cn('break-inside-avoid overflow-hidden cursor-pointer group')}
                  onClick={() => on_card_click(record.subject_id)}
                >
                  {/* 封面 */}
                  {record.cover_url ? (
                    <img
                      src={record.cover_url}
                      alt={record.title}
                      className="aspect-[3/4] w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="aspect-[3/4] w-full bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground text-lg font-medium">{record.title.slice(0, 2)}</span>
                    </div>
                  )}

                  {/* 标题和进度 */}
                  <CardContent className="p-2">
                    <h3 className="font-medium text-sm leading-tight line-clamp-2">
                      {record.title}
                    </h3>
                    {record.progress ? (
                      <p className="text-xs text-muted-foreground mt-1">
                        进度: {record.progress}
                      </p>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground text-sm">
              暂无{status_labels[status]}记录
            </div>
          )}
        </div>
      ))}
    </div>
  )
}