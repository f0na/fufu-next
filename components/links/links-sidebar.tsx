'use client'

import { useLayoutEffect, useRef, useContext, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { RightSidebarPortalContext } from '@/context/right-sidebar-portal-context'
import { Star, Filter } from 'lucide-react'

interface LinksSidebarProps {
  /** 当前选中的标签 */
  tags: string[]
  /** 标签变更回调（接收函数以获取最新状态） */
  onTagsChange: (updater: (prev: string[]) => string[]) => void
  /** 是否只显示星标 */
  starred: boolean
  /** 星标筛选变更回调 */
  onStarredChange: (starred: boolean) => void
  /** 所有可用标签 */
  all_tags: string[]
  /** 是否作为 portal target 容器（仅桌面端需要） */
  is_portal_target?: boolean
}

export function LinksSidebar({
  tags,
  onTagsChange,
  starred,
  onStarredChange,
  all_tags,
  is_portal_target = false,
}: LinksSidebarProps) {
  const portal_target_ref = useRef<HTMLDivElement>(null)
  const portal_registered_ref = useRef(false)
  const { set_portal_target } = useContext(RightSidebarPortalContext)

  // 只在首次挂载时注册 Portal Target，避免每次渲染重新注册导致看板娘重新加载
  useLayoutEffect(() => {
    if (is_portal_target && portal_target_ref.current && !portal_registered_ref.current) {
      set_portal_target(portal_target_ref.current)
      portal_registered_ref.current = true
    }
    return () => {
      // 清理时重置 portal target 和注册状态
      set_portal_target(null)
      portal_registered_ref.current = false
    }
  }, [set_portal_target, is_portal_target])

  // 使用 ref 跟踪最新的 tags，避免闭包问题
  const tags_ref = useRef(tags)
  useEffect(() => {
    tags_ref.current = tags
  }, [tags])

  // 标签多选处理（使用函数式更新确保使用最新状态）
  const handle_tag_click = (tag_item: string) => {
    onTagsChange((prev: string[]) => {
      if (prev.includes(tag_item)) {
        return prev.filter(t => t !== tag_item)
      } else {
        return [...prev, tag_item]
      }
    })
  }

  // 点击全部取消所有选中
  const handle_all_tags_click = () => {
    onTagsChange(() => [])
  }

  return (
    <aside className="flex flex-col gap-4 w-full">
      {/* Portal target - 仅桌面端需要，Live2D 会渲染到这里 */}
      {is_portal_target && <div ref={portal_target_ref} />}

      {/* 标签筛选 */}
      <Card size="sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            分类筛选
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={tags.length === 0 ? 'default' : 'outline'}
              size="sm"
              onClick={handle_all_tags_click}
            >
              全部
            </Button>
            {all_tags.map((tag_item) => {
              const is_selected = tags_ref.current.includes(tag_item)
              return (
                <Button
                  key={tag_item}
                  variant={is_selected ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handle_tag_click(tag_item)}
                >
                  {tag_item}
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* 星标筛选 */}
      <Card size="sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            收藏筛选
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant={!starred ? 'default' : 'outline'}
              size="sm"
              onClick={() => onStarredChange(false)}
            >
              全部链接
            </Button>
            <Button
              variant={starred ? 'default' : 'outline'}
              size="sm"
              onClick={() => onStarredChange(true)}
            >
              星标收藏
            </Button>
          </div>
        </CardContent>
      </Card>
    </aside>
  )
}