'use client'

import { useLayoutEffect, useRef, useContext, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RightSidebarPortalContext } from '@/context/right-sidebar-portal-context'
import { Search, Save } from 'lucide-react'
import type { BangumiStatus, BangumiSubject, BangumiRecord } from '@/lib/types/bangumi'

const status_labels: Record<BangumiStatus, string> = {
  watching: '在看',
  want_to_watch: '想看',
  watched: '看过',
  dropped: '抛弃',
}

interface BangumiSidebarProps {
  view: 'latest' | 'records' | 'search' | 'detail'
  on_view_change: (view: 'latest' | 'records' | 'search') => void
  selected_subject: BangumiSubject | null
  records: BangumiRecord[]
  on_status_change: (subject_id: number, status: BangumiStatus) => void
  on_progress_change: (subject_id: number, progress: string) => void
  portal_ref: React.RefObject<HTMLDivElement | null>
}

export function BangumiSidebar({
  view,
  on_view_change,
  selected_subject,
  records,
  on_status_change,
  on_progress_change,
  portal_ref,
}: BangumiSidebarProps) {
  const { set_portal_target } = useContext(RightSidebarPortalContext)
  const portal_registered_ref = useRef(false)

  // 进度输入状态
  const [progress_input, set_progress_input] = useState('')
  const [has_progress_changed, set_has_progress_changed] = useState(false)

  // 注册 portal target（看板娘渲染位置）
  useLayoutEffect(() => {
    if (portal_ref.current && !portal_registered_ref.current) {
      set_portal_target(portal_ref.current)
      portal_registered_ref.current = true
    }
    return () => {
      // 清理时重置 portal target 和注册状态
      set_portal_target(null)
      portal_registered_ref.current = false
    }
  }, [set_portal_target, portal_ref])

  // 当前选中番剧的状态和进度
  const current_record = selected_subject
    ? records.find(r => r.subject_id === selected_subject.id)
    : undefined
  const current_status = current_record?.status
  const current_progress = current_record?.progress || ''

  // 当选中番剧变化时，重置输入框
  useLayoutEffect(() => {
    if (selected_subject) {
      set_progress_input(current_progress)
      set_has_progress_changed(false)
    }
  }, [selected_subject?.id, current_progress])

  // 处理进度输入变化
  const handle_progress_change = (value: string) => {
    set_progress_input(value)
    set_has_progress_changed(value !== current_progress)
  }

  // 保存进度
  const handle_save_progress = () => {
    if (selected_subject && has_progress_changed) {
      on_progress_change(selected_subject.id, progress_input)
      set_has_progress_changed(false)
    }
  }

  return (
    <aside className="flex flex-col gap-4 w-full">
      {/* Portal target - 看板娘渲染位置 */}
      <div ref={portal_ref} />

      {/* 视图切换 - 仅在列表页显示 */}
      {!selected_subject && (
        <Card size="sm">
          <CardContent className="p-3">
            <div className="flex flex-col gap-2">
              <Button
                variant={view === 'latest' ? 'default' : 'outline'}
                size="sm"
                onClick={() => on_view_change('latest')}
              >
                最新番剧
              </Button>
              <Button
                variant={view === 'records' ? 'default' : 'outline'}
                size="sm"
                onClick={() => on_view_change('records')}
              >
                番剧记录
              </Button>
              <Button
                variant={view === 'search' ? 'default' : 'outline'}
                size="sm"
                onClick={() => on_view_change('search')}
              >
                <Search className="size-4" />
                搜索
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 详情页状态操作 */}
      {selected_subject && (
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-sm">追番状态</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {/* 状态按钮 */}
              {(['watching', 'want_to_watch', 'watched', 'dropped'] as BangumiStatus[]).map(
                (status) => (
                  <Button
                    key={status}
                    variant={current_status === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => on_status_change(selected_subject.id, status)}
                  >
                    {status_labels[status]}
                  </Button>
                )
              )}

              {/* 进度输入 */}
              <div className="flex flex-col gap-1.5 pt-2">
                <span className="text-xs text-muted-foreground">观看进度</span>
                <div className="flex gap-2">
                  <Input
                    value={progress_input}
                    onChange={(e) => handle_progress_change(e.target.value)}
                    placeholder="如: EP05"
                    className="flex-1"
                  />
                  {has_progress_changed && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handle_save_progress}
                    >
                      <Save className="size-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </aside>
  )
}