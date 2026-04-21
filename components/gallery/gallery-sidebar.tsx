'use client'

import { useLayoutEffect, useRef, useContext } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RightSidebarPortalContext } from '@/context/right-sidebar-portal-context'
import { Tag } from 'lucide-react'

interface GallerySidebarProps {
  tags: string[]
  onTagsChange: (tags: string[]) => void
  all_tags: string[]
  is_portal_target?: boolean
}

export function GallerySidebar({
  tags,
  onTagsChange,
  all_tags,
  is_portal_target = false,
}: GallerySidebarProps) {
  const portal_target_ref = useRef<HTMLDivElement>(null)
  const portal_registered_ref = useRef(false)
  const { set_portal_target } = useContext(RightSidebarPortalContext)

  // 注册 Portal Target
  useLayoutEffect(() => {
    if (is_portal_target && portal_target_ref.current && !portal_registered_ref.current) {
      set_portal_target(portal_target_ref.current)
      portal_registered_ref.current = true
    }
    return () => {
      set_portal_target(null)
      portal_registered_ref.current = false
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
      {/* Portal target - 仅桌面端需要 */}
      {is_portal_target && <div ref={portal_target_ref} />}

      {/* 标签筛选 */}
      <Card size="sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            标签
          </CardTitle>
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
            {all_tags.map((tag_item) => (
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