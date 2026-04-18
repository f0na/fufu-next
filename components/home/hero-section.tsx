'use client'

import Image from 'next/image'
import { useState, useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { WaveDivider } from '@/components/ui/wave-divider'

const IMAGE_URL = 'https://t.alcy.cc/moez'
const BASE_HEIGHT = 40 // vh
const MAX_HEIGHT = 100 // vh

export function HeroSection() {
  const [height, set_height] = useState(BASE_HEIGHT)
  const touch_start_y = useRef(0)
  const container_ref = useRef<HTMLDivElement>(null)

  const handle_wheel = useCallback((e: WheelEvent) => {
    if (height > BASE_HEIGHT && e.deltaY > 0) {
      set_height(Math.max(height - Math.abs(e.deltaY) * 0.3, BASE_HEIGHT))
      return
    }

    if (window.scrollY > 0) return

    if (e.deltaY < 0) {
      set_height(Math.min(height + Math.abs(e.deltaY) * 0.1, MAX_HEIGHT))
    }
  }, [height])

  const handle_touch_start = useCallback((e: TouchEvent) => {
    touch_start_y.current = e.touches[0]?.clientY ?? 0
  }, [])

  const handle_touch_move = useCallback((e: TouchEvent) => {
    const current_y = e.touches[0]?.clientY ?? 0
    const delta_y = touch_start_y.current - current_y

    if (height > BASE_HEIGHT && delta_y < 0) {
      set_height(Math.max(height + delta_y * 0.1, BASE_HEIGHT))
      touch_start_y.current = current_y
      return
    }

    if (window.scrollY > 0) {
      touch_start_y.current = current_y
      return
    }

    if (delta_y > 0) {
      set_height(Math.min(height + delta_y * 0.1, MAX_HEIGHT))
    }

    touch_start_y.current = current_y
  }, [height])

  useEffect(() => {
    window.addEventListener('wheel', handle_wheel, { passive: true })
    window.addEventListener('touchstart', handle_touch_start, { passive: true })
    window.addEventListener('touchmove', handle_touch_move, { passive: true })

    return () => {
      window.removeEventListener('wheel', handle_wheel)
      window.removeEventListener('touchstart', handle_touch_start)
      window.removeEventListener('touchmove', handle_touch_move)
    }
  }, [handle_wheel, handle_touch_start, handle_touch_move])

  return (
    <div
      ref={container_ref}
      className={cn('relative w-full overflow-hidden z-0')}
      style={{ height: `${height}vh` }}
    >
      {/* 背景图片 */}
      <Image
        src={IMAGE_URL}
        alt="Hero Background"
        fill
        className="object-cover"
        priority
        unoptimized
        sizes="100vw"
      />

      {/* 渐变遮罩 */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80" />

      {/* 波浪分割 */}
      <div className="absolute bottom-0 w-full">
        <WaveDivider height={64} />
      </div>
    </div>
  )
}