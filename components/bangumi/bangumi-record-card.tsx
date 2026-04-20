'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Check, X, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BangumiRecord, BangumiStatus } from '@/lib/types/bangumi'

interface BangumiRecordCardProps {
  record: BangumiRecord
  on_progress_update?: (progress: string) => void
  on_delete?: () => void
  className?: string
}

const status_labels: Record<BangumiStatus, string> = {
  watching: '在看',
  want_to_watch: '想看',
  watched: '看过',
  dropped: '抛弃',
}

const status_colors: Record<BangumiStatus, string> = {
  watching: 'bg-primary/20 text-primary',
  want_to_watch: 'bg-secondary text-secondary-foreground',
  watched: 'bg-muted text-muted-foreground',
  dropped: 'bg-destructive/20 text-destructive',
}

export function BangumiRecordCard({
  record,
  on_progress_update,
  on_delete,
  className,
}: BangumiRecordCardProps) {
  const [is_editing, set_is_editing] = useState(false)
  const [edit_value, set_edit_value] = useState(record.progress)

  const handle_save = () => {
    if (edit_value !== record.progress && on_progress_update) {
      on_progress_update(edit_value)
    }
    set_is_editing(false)
  }

  const handle_cancel = () => {
    set_edit_value(record.progress)
    set_is_editing(false)
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      {/* 封面 */}
      <div className="relative aspect-video overflow-hidden">
        {record.cover_url ? (
          <Image
            src={record.cover_url}
            alt={record.title}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-muted-foreground text-sm">{record.title.slice(0, 2)}</span>
          </div>
        )}
      </div>

      <CardContent className="flex flex-col gap-2 p-3">
        {/* 番剧名称 */}
        <h3 className="font-medium text-sm line-clamp-2">{record.title}</h3>

        {/* 元信息 */}
        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
          {record.fansub && (
            <span className="truncate">字幕组: {record.fansub}</span>
          )}
          <Badge className={cn('text-xs', status_colors[record.status])}>
            {status_labels[record.status]}
          </Badge>
        </div>

        {/* 进度编辑 */}
        {is_editing ? (
          <InputGroup className="h-7">
            <InputGroupInput
              value={edit_value}
              onChange={(e) => set_edit_value(e.target.value)}
              placeholder="进度: pv2"
              className="text-xs"
            />
            <InputGroupAddon align="inline-end">
              <Button
                size="icon-xs"
                variant="ghost"
                onClick={handle_save}
                className="text-primary"
              >
                <Check className="size-3.5" />
              </Button>
              <Button
                size="icon-xs"
                variant="ghost"
                onClick={handle_cancel}
                className="text-muted-foreground"
              >
                <X className="size-3.5" />
              </Button>
            </InputGroupAddon>
          </InputGroup>
        ) : (
          <div className="flex items-center gap-2">
            <span
              className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
              onClick={() => set_is_editing(true)}
            >
              进度: {record.progress || '未设置'}
            </span>
          </div>
        )}

        {/* 删除按钮 */}
        {on_delete && (
          <Button
            size="icon-xs"
            variant="ghost"
            onClick={on_delete}
            className="self-end text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="size-3.5" />
          </Button>
        )}
      </CardContent>
    </Card>
  )
}