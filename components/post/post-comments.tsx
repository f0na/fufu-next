'use client'

import { useSyncExternalStore } from 'react'
import Giscus from '@giscus/react'
import { cn } from '@/lib/utils'

interface PostCommentsProps {
  /** GitHub 仓库名称，格式：owner/repo */
  repo: string
  /** GitHub 仓库 ID */
  repo_id: string
  /** Discussion 分类名称 */
  category: string
  /** Discussion 分类 ID */
  category_id: string
  /** 映射方式 */
  mapping?: 'pathname' | 'url' | 'title' | 'og:title'
  /** 评论区的元素 ID，用于锚点定位 */
  section_id?: string
  /** 自定义类名 */
  className?: string
}

/**
 * 订阅主题变化的函数
 */
function subscribe_to_theme(callback: () => void) {
  const observer = new MutationObserver(callback)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  })
  return () => observer.disconnect()
}

/**
 * 获取当前主题快照
 */
function get_theme_snapshot(): string {
  if (typeof window === 'undefined') return 'light'
  // Giscus 主题：根据项目主题色选择合适的 Giscus 主题
  // avemujica (蓝绿色) 和 mygo (粉红色) 都使用 light 主题
  return 'light'
}

/**
 * 获取服务端主题快照（SSR）
 */
function get_server_theme_snapshot(): string {
  return 'light'
}

/**
 * 评论区组件
 * 使用 Giscus (GitHub Discussions) 作为评论系统
 */
export function PostComments({
  repo,
  repo_id,
  category,
  category_id,
  mapping = 'pathname',
  section_id = 'comments',
  className,
}: PostCommentsProps) {
  // 使用 useSyncExternalStore 监听主题变化
  const theme = useSyncExternalStore(
    subscribe_to_theme,
    get_theme_snapshot,
    get_server_theme_snapshot
  )

  // 如果使用占位符，显示未配置提示
  if (repo === 'placeholder/placeholder') {
    return (
      <div id={section_id} className={cn('w-full', className)}>
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <span className="text-primary">|</span>
          评论区
        </h2>
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <div className="text-center space-y-2">
            <p>评论功能暂未配置</p>
            <p className="text-sm">请在 GitHub 仓库中启用 Discussions 并配置相关参数</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div id={section_id} className={cn('w-full', className)}>
      {/* 标题 */}
      <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
        <span className="text-primary">|</span>
        评论区
      </h2>

      {/* Giscus 评论组件 */}
      <div className="w-full overflow-hidden rounded-lg border border-border bg-card">
        <Giscus
          repo={repo as `${string}/${string}`}
          repoId={repo_id}
          category={category}
          categoryId={category_id}
          mapping={mapping}
          lang="zh-CN"
          theme={theme}
          reactionsEnabled="1"
          emitMetadata="0"
          inputPosition="top"
          loading="lazy"
        />
      </div>
    </div>
  )
}

/**
 * 评论配置类型
 * 用于在页面级别配置评论系统参数
 */
export interface CommentsConfig {
  repo: string
  repo_id: string
  category: string
  category_id: string
  mapping?: 'pathname' | 'url' | 'title' | 'og:title'
}

/**
 * 创建评论配置的默认占位符
 */
export function create_placeholder_config(): CommentsConfig {
  return {
    repo: 'placeholder/placeholder',
    repo_id: 'placeholder-id',
    category: 'Announcements',
    category_id: 'placeholder-category-id',
    mapping: 'pathname',
  }
}