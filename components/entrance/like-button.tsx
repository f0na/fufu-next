'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LikeButtonProps {
  initial_count?: number
  className?: string
}

export function LikeButton({ initial_count = 0, className }: LikeButtonProps) {
  const [count, set_count] = useState(initial_count)
  const [is_liked, set_is_liked] = useState(false)
  const [is_animating, set_is_animating] = useState(false)

  const handle_like = async () => {
    if (is_liked) return

    set_is_animating(true)
    set_is_liked(true)
    set_count(prev => prev + 1)

    // 预留 API 调用
    // try {
    //   await fetch('/api/like', { method: 'POST' })
    //   const res = await fetch('/api/like/count')
    //   const data = await res.json()
    //   set_count(data.count)
    // } catch (e) {
    //   console.error('Failed to update like count')
    // }

    setTimeout(() => set_is_animating(false), 500)
  }

  return (
    <button
      onClick={handle_like}
      className={cn(
        'bg-card/80 backdrop-blur-sm rounded-2xl px-3 py-2 border border-border shadow-lg flex items-center gap-2 transition-all hover:bg-accent w-fit',
        is_liked ? 'cursor-default' : 'cursor-pointer hover:scale-105',
        className
      )}
      disabled={is_liked}
    >
      <Heart
        className={cn(
          'w-4 h-4',
          is_liked ? 'fill-destructive text-destructive' : 'text-foreground',
          is_animating ? 'animate-ping' : ''
        )}
      />
      <span className="text-foreground font-medium text-sm">{count}</span>
    </button>
  )
}