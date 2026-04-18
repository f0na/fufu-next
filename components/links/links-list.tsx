"use client"

import { RefObject } from "react"
import { Spinner } from "@/components/ui/spinner"
import { LinkCard } from "@/components/links/link-card"
import type { LinkItem } from "@/lib/types/link"

interface LinksListProps {
  links: LinkItem[]
  isLoading: boolean
  hasMore: boolean
  sentinelRef?: RefObject<HTMLDivElement | null>
}

export function LinksList({ links, isLoading, hasMore, sentinelRef }: LinksListProps) {
  if (links.length === 0 && !isLoading) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        暂无链接
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-20">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {links.map((link) => (
          <LinkCard key={link.id} link={link} />
        ))}
      </div>

      {/* 哨兵元素用于无限滚动检测 */}
      {hasMore && (
        <div ref={sentinelRef} className="h-20 flex items-center justify-center">
          {isLoading && <Spinner className="size-6" />}
        </div>
      )}
    </div>
  )
}