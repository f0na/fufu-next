'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'

interface ClockWidgetProps {
  className?: string
}

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
    <Card size="sm" className={className}>
      <CardContent className="text-lg font-mono tracking-wider">
        {time}
      </CardContent>
    </Card>
  )
}