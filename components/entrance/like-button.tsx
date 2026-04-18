'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

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
    <Button
      variant="outline"
      size="sm"
      onClick={handle_like}
      disabled={is_liked}
      className={cn(
        'backdrop-blur-sm gap-2',
        is_liked ? 'cursor-default' : 'hover:scale-105',
        className
      )}
    >
      <Heart
        className={cn(
          'size-4',
          is_liked ? 'fill-destructive text-destructive' : 'text-foreground',
          is_animating ? 'animate-ping' : ''
        )}
      />
      <span className="font-medium">{count}</span>
    </Button>
  )
}