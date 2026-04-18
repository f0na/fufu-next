'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface TocHeading {
  level: number
  text: string
  id: string
}

interface PostTocProps {
  headings: TocHeading[]
  /** 移动端是否可折叠 */
  collapsible?: boolean
  /** 自定义类名 */
  className?: string
}

/**
 * 从markdown内容提取标题生成目录
 */
export function extract_headings_from_markdown(content: string): TocHeading[] {
  const headings: TocHeading[] = []
  const regex = /^(#{1,6})\s+(.+)$/gm
  let match

  while ((match = regex.exec(content)) !== null) {
    const level = match[1].length
    const text = match[2].trim()
    // 生成id：移除特殊字符，转为小写，空格转为连字符
    const id = text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s-]/gu, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    headings.push({ level, text, id })
  }

  return headings
}

export function PostToc({ headings, collapsible = false, className }: PostTocProps) {
  const [active_id, set_active_id] = useState<string | null>(null)
  const [is_expanded, set_is_expanded] = useState(!collapsible)

  // 滚动到指定章节
  const scroll_to_heading = useCallback((id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  // 使用IntersectionObserver监听当前可见章节
  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        // 找到最上面可见的标题
        const visible_entries = entries.filter((entry) => entry.isIntersecting)
        if (visible_entries.length > 0) {
          // 按位置排序，选择最上面的
          visible_entries.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
          set_active_id(visible_entries[0].target.id)
        }
      },
      {
        rootMargin: '-10% 0px -80% 0px',
        threshold: 0,
      }
    )

    // 观察所有标题元素
    headings.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => observer.disconnect()
  }, [headings])

  // 计算缩进
  const get_indent_class = useCallback((level: number) => {
    switch (level) {
      case 1:
        return 'pl-0'
      case 2:
        return 'pl-3'
      case 3:
        return 'pl-6'
      case 4:
        return 'pl-9'
      case 5:
        return 'pl-12'
      case 6:
        return 'pl-15'
      default:
        return 'pl-0'
    }
  }, [])

  // 移动端折叠时不渲染内容
  const should_show_content = !collapsible || is_expanded

  if (headings.length === 0) {
    return null
  }

  return (
    <Card size="sm" className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>目录</CardTitle>
        {collapsible && (
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => set_is_expanded(!is_expanded)}
            aria-label={is_expanded ? '收起目录' : '展开目录'}
          >
            <svg
              className={cn('size-4 transition-transform', is_expanded && 'rotate-180')}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </Button>
        )}
      </CardHeader>
      {should_show_content && (
        <CardContent>
          <nav className="space-y-1">
            {headings.map((heading, index) => (
              <button
                key={`${heading.id}-${index}`}
                onClick={() => scroll_to_heading(heading.id)}
                className={cn(
                  'w-full text-left text-sm py-1.5 px-2 rounded-md transition-colors',
                  'hover:bg-muted hover:text-foreground',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  'truncate block', // 添加truncate防止长标题溢出
                  get_indent_class(heading.level),
                  active_id === heading.id
                    ? 'text-primary font-medium bg-muted/50'
                    : 'text-muted-foreground'
                )}
                title={heading.text} // 长标题hover显示完整内容
              >
                {heading.text}
              </button>
            ))}
          </nav>
        </CardContent>
      )}
    </Card>
  )
}