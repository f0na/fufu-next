'use client'

import { cn } from '@/lib/utils'

interface WaveDividerProps {
  height?: number
  className?: string
  flip?: boolean
}

/**
 * 波浪分隔组件 - 多层动态波浪效果
 * 作为图片区域和内容区域的装饰性分割
 * 使用主题色不同透明度创建层次感
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
      {/* 第一层波浪 - 最底层，慢速 */}
      <svg
        className="absolute bottom-0 w-[200%] animate-wave-slow"
        viewBox="0 0 2400 48"
        preserveAspectRatio="none"
      >
        <path
          d="M0,24 Q300,8 600,24 Q900,40 1200,24 Q1500,8 1800,24 Q2100,40 2400,24 L2400,48 L0,48 Z"
          fill="var(--primary)"
          fillOpacity="0.15"
        />
      </svg>

      {/* 第二层波浪 - 中速 */}
      <svg
        className="absolute bottom-0 w-[200%] animate-wave"
        style={{ animationDelay: '-3s' }}
        viewBox="0 0 2400 48"
        preserveAspectRatio="none"
      >
        <path
          d="M0,32 Q200,16 400,32 Q600,48 800,32 Q1000,16 1200,32 Q1400,48 1600,32 Q1800,16 2000,32 Q2200,48 2400,32 L2400,48 L0,48 Z"
          fill="var(--primary)"
          fillOpacity="0.25"
        />
      </svg>

      {/* 第三层波浪 - 快速 */}
      <svg
        className="absolute bottom-0 w-[200%] animate-wave-fast"
        style={{ animationDelay: '-5s' }}
        viewBox="0 0 2400 48"
        preserveAspectRatio="none"
      >
        <path
          d="M0,40 Q150,28 300,40 Q450,52 600,40 Q750,28 900,40 Q1050,52 1200,40 Q1350,28 1500,40 Q1650,52 1800,40 Q1950,28 2100,40 Q2250,52 2400,40 L2400,48 L0,48 Z"
          fill="var(--primary)"
          fillOpacity="0.4"
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