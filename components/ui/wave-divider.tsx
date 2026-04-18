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
 * 三层波浪使用相同的周期和振幅，确保视觉协调
 * 通过透明度和动画速度区分层次
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
      {/* 第一层波浪 - 慢速，最淡，最小振幅，最小周期 */}
      {/* 周期400，振幅8（波谷y=16，波峰y=32，基线y=24） */}
      {/* 400是1200的1/3，确保x=0和x=1200形状一致 */}
      <svg
        className="absolute bottom-0 w-[200%] animate-wave-slow"
        viewBox="0 0 2400 48"
        preserveAspectRatio="none"
      >
        <path
          d="M0,24 Q100,16 200,24 Q300,32 400,24 Q500,16 600,24 Q700,32 800,24 Q900,16 1000,24 Q1100,32 1200,24 Q1300,16 1400,24 Q1500,32 1600,24 Q1700,16 1800,24 Q1900,32 2000,24 Q2100,16 2200,24 Q2300,32 2400,24 L2400,48 L0,48 Z"
          fill="var(--primary)"
          fillOpacity={0.15}
        />
      </svg>

      {/* 第二层波浪 - 中速，中等透明度，中等振幅，中等周期 */}
      {/* 周期600，振幅16（波谷y=16，波峰y=48，基线y=32） */}
      {/* 600是1200的1/2，确保x=0和x=1200形状一致 */}
      <svg
        className="absolute bottom-0 w-[200%] animate-wave"
        style={{ animationDelay: '-2s' }}
        viewBox="0 0 2400 48"
        preserveAspectRatio="none"
      >
        <path
          d="M0,32 Q150,16 300,32 Q450,48 600,32 Q750,16 900,32 Q1050,48 1200,32 Q1350,16 1500,32 Q1650,48 1800,32 Q1950,16 2100,32 Q2250,48 2400,32 L2400,48 L0,48 Z"
          fill="var(--primary)"
          fillOpacity={0.25}
        />
      </svg>

      {/* 第三层波浪 - 快速，最明显，最大振幅，最大周期 */}
      {/* 周期1200，振幅24（波谷y=16，波峰y=64，基线y=40） */}
      {/* 1200周期，单个大波形 */}
      <svg
        className="absolute bottom-0 w-[200%] animate-wave-fast"
        style={{ animationDelay: '-1.5s' }}
        viewBox="0 0 2400 48"
        preserveAspectRatio="none"
      >
        <path
          d="M0,40 Q300,16 600,40 Q900,64 1200,40 Q1500,16 1800,40 Q2100,64 2400,40 L2400,48 L0,48 Z"
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