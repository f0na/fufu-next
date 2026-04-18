"use client"

import { RefObject } from "react"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import type { Post } from "@/lib/types/post"

interface ArchiveListProps {
  posts: Post[]
  isLoading: boolean
  hasMore: boolean
  sentinelRef?: RefObject<HTMLDivElement | null>
}

interface GroupedPosts {
  [year: string]: Post[]
}

function group_posts_by_year(posts: Post[]): GroupedPosts {
  const grouped: GroupedPosts = {}

  for (const post of posts) {
    const year = new Date(post.date).getFullYear().toString()
    if (!grouped[year]) {
      grouped[year] = []
    }
    grouped[year].push(post)
  }

  return grouped
}

function format_date(date_string: string): string {
  const date = new Date(date_string)
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`
}

export function ArchiveList({ posts, isLoading, hasMore, sentinelRef }: ArchiveListProps) {
  const grouped_posts = group_posts_by_year(posts)
  const years = Object.keys(grouped_posts).sort((a, b) => Number(b) - Number(a))

  if (posts.length === 0 && !isLoading) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        暂无文章
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-20">
      {years.map((year) => (
        <div key={year}>
          <h2 className="text-xl font-semibold">{year}年</h2>
          <Separator className="my-3" />
          <ul className="space-y-2">
            {grouped_posts[year].map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/posts/${post.slug}`}
                  className={cn(
                    "flex items-start gap-4 py-2",
                    "hover:text-primary transition-colors"
                  )}
                >
                  <time className="text-sm text-muted-foreground shrink-0 tabular-nums">
                    {format_date(post.date)}
                  </time>
                  <span className="line-clamp-2">{post.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {/* 哨兵元素用于无限滚动检测 */}
      {hasMore && (
        <div ref={sentinelRef} className="h-20 flex items-center justify-center">
          {isLoading && <Spinner className="size-6" />}
        </div>
      )}
    </div>
  )
}