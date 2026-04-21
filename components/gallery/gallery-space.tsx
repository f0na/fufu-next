'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, MessageCircle, ZoomIn, ZoomOut, RotateCcw, ArrowLeft, X, RotateCw } from 'lucide-react'
import { PostComments, type CommentsConfig } from '@/components/post/post-comments'
import type { Gallery, PhotoState } from '@/lib/types/gallery'

interface GallerySpaceProps {
  gallery: Gallery
}

// 评论配置 - 与文章详情页相同
const comments_config: CommentsConfig = {
  repo: 'f0na/fufu-next',
  repo_id: 'R_kgDOSF1Eww',
  category: 'Announcements',
  category_id: 'DIC_kwDOSF1Ew84C7HmC',
  mapping: 'pathname',
}

// localStorage key
const get_storage_key = (id: string) => `gallery_${id}_state`

// 保存的状态类型
interface SavedState {
  photo_states: PhotoState[]
  canvas_scale: number
  canvas_offset_x: number
  canvas_offset_y: number
}

// 随机初始旋转角度 -15° ~ 15°
const random_rotation = () => Math.random() * 30 - 15

// 默认照片尺寸
const DEFAULT_PHOTO_WIDTH = 200

// 检测移动端
const is_mobile = () => typeof window !== 'undefined' && window.innerWidth < 768

// 初始化照片状态 - 散落在画布上
const init_photo_states = (photos: string[]): PhotoState[] => {
  const viewport_width = typeof window !== 'undefined' ? window.innerWidth : 1200
  const viewport_height = typeof window !== 'undefined' ? window.innerHeight : 800
  const mobile = is_mobile()

  const photo_width = mobile ? 140 : DEFAULT_PHOTO_WIDTH

  return photos.map((photo, index) => ({
    id: photo,
    x: 30 + Math.random() * Math.max(100, viewport_width - photo_width - 60),
    y: 80 + Math.random() * Math.max(100, viewport_height - 300) + index * (mobile ? 15 : 25),
    rotation: random_rotation(),
    z_index: index,
  }))
}

export function GallerySpace({ gallery }: GallerySpaceProps) {
  const router = useRouter()
  const canvas_ref = useRef<HTMLDivElement>(null)

  // 照片状态
  const [photo_states, set_photo_states] = useState<PhotoState[]>([])
  const [max_z_index, set_max_z_index] = useState(0)

  // 画布状态
  const [canvas_scale, set_canvas_scale] = useState(1)
  const [canvas_offset_x, set_canvas_offset_x] = useState(0)
  const [canvas_offset_y, set_canvas_offset_y] = useState(0)

  // 灯箱状态
  const [lightbox_photo, set_lightbox_photo] = useState<string | null>(null)
  const [lightbox_rotation, set_lightbox_rotation] = useState(0)

  // 评论抽屉
  const [show_comments, set_show_comments] = useState(false)

  // 拖动状态跟踪
  const dragging_photo = useRef<string | null>(null)
  const drag_start_x = useRef(0)
  const drag_start_y = useRef(0)
  const photo_start_x = useRef(0)
  const photo_start_y = useRef(0)
  const has_moved = useRef(false)

  // 旋转状态跟踪
  const rotating_photo = useRef<string | null>(null)
  const rotate_start_angle = useRef(0)
  const rotate_center_x = useRef(0)
  const rotate_center_y = useRef(0)
  const initial_rotation = useRef(0)

  // 画布拖动状态
  const canvas_dragging = useRef(false)
  const canvas_drag_start_x = useRef(0)
  const canvas_drag_start_y = useRef(0)
  const canvas_start_offset_x = useRef(0)
  const canvas_start_offset_y = useRef(0)

  // 移动端检测
  const mobile = useMemo(() => is_mobile(), [])

  // 加载状态 - 从 localStorage 加载照片状态和画布状态
  useEffect(() => {
    const storage_key = get_storage_key(gallery.id)
    const saved = localStorage.getItem(storage_key)

    if (saved) {
      try {
        const parsed: SavedState = JSON.parse(saved)

        // 加载画布状态
        if (parsed.canvas_scale) set_canvas_scale(parsed.canvas_scale)
        if (parsed.canvas_offset_x) set_canvas_offset_x(parsed.canvas_offset_x)
        if (parsed.canvas_offset_y) set_canvas_offset_y(parsed.canvas_offset_y)

        // 加载照片状态
        const viewport_width = window.innerWidth
        const viewport_height = window.innerHeight
        const photo_width = mobile ? 140 : DEFAULT_PHOTO_WIDTH

        const all_states = gallery.photos.map((photo, index) => {
          const existing = parsed.photo_states?.find(s => s.id === photo)
          return existing || {
            id: photo,
            x: 30 + Math.random() * Math.max(100, viewport_width - photo_width - 60),
            y: 80 + Math.random() * Math.max(100, viewport_height - 300) + index * (mobile ? 15 : 25),
            rotation: random_rotation(),
            z_index: index,
          }
        })
        set_photo_states(all_states)
        set_max_z_index(Math.max(...all_states.map(s => s.z_index)) + 1)
      } catch {
        set_photo_states(init_photo_states(gallery.photos))
        set_max_z_index(gallery.photos.length)
      }
    } else {
      set_photo_states(init_photo_states(gallery.photos))
      set_max_z_index(gallery.photos.length)
    }
  }, [gallery, mobile])

  // 保存状态 - 照片状态和画布状态一起保存
  useEffect(() => {
    if (photo_states.length > 0) {
      const storage_key = get_storage_key(gallery.id)
      const state: SavedState = {
        photo_states,
        canvas_scale,
        canvas_offset_x,
        canvas_offset_y,
      }
      localStorage.setItem(storage_key, JSON.stringify(state))
    }
  }, [photo_states, canvas_scale, canvas_offset_x, canvas_offset_y, gallery.id])

  // 滚轮缩放画布
  useEffect(() => {
    const handle_wheel = (e: WheelEvent) => {
      if (lightbox_photo || show_comments || dragging_photo.current || rotating_photo.current || canvas_dragging.current) return

      e.preventDefault()

      const delta = e.deltaY > 0 ? 0.9 : 1.1
      const new_scale = canvas_scale * delta
      set_canvas_scale(Math.min(3, Math.max(0.3, new_scale)))
    }

    const container = canvas_ref.current
    if (container) {
      container.addEventListener('wheel', handle_wheel, { passive: false })
      return () => container.removeEventListener('wheel', handle_wheel)
    }
  }, [canvas_scale, lightbox_photo, show_comments])

  // 全局鼠标事件 - 照片拖动、旋转、画布拖动
  useEffect(() => {
    const handle_mouse_move = (e: MouseEvent) => {
      // 1. 处理旋转
      if (rotating_photo.current) {
        const current_angle = Math.atan2(
          e.clientY - rotate_center_y.current,
          e.clientX - rotate_center_x.current
        ) * (180 / Math.PI)

        const new_rotation = initial_rotation.current + (current_angle - rotate_start_angle.current)

        set_photo_states(prev =>
          prev.map(state =>
            state.id === rotating_photo.current
              ? { ...state, rotation: new_rotation }
              : state
          )
        )
        return
      }

      // 2. 处理照片拖动
      if (dragging_photo.current && !canvas_dragging.current) {
        const dx = e.clientX - drag_start_x.current
        const dy = e.clientY - drag_start_y.current

        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
          has_moved.current = true

          set_photo_states(prev =>
            prev.map(state =>
              state.id === dragging_photo.current
                ? {
                    ...state,
                    x: photo_start_x.current + dx / canvas_scale,
                    y: photo_start_y.current + dy / canvas_scale,
                  }
                : state
            )
          )
        }
        return
      }

      // 3. 处理画布拖动
      if (canvas_dragging.current) {
        const dx = e.clientX - canvas_drag_start_x.current
        const dy = e.clientY - canvas_drag_start_y.current

        set_canvas_offset_x(canvas_start_offset_x.current + dx)
        set_canvas_offset_y(canvas_start_offset_y.current + dy)
      }
    }

    const handle_mouse_up = () => {
      if (rotating_photo.current) {
        rotating_photo.current = null
        return
      }

      if (dragging_photo.current) {
        const photo_id = dragging_photo.current

        if (!has_moved.current) {
          const state = photo_states.find(s => s.id === photo_id)
          if (state) {
            set_lightbox_photo(photo_id)
            set_lightbox_rotation(state.rotation)
          }
        }

        dragging_photo.current = null
        has_moved.current = false
        return
      }

      if (canvas_dragging.current) {
        canvas_dragging.current = false
      }
    }

    document.addEventListener('mousemove', handle_mouse_move)
    document.addEventListener('mouseup', handle_mouse_up)

    return () => {
      document.removeEventListener('mousemove', handle_mouse_move)
      document.removeEventListener('mouseup', handle_mouse_up)
    }
  }, [canvas_scale, photo_states])

  // 提升照片层级
  const bring_to_top = useCallback((photo_id: string) => {
    set_max_z_index(prev => {
      const new_z = prev + 1
      set_photo_states(states =>
        states.map(state =>
          state.id === photo_id
            ? { ...state, z_index: new_z }
            : state
        )
      )
      return new_z
    })
  }, [])

  // 开始拖动照片
  const handle_photo_drag_start = useCallback((e: React.MouseEvent, photo_id: string, state: PhotoState) => {
    e.preventDefault()
    e.stopPropagation()

    dragging_photo.current = photo_id
    drag_start_x.current = e.clientX
    drag_start_y.current = e.clientY
    photo_start_x.current = state.x
    photo_start_y.current = state.y
    has_moved.current = false

    bring_to_top(photo_id)
  }, [bring_to_top])

  // 开始旋转照片
  const handle_rotate_start = useCallback((e: React.MouseEvent, photo_id: string, state: PhotoState) => {
    e.preventDefault()
    e.stopPropagation()

    rotating_photo.current = photo_id
    bring_to_top(photo_id)

    const photo_width = (mobile ? 140 : DEFAULT_PHOTO_WIDTH) + 24
    const photo_height = (mobile ? 140 : DEFAULT_PHOTO_WIDTH) + 24

    const center_x = (state.x + photo_width / 2) * canvas_scale + canvas_offset_x
    const center_y = (state.y + photo_height / 2) * canvas_scale + canvas_offset_y + 60

    rotate_center_x.current = center_x
    rotate_center_y.current = center_y
    initial_rotation.current = state.rotation
    rotate_start_angle.current = Math.atan2(
      e.clientY - center_y,
      e.clientX - center_x
    ) * (180 / Math.PI)
  }, [bring_to_top, canvas_scale, canvas_offset_x, canvas_offset_y, mobile])

  // 开始画布拖动
  const handle_canvas_drag_start = useCallback((e: React.MouseEvent) => {
    if (dragging_photo.current || rotating_photo.current) return

    e.preventDefault()

    canvas_dragging.current = true
    canvas_drag_start_x.current = e.clientX
    canvas_drag_start_y.current = e.clientY
    canvas_start_offset_x.current = canvas_offset_x
    canvas_start_offset_y.current = canvas_offset_y
  }, [canvas_offset_x, canvas_offset_y])

  // 缩放按钮
  const handle_zoom = useCallback((delta: number) => {
    set_canvas_scale(prev => Math.min(Math.max(prev + delta, 0.3), 3))
  }, [])

  // 重置画布
  const handle_reset = useCallback(() => {
    set_canvas_scale(1)
    set_canvas_offset_x(0)
    set_canvas_offset_y(0)
  }, [])

  return (
    <div
      ref={canvas_ref}
      className="fixed inset-0 w-screen h-screen overflow-hidden bg-muted/30 select-none"
      onMouseDown={(e) => {
        if (e.target === canvas_ref.current || e.target === e.currentTarget) {
          handle_canvas_drag_start(e)
        }
      }}
    >
      {/* 工具栏 */}
      <div className="absolute top-4 left-4 z-50">
        <button
          onClick={() => router.push('/gallery')}
          className="w-10 h-10 bg-white/80 hover:bg-white shadow-md rounded-full flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
      </div>

      {/* 右侧工具按钮 */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
        <button
          onClick={() => handle_zoom(-0.1)}
          className="w-10 h-10 bg-white/80 hover:bg-white shadow-md rounded-full flex items-center justify-center transition-colors"
          title="缩小"
        >
          <ZoomOut className="w-5 h-5 text-slate-600" />
        </button>

        <button
          onClick={() => handle_zoom(0.1)}
          className="w-10 h-10 bg-white/80 hover:bg-white shadow-md rounded-full flex items-center justify-center transition-colors"
          title="放大"
        >
          <ZoomIn className="w-5 h-5 text-slate-600" />
        </button>

        <button
          onClick={handle_reset}
          className="w-10 h-10 bg-white/80 hover:bg-white shadow-md rounded-full flex items-center justify-center transition-colors"
          title="重置"
        >
          <RotateCcw className="w-5 h-5 text-slate-600" />
        </button>

        <button
          className="w-10 h-10 bg-white/80 hover:bg-white shadow-md rounded-full flex items-center justify-center transition-colors"
          title="点赞"
        >
          <Heart className="w-5 h-5 text-slate-600" />
        </button>

        <button
          onClick={() => set_show_comments(true)}
          className="w-10 h-10 bg-white/80 hover:bg-white shadow-md rounded-full flex items-center justify-center transition-colors"
          title="评论"
        >
          <MessageCircle className="w-5 h-5 text-slate-600" />
        </button>
      </div>

      {/* 画布容器 */}
      <div
        className="absolute"
        style={{
          transform: `translate(${canvas_offset_x}px, ${canvas_offset_y}px) scale(${canvas_scale})`,
          transformOrigin: '0 0',
        }}
      >
        {/* 照片 */}
        {photo_states.map((state) => (
          <div
            key={state.id}
            className="absolute"
            style={{
              left: state.x,
              top: state.y,
              transform: `rotate(${state.rotation}deg)`,
              zIndex: state.z_index,
            }}
          >
            {/* 白色底片框 - hover 时显示旋转手柄 */}
            <div
              className="bg-white p-3 shadow-lg relative group"
              style={{ display: 'inline-block' }}
              onMouseDown={(e) => handle_photo_drag_start(e, state.id, state)}
            >
              {/* 图片 */}
              <img
                src={state.id}
                alt="photo"
                style={{
                  width: mobile ? 140 : 200,
                  minWidth: mobile ? 140 : 200,
                  height: 'auto',
                  maxHeight: 300,
                  display: 'block'
                }}
                className="object-cover"
                draggable={false}
              />

              {/* 旋转手柄 - hover 时才显示 */}
              <div
                className="absolute -top-1 -right-1 bg-white rounded-full shadow-md cursor-grab flex items-center justify-center hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
                style={{ width: mobile ? 32 : 24, height: mobile ? 32 : 24 }}
                onMouseDown={(e) => handle_rotate_start(e, state.id, state)}
              >
                <RotateCw className="text-slate-500" style={{ width: mobile ? 16 : 14, height: mobile ? 16 : 14 }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 灯箱 */}
      <AnimatePresence>
        {lightbox_photo && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => set_lightbox_photo(null)}
          >
            <motion.div
              className="bg-white p-4 shadow-2xl"
              initial={{ scale: 0.5, rotate: lightbox_rotation }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.5, rotate: lightbox_rotation }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={lightbox_photo}
                alt="photo"
                className="max-w-[80vw] max-h-[80vh] object-contain"
              />
            </motion.div>

            <button
              className="absolute top-4 right-4 w-12 h-12 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center transition-colors"
              onClick={() => set_lightbox_photo(null)}
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 评论抽屉 */}
      <AnimatePresence>
        {show_comments && (
          <motion.div
            className="fixed inset-0 z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/30"
              onClick={() => set_show_comments(false)}
            />

            <motion.div
              className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl overflow-y-auto"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
            >
              <div className="p-4">
                <button
                  className="mb-4 w-8 h-8 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center"
                  onClick={() => set_show_comments(false)}
                >
                  <X className="w-4 h-4" />
                </button>

                <PostComments
                  repo={comments_config.repo}
                  repo_id={comments_config.repo_id}
                  category={comments_config.category}
                  category_id={comments_config.category_id}
                  mapping={comments_config.mapping}
                  section_id="gallery-comments"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}