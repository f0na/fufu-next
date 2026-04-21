'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface RunningDaysCounterProps {
  start_date: string // 格式: YYYY-MM-DD
  className?: string
}

export function RunningDaysCounter({
  start_date,
  className,
}: RunningDaysCounterProps) {
  const [days, set_days] = useState(0)

  useEffect(() => {
    const start = new Date(start_date)
    const now = new Date()
    const diff_time = now.getTime() - start.getTime()
    const diff_days = Math.floor(diff_time / (1000 * 60 * 60 * 24))
    set_days(diff_days)
  }, [start_date])

  return (
    <Card className={className}>
      <CardContent className="flex flex-col items-center py-6">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          <Clock className="size-4" />
          <span className="text-sm">网站已运行</span>
        </div>
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex items-baseline gap-1"
        >
          <motion.span
            key={days}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-5xl font-bold text-primary tabular-nums"
          >
            {days.toLocaleString()}
          </motion.span>
          <span className="text-2xl text-muted-foreground">天</span>
        </motion.div>
        <div className="text-xs text-muted-foreground/60 mt-2">
          自 {start_date} 起
        </div>
      </CardContent>
    </Card>
  )
}