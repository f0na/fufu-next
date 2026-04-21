'use client'

import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { RunningDaysCounter } from './running-days-counter'
import { StatusStatsGrid } from './status-stats-grid'

interface StatusContentProps {
  start_date?: string
  stats?: {
    key: string
    label: string
    value: number
    trend?: number
    icon: React.ComponentType<{ className?: string }>
  }[]
  trend_data?: { month: string; visitors: number }[]
  className?: string
}

const default_start_date = '2026-04-17'

const default_trend_data = [
  { month: '一月', visitors: 45 },
  { month: '二月', visitors: 68 },
  { month: '三月', visitors: 89 },
  { month: '四月', visitors: 128 },
]

const trend_chart_config = {
  visitors: {
    label: '访问量',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig

export function StatusContent({
  start_date = default_start_date,
  stats,
  trend_data = default_trend_data,
  className,
}: StatusContentProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      {/* 运行天数计时器 */}
      <RunningDaysCounter
        start_date={start_date}
        className="mb-6"
      />

      {/* 统计数据网格 */}
      <div className="mb-6">
        <h2 className="text-lg font-medium text-foreground mb-4">统计数据</h2>
        <StatusStatsGrid stats={stats} />
      </div>

      {/* 访问趋势图表 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">访问趋势</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={trend_chart_config}>
            <AreaChart
              accessibilityLayer
              data={trend_data}
              margin={{ left: 12, right: 12 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Area
                dataKey="visitors"
                type="natural"
                fill="var(--color-visitors)"
                fillOpacity={0.4}
                stroke="var(--color-visitors)"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </motion.div>
  )
}