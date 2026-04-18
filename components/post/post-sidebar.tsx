'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Heart, Eye, MessageCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { PostToc, type TocHeading } from './post-toc'
import { cn } from '@/lib/utils'

interface PostSidebarProps {
  /** 文章封面图 */
  cover?: string
  /** 点赞数 */
  likes?: number
  /** 浏览数 */
  views?: number
  /** 评论数 */
  comments_count?: number
  /** 文章摘要 */
  excerpt?: string
  /** 目录标题列表 */
  headings?: TocHeading[]
  /** 评论区的元素ID，用于滚动定位 */
  comments_section_id?: string
  /** 自定义类名 */
  className?: string
}

export function PostSidebar({
  cover,
  likes = 0,
  views = 0,
  comments_count = 0,
  excerpt,
  headings = [],
  comments_section_id = 'comments',
  className,
}: PostSidebarProps) {
  const [is_liked, set_is_liked] = useState(false)
  const [current_likes, set_current_likes] = useState(likes)
  const [is_animating, set_is_animating] = useState(false)

  // 点赞处理
  const handle_like = async () => {
    if (is_liked) return

    set_is_animating(true)
    set_is_liked(true)
    set_current_likes((prev) => prev + 1)

    // TODO: 预留 API 调用
    // try {
    //   await fetch('/api/post/like', { method: 'POST' })
    // } catch (e) {
    //   console.error('Failed to update like count')
    // }

    setTimeout(() => set_is_animating(false), 500)
  }

  // 滚动到评论区
  const scroll_to_comments = () => {
    const element = document.getElementById(comments_section_id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className={cn('flex flex-col gap-4 w-full', className)}>
      {/* 封面图 - 图片完全填充容器，不留空白 */}
      {cover && (
        <div className="relative aspect-video w-full overflow-hidden rounded-xl ring-1 ring-foreground/10">
          <Image
            src={cover}
            alt="文章封面"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 300px"
            unoptimized
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
            }}
          />
        </div>
      )}

      {/* 统计信息 */}
      <Card size="sm">
        <CardContent className="flex items-center justify-around py-3">
          {/* 点赞 */}
          <button
            onClick={handle_like}
            disabled={is_liked}
            className={cn(
              'flex flex-col items-center gap-1 transition-all',
              is_liked ? 'cursor-default' : 'hover:scale-105 cursor-pointer'
            )}
            aria-label={is_liked ? '已点赞' : '点击点赞'}
          >
            <Heart
              className={cn(
                'size-5 transition-all',
                is_animating && 'animate-ping',
                is_liked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
              )}
            />
            <span
              className={cn(
                'text-xs font-medium',
                is_liked ? 'text-red-500' : 'text-muted-foreground'
              )}
            >
              {current_likes}
            </span>
          </button>

          <Separator orientation="vertical" className="h-8" />

          {/* 浏览数 */}
          <div className="flex flex-col items-center gap-1">
            <Eye className="size-5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">{views}</span>
          </div>

          <Separator orientation="vertical" className="h-8" />

          {/* 评论数 - 可点击跳转 */}
          <button
            onClick={scroll_to_comments}
            className="flex flex-col items-center gap-1 transition-all hover:scale-105 cursor-pointer"
            aria-label="跳转到评论区"
          >
            <MessageCircle className="size-5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">{comments_count}</span>
          </button>
        </CardContent>
      </Card>

      {/* 文章摘要 */}
      {excerpt && (
        <Card size="sm">
          <CardContent className="py-3">
            <h3 className="text-sm font-medium mb-2 text-foreground">摘要</h3>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-5">
              {excerpt}
            </p>
          </CardContent>
        </Card>
      )}

      {/* 目录 */}
      {headings.length > 0 && <PostToc headings={headings} />}
    </div>
  )
}