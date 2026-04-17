'use client'

import { cn } from '@/lib/utils'

interface WaveDividerProps {
  height?: number
  className?: string
  flip?: boolean
}

/**
 * 波浪分隔组件 - 多层动态波浪效果
 *
 * 三层波浪使用相同的周期（波峰间距600），确保视觉协调
 * 通过振幅、透明度和动画速度区分层次
 */
export function WaveDivider({
  height = 48,
  className,
  flip = false,
}: WaveDividerProps) {
  return (
    <div
      className={cn(
        'relative w-full overflow-hidden leading-none',
        flip && 'rotate-180',
        className
      )}
      style={{ height: `${height}px`, marginTop: '-1px' }}
    >
      {/* 第一层波浪 - 慢速，小振幅 */}
      {/* 周期600，振幅8（波谷y=16，波峰y=32，基线y=24） */}
      <svg
        className="absolute bottom-0 w-[200%] animate-wave-slow"
        viewBox="0 0 2400 48"
        preserveAspectRatio="none"
      >
        <path
          d="M0,24 Q150,16 300,24 Q450,32 600,24 Q750,16 900,24 Q1050,32 1200,24 Q1350,16 1500,24 Q1650,32 1800,24 Q1950,16 2100,24 Q2250,32 2400,24 L2400,48 L0,48 Z"
          fill="var(--primary)"
          fillOpacity={0.15}
        />
      </svg>

      {/* 第二层波浪 - 中速，中等振幅 */}
      {/* 周期600，振幅12（波谷y=20，波峰y=44，基线y=32） */}
      <svg
        className="absolute bottom-0 w-[200%] animate-wave"
        style={{ animationDelay: '-2s' }}
        viewBox="0 0 2400 48"
        preserveAspectRatio="none"
      >
        <path
          d="M0,32 Q150,20 300,32 Q450,44 600,32 Q750,20 900,32 Q1050,44 1200,32 Q1350,20 1500,32 Q1650,44 1800,32 Q1950,20 2100,32 Q2250,44 2400,32 L2400,48 L0,48 Z"
          fill="var(--primary)"
          fillOpacity={0.25}
        />
      </svg>

      {/* 第三层波浪 - 快速，大振幅 */}
      {/* 周期600，振幅16（波谷y=28，波峰y=56，基线y=42） */}
      <svg
        className="absolute bottom-0 w-[200%] animate-wave-fast"
        style={{ animationDelay: '-1.5s' }}
        viewBox="0 0 2400 48"
        preserveAspectRatio="none"
      >
        <path
          d="M0,42 Q150,28 300,42 Q450,56 600,42 Q750,28 900,42 Q1050,56 1200,42 Q1350,28 1500,42 Q1650,56 1800,42 Q1950,28 2100,42 Q2250,56 2400,42 L2400,48 L0,48 Z"
          fill="var(--primary)"
          fillOpacity={0.4}
        />
      </svg>
    </div>
  )
}

/**
 * 顶部波浪
 */
export function WaveDividerTop(props: Omit<WaveDividerProps, 'flip'>) {
  return <WaveDivider {...props} flip />
}

/**
 * 底部波浪
 */
export function WaveDividerBottom(props: Omit<WaveDividerProps, 'flip'>) {
  return <WaveDivider {...props} />
}