"use client"

import { useCallback, useEffect, useRef, useState } from "react"

interface UseInfiniteScrollOptions {
  /** 是否还有更多数据可加载 */
  has_more?: boolean
  /** 加载更多的回调函数 */
  onLoadMore: () => Promise<void> | void
  /** 初始加载状态 */
  initial_loading?: boolean
  /** 触发加载的阈值距离（像素） */
  root_margin?: string
  /** 滚动容器，默认为viewport */
  root?: React.RefObject<HTMLElement | null> | null
  /** 是否禁用（用于初始加载时防止重复触发） */
  disabled?: boolean
}

interface UseInfiniteScrollReturn {
  /** 加载更多数据的函数 */
  loadMore: () => Promise<void>
  /** 是否正在加载 */
  isLoading: boolean
  /** 是否还有更多数据 */
  hasMore: boolean
  /** 哨兵元素的ref，用于检测是否进入视口 */
  sentinelRef: React.RefObject<HTMLDivElement | null>
}

/**
 * 无限滚动Hook
 * 使用Intersection Observer检测滚动到底部，触发加载下一页数据
 */
export function useInfiniteScroll({
  has_more = true,
  onLoadMore,
  initial_loading = false,
  root_margin = "100px",
  root = null,
  disabled = false,
}: UseInfiniteScrollOptions): UseInfiniteScrollReturn {
  const [isLoading, setIsLoading] = useState(initial_loading)
  const [hasMore, setHasMore] = useState(has_more)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const is_loading_ref = useRef(false)
  const initial_load_done_ref = useRef(false)
  const onLoadMoreRef = useRef(onLoadMore)
  const hasMoreRef = useRef(hasMore)

  // 保持 ref 同步
  useEffect(() => {
    onLoadMoreRef.current = onLoadMore
  }, [onLoadMore])

  useEffect(() => {
    hasMoreRef.current = hasMore
  }, [hasMore])

  // 更新hasMore状态
  useEffect(() => {
    setHasMore(has_more)
  }, [has_more])

  // 内部加载函数，不依赖外部状态
  const doLoadMore = useCallback(async () => {
    // 防止重复加载
    if (is_loading_ref.current || !hasMoreRef.current) {
      return
    }

    is_loading_ref.current = true
    setIsLoading(true)

    try {
      await onLoadMoreRef.current()
    } catch (error) {
      console.error("Failed to load more data:", error)
    } finally {
      setIsLoading(false)
      is_loading_ref.current = false
    }
  }, [])

  // 标记初始加载完成（当 disabled 从 true 变为 false 时）
  useEffect(() => {
    if (!disabled) {
      // 使用 requestAnimationFrame 确保初始数据已渲染
      const raf_id = requestAnimationFrame(() => {
        initial_load_done_ref.current = true
        // 检查哨兵元素是否已在视口中，如果是则触发加载
        const sentinel = sentinelRef.current
        if (sentinel && hasMoreRef.current && !is_loading_ref.current) {
          const rect = sentinel.getBoundingClientRect()
          const in_viewport = rect.top < window.innerHeight && rect.bottom > 0
          if (in_viewport) {
            doLoadMore()
          }
        }
      })
      return () => cancelAnimationFrame(raf_id)
    }
  }, [disabled, doLoadMore])

  // 设置Intersection Observer
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || disabled) return

    // 清理之前的observer
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        // 只有在初始加载完成后且元素进入视口时才触发
        if (entry.isIntersecting && hasMoreRef.current && !is_loading_ref.current && initial_load_done_ref.current) {
          doLoadMore()
        }
      },
      {
        root: root?.current || null,
        rootMargin: root_margin,
        threshold: 0,
      }
    )

    observerRef.current.observe(sentinel)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [doLoadMore, root_margin, root, disabled])

  return {
    loadMore: doLoadMore,
    isLoading,
    hasMore,
    sentinelRef,
  }
}