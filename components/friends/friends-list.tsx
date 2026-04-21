"use client"

import { RefObject } from "react"
import { Spinner } from "@/components/ui/spinner"
import { FriendCard } from "./friend-card"
import type { FriendItem } from "@/lib/types/friend"

interface FriendsListProps {
  friends: FriendItem[]
  isLoading: boolean
  hasMore: boolean
  sentinelRef?: RefObject<HTMLDivElement | null>
}

export function FriendsList({ friends, isLoading, hasMore, sentinelRef }: FriendsListProps) {
  if (friends.length === 0 && !isLoading) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        暂无友链
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-20">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {friends.map((friend) => (
          <FriendCard key={friend.id} friend={friend} />
        ))}
      </div>

      {hasMore && (
        <div ref={sentinelRef} className="h-20 flex items-center justify-center">
          {isLoading && <Spinner className="size-6" />}
        </div>
      )}
    </div>
  )
}