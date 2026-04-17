'use client'

import { useRef, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import * as PIXI from 'pixi.js'
import { cn } from '@/lib/utils'

// Cubism 4 SDK 路径
const CUBISM4_SDK_PATH = '/live2d/live2dcubismcore.min.js'

// 动态加载 Cubism 4 SDK
const load_cubism4_sdk = (): Promise<void> => {
  if (typeof window === 'undefined') return Promise.resolve()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((window as any).Live2DCubismCore) return Promise.resolve()

  const script = document.createElement('script')
  script.src = CUBISM4_SDK_PATH
  script.async = true

  return new Promise((resolve, reject) => {
    script.onload = () => setTimeout(resolve, 100)
    script.onerror = () => reject(new Error('Failed to load Cubism 4 SDK'))
    document.head.appendChild(script)
  })
}

interface Live2DMascotProps {
  model_path?: string
  on_click_dialog?: () => void
  className?: string
}

const DIALOG_MESSAGES = [
  '你好呀~',
  '今天想听什么歌？',
  '芙宁娜在这里等你很久了呢~',
  '有什么有趣的事情吗？',
  '累了就休息一下吧~',
  '要一起来看演出吗？',
  '希望你今天过得愉快！',
  '我为你准备了一首曲子~',
]

const EXPRESSIONS = ['BuOu', 'HeiLian', 'HaiXiu', 'XingXing', 'O']
const DEFAULT_EXPRESSION = 'O'

export function Live2DMascot({
  model_path = '/live2d/Furina/Furina.model3.json',
  on_click_dialog,
  className,
}: Live2DMascotProps) {
  const router = useRouter()
  const canvas_ref = useRef<HTMLCanvasElement>(null)
  const app_ref = useRef<PIXI.Application | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const model_ref = useRef<any>(null)

  const [is_loaded, set_is_loaded] = useState(false)
  const [show_dialog, set_show_dialog] = useState(false)
  const [dialog_message, set_dialog_message] = useState('')

  // 用于连续点击检测
  const click_count_ref = useRef(0)
  const click_timer_ref = useRef<ReturnType<typeof setTimeout> | null>(null)
  const last_click_time_ref = useRef(0)
  const on_click_dialog_ref = useRef(on_click_dialog)
  on_click_dialog_ref.current = on_click_dialog

  useEffect(() => {
    if (!canvas_ref.current) return

    let is_mounted = true

    const init_live2d = async () => {
      try {
        await load_cubism4_sdk()
        if (!is_mounted) return

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(window as any).PIXI = PIXI

        const { Live2DModel } = await import('pixi-live2d-display/cubism4')
        if (!is_mounted) return

        // 使用 React 的 canvas ref 作为 PIXI 的 view
        const canvas = canvas_ref.current!
        const app = new PIXI.Application({
          backgroundAlpha: 0,
          antialias: true,
          resolution: window.devicePixelRatio || 1,
          autoDensity: true,
          width: 160,
          height: 200,
          view: canvas, // 直接使用 React 的 canvas
        })
        app_ref.current = app

        if (!is_mounted) {
          app.destroy()
          app_ref.current = null
          return
        }

        Live2DModel.registerTicker(PIXI.Ticker)

        // 加载模型
        const model = await Live2DModel.from(model_path)
        if (!is_mounted) {
          model.destroy()
          return
        }

        model_ref.current = model

        // 设置模型属性
        model.anchor.set(0.5, 0.5)
        model.scale.set(0.05)
        model.x = 80
        model.y = 100

        app.stage.addChild(model)
        model.autoUpdate = true

        // 设置初始表情
        try {
          model.expression(DEFAULT_EXPRESSION)
        } catch {}

        set_is_loaded(true)
      } catch (error) {
        console.error('Failed to initialize Live2D:', error)
      }
    }

    init_live2d()

    return () => {
      is_mounted = false
      if (click_timer_ref.current) clearTimeout(click_timer_ref.current)
      if (model_ref.current) {
        model_ref.current.destroy()
        model_ref.current = null
      }
      if (app_ref.current) {
        // 只销毁 PIXI 应用，不销毁 canvas（React 会处理）
        app_ref.current.destroy(false)
        app_ref.current = null
      }
    }
  }, [model_path])

  // 处理点击 - 检测是否点击在模型上
  const handle_click = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!model_ref.current || !is_loaded) return

    const canvas = canvas_ref.current
    if (!canvas) return

    const model = model_ref.current

    // 获取点击在 canvas 上的 CSS 坏点坐标
    const rect = canvas.getBoundingClientRect()
    const css_x = e.clientX - rect.left
    const css_y = e.clientY - rect.top

    // 模型锚点在中心 (0.5, 0.5)，位置在 (80, 100)
    // 检测点击是否在模型范围内（缩小到 60% 避免边缘空白区域）
    const center_x = model.x
    const center_y = model.y
    const half_width = (model.width || 100) / 2 * 0.6
    const half_height = (model.height || 100) / 2 * 0.6

    if (Math.abs(css_x - center_x) <= half_width &&
        Math.abs(css_y - center_y) <= half_height) {
      trigger_dialog()
    }
  }

  const trigger_dialog = () => {
    const now = Date.now()
    if (now - last_click_time_ref.current < 5000) return
    last_click_time_ref.current = now

    on_click_dialog_ref.current?.()

    // 切换表情
    const model = model_ref.current
    if (model) {
      const random_exp = EXPRESSIONS[Math.floor(Math.random() * EXPRESSIONS.length)]
      try {
        model.expression(random_exp)
        setTimeout(() => {
          if (model_ref.current) {
            try {
              model_ref.current.expression(DEFAULT_EXPRESSION)
            } catch {}
          }
        }, 3000)
      } catch {}
    }

    // 显示对话
    const random_index = Math.floor(Math.random() * DIALOG_MESSAGES.length)
    set_dialog_message(DIALOG_MESSAGES[random_index] ?? '')
    set_show_dialog(true)
    setTimeout(() => set_show_dialog(false), 3000)

    // 连续点击计数
    click_count_ref.current += 1
    if (click_timer_ref.current) clearTimeout(click_timer_ref.current)
    click_timer_ref.current = setTimeout(() => {
      click_count_ref.current = 0
    }, 10000)

    if (click_count_ref.current >= 10) {
      click_count_ref.current = 0
      if (click_timer_ref.current) clearTimeout(click_timer_ref.current)
      router.push('/admin')
    }
  }

  return (
    <div className={cn('w-full h-[200px] relative', className)}>
      <canvas
        ref={canvas_ref}
        onClick={handle_click}
        className={cn(
          'w-full h-full cursor-pointer transition-opacity duration-500',
          is_loaded ? 'opacity-100' : 'opacity-0'
        )}
        width={160}
        height={200}
      />

      {show_dialog && (
        <div
          className={cn(
            'absolute -top-12 left-1/2 -translate-x-1/2',
            'bg-card/95 backdrop-blur-sm',
            'rounded-xl px-3 py-1.5 border border-border',
            'text-sm text-foreground whitespace-nowrap shadow-lg'
          )}
        >
          {dialog_message}
          <div
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-card"
          />
        </div>
      )}

      {!is_loaded && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm pointer-events-none">
          Loading...
        </div>
      )}
    </div>
  )
}