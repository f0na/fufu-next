'use client'

import { useEffect, useState } from 'react'

interface ClockWidgetProps {
  className?: string
}

import { cn } from '@/lib/utils'

export function ClockWidget({ className }: ClockWidgetProps) {
  const [time, set_time] = useState('00:00:00')

  useEffect(() => {
    const update_time = () => {
      const now = new Date()
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')
      set_time(`${hours}:${minutes}:${seconds}`)
    }

    update_time()
    const interval = setInterval(update_time, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className={cn(
        'bg-card/80 backdrop-blur-sm rounded-xl px-3 py-2 border border-border shadow-lg',
        className
      )}
    >
      <div className="text-lg font-mono text-foreground tracking-wider">
        {time}
      </div>
    </div>
  )
}