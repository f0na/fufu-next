'use client'

import { motion } from 'framer-motion'
import {
  Eye,
  Tv,
  FileText,
  Image,
  Link2,
  MessageCircle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatItem {
  key: string
  label: string
  value: number
  trend?: number // 正数为增长，负数为下降
  icon: React.ComponentType<{ className?: string }>
}

interface StatusStatsGridProps {
  stats?: StatItem[]
  className?: string
}

const default_stats: StatItem[] = [
  {
    key: 'visitors',
    label: '访问数',
    value: 128,
    trend: 12,
    icon: Eye,
  },
  {
    key: 'anime',
    label: '追番数',
    value: 42,
    trend: 3,
    icon: Tv,
  },
  {
    key: 'posts',
    label: '文章数',
    value: 15,
    trend: 2,
    icon: FileText,
  },
  {
    key: 'images',
    label: '图片数',
    value: 120,
    trend: 8,
    icon: Image,
  },
  {
    key: 'links',
    label: '链接数',
    value: 8,
    trend: 1,
    icon: Link2,
  },
  {
    key: 'comments',
    label: '评论数',
    value: 32,
    trend: 5,
    icon: MessageCircle,
  },
]

const container_animation = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const item_animation = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 },
}

export function StatusStatsGrid({
  stats = default_stats,
  className,
}: StatusStatsGridProps) {
  return (
    <motion.div
      variants={container_animation}
      initial="hidden"
      animate="show"
      className={cn(
        'grid grid-cols-2 sm:grid-cols-3 gap-4',
        className
      )}
    >
      {stats.map((stat) => {
        const Icon = stat.icon
        const is_positive_trend = stat.trend && stat.trend > 0
        const is_negative_trend = stat.trend && stat.trend < 0

        return (
          <motion.div key={stat.key} variants={item_animation}>
            <Card className="h-full">
              <CardContent className="flex flex-col items-center py-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="size-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {stat.label}
                  </span>
                </div>
                <div className="text-2xl font-bold text-foreground tabular-nums">
                  {stat.value.toLocaleString()}
                </div>
                {stat.trend !== undefined && (
                  <div
                    className={cn(
                      'flex items-center gap-1 text-xs mt-1',
                      is_positive_trend && 'text-chart-1',
                      is_negative_trend && 'text-destructive',
                      !is_positive_trend && !is_negative_trend && 'text-muted-foreground'
                    )}
                  >
                    {is_positive_trend && (
                      <TrendingUp className="size-3" />
                    )}
                    {is_negative_trend && (
                      <TrendingDown className="size-3" />
                    )}
                    <span>
                      {is_positive_trend && `+${stat.trend}`}
                      {is_negative_trend && `${stat.trend}`}
                      {!is_positive_trend && !is_negative_trend && '0'}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </motion.div>
  )
}