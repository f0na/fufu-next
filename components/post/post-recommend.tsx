'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import type { Post } from '@/lib/types/post'
import { cn } from '@/lib/utils'

interface PostRecommendProps {
  /** 推荐文章列表（预获取的数据） */
  posts: Post[]
  /** 自定义类名 */
  className?: string
}

/**
 * 推荐文章组件
 * 显示传入的文章列表
 */
export function PostRecommend({
  posts,
  className,
}: PostRecommendProps) {
  // 如果没有推荐文章，不显示组件
  if (posts.length === 0) {
    return null
  }

  // 格式化日期
  const format_date = (date_string: string): string => {
    const date = new Date(date_string)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* 标题 */}
      <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
        <span className="text-primary">|</span>
        相关推荐
      </h2>

      {/* 推荐文章卡片 - grid布局，items-start让每个卡片独立高度 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/posts/${post.slug}`}
            className="group"
          >
            <Card
              size="sm"
              className={cn(
                'transition-all duration-200',
                'hover:ring-2 hover:ring-primary/30 hover:shadow-md',
                'cursor-pointer overflow-hidden',
                '!pt-0 !gap-0' // 覆盖 Card 的 padding，让图片从顶部开始
              )}
            >
              {/* 封面图 - 覆盖顶部圆角 */}
              {post.cover && (
                <div className="relative aspect-video w-full overflow-hidden rounded-t-xl">
                  <Image
                    src={post.cover}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    unoptimized
                  />
                </div>
              )}

              <CardHeader className="pb-2 pt-3">
                <CardTitle className="text-sm line-clamp-2 group-hover:text-primary transition-colors">
                  {post.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="pb-3">
                {/* 摘要 */}
                {post.excerpt && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {post.excerpt}
                  </p>
                )}
              </CardContent>

              {/* 底部时间和标签 - 换行显示 */}
              <div className="px-4 pb-3 flex flex-col gap-2">
                <time className="text-xs text-muted-foreground">
                  {format_date(post.date)}
                </time>

                {post.tags.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {post.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-1.5 py-0.5 bg-muted rounded text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                    {post.tags.length > 2 && (
                      <span className="text-xs text-muted-foreground">
                        +{post.tags.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}