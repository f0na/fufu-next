'use client'

import { useLayoutEffect, useRef, useContext } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { RightSidebarPortalContext } from '@/context/right-sidebar-portal-context'

interface ArchiveSidebarProps {
  sort: 'asc' | 'desc'
  onSortChange: (sort: 'asc' | 'desc') => void
  year: string | undefined
  onYearChange: (year: string | undefined) => void
  years: string[]
  tags: string[]
  onTagsChange: (tags: string[]) => void
  /** 是否作为 portal target 容器（仅桌面端需要） */
  is_portal_target?: boolean
}

export function ArchiveSidebar({
  sort,
  onSortChange,
  year,
  onYearChange,
  years,
  tags,
  onTagsChange,
  is_portal_target = false,
}: ArchiveSidebarProps) {
  const portal_target_ref = useRef<HTMLDivElement>(null)
  const { set_portal_target } = useContext(RightSidebarPortalContext)

  // 仅在作为 portal target 时注册（桌面端）
  useLayoutEffect(() => {
    if (is_portal_target && portal_target_ref.current) {
      set_portal_target(portal_target_ref.current)
    }
    return () => {
      if (is_portal_target) {
        set_portal_target(null)
      }
    }
  }, [set_portal_target, is_portal_target])

  // 标签多选处理
  const handle_tag_click = (tag_item: string) => {
    if (tags.includes(tag_item)) {
      onTagsChange(tags.filter(t => t !== tag_item))
    } else {
      onTagsChange([...tags, tag_item])
    }
  }

  // 点击全部取消所有选中
  const handle_all_click = () => {
    onTagsChange([])
  }

  return (
    <aside className="flex flex-col gap-4 w-full">
      {/* Portal target - 仅桌面端需要，Live2D 会渲染到这里 */}
      {is_portal_target && <div ref={portal_target_ref} />}

      {/* 排序选项 */}
      <Card size="sm">
        <CardHeader>
          <CardTitle>排序</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant={sort === 'desc' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onSortChange('desc')}
            >
              时间倒序
            </Button>
            <Button
              variant={sort === 'asc' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onSortChange('asc')}
            >
              时间正序
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 年份选择 */}
      <Card size="sm">
        <CardHeader>
          <CardTitle>年份</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={year === undefined ? 'default' : 'outline'}
              size="sm"
              onClick={() => onYearChange(undefined)}
            >
              全部
            </Button>
            {years.map((year_item) => (
              <Button
                key={year_item}
                variant={year === year_item ? 'default' : 'outline'}
                size="sm"
                onClick={() => onYearChange(year_item)}
              >
                {year_item}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 标签筛选 */}
      <Card size="sm">
        <CardHeader>
          <CardTitle>标签</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={tags.length === 0 ? 'default' : 'outline'}
              size="sm"
              onClick={handle_all_click}
            >
              全部
            </Button>
            {['技术', 'Next.js', 'React', 'TypeScript', '生活', '音乐', '动漫', '编程'].map((tag_item) => (
              <Button
                key={tag_item}
                variant={tags.includes(tag_item) ? 'default' : 'outline'}
                size="sm"
                onClick={() => handle_tag_click(tag_item)}
              >
                {tag_item}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </aside>
  )
}