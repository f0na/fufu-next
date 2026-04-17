'use client'

import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Search,
  Palette,
  Menu,
  ChevronDown,
  X,
} from 'lucide-react'

const themes = [
  { name: 'avemujica', label: 'AM', color: '#5a8fa8' },
  { name: 'mygo', label: 'MG', color: '#ff8899' },
]

// 菜单项类型定义
interface Menu_item {
  label: string
  key: string
  children?: Menu_item[]
}

// 菜单配置
const menu_items: Menu_item[] = [
  { label: '首页', key: 'home' },
  { label: '归档', key: 'archive' },
  { label: '链接', key: 'links' },
  { label: '追番', key: 'anime' },
  { label: '相册', key: 'gallery' },
  { label: '友人帐', key: 'friends' },
  {
    label: '更多',
    key: 'more',
    children: [
      { label: '网站状态', key: 'status' },
    ],
  },
]

// 搜索弹窗组件
function SearchModal({
  is_open,
  on_close,
}: {
  is_open: boolean
  on_close: () => void
}) {
  const input_ref = useRef<HTMLInputElement>(null)
  const [query, set_query] = useState('')

  useEffect(() => {
    if (is_open) {
      input_ref.current?.focus()
    }
  }, [is_open])

  // ESC 关闭
  useEffect(() => {
    const handle_keydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && is_open) {
        on_close()
      }
    }
    window.addEventListener('keydown', handle_keydown)
    return () => window.removeEventListener('keydown', handle_keydown)
  }, [is_open, on_close])

  if (!is_open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-20"
      onClick={on_close}
    >
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

      {/* 搜索框容器 */}
      <div
        className="relative w-full max-w-xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden">
          {/* 搜索输入 */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
            <Search className="size-4 text-muted-foreground" />
            <input
              ref={input_ref}
              type="text"
              value={query}
              onChange={(e) => set_query(e.target.value)}
              placeholder="搜索文章、标签..."
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            {query && (
              <button
                onClick={() => set_query('')}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* 搜索提示 */}
          <div className="px-4 py-6 text-center text-muted-foreground text-sm">
            输入关键词搜索内容
          </div>
        </div>

        {/* 关闭提示 */}
        <div className="mt-2 text-center text-muted-foreground text-xs">
          按 ESC 或点击空白处关闭
        </div>
      </div>
    </div>
  )
}

export function Navbar({
  on_menu_click,
  current_page,
}: {
  on_menu_click?: (key: string) => void
  current_page?: string
}) {
  const [theme_idx, set_theme_idx] = useState(0)
  const [is_mobile_menu_open, set_is_mobile_menu_open] = useState(false)
  const [is_dropdown_open, set_is_dropdown_open] = useState(false)
  const [is_search_open, set_is_search_open] = useState(false)

  // 主题切换
  const toggle_theme = () => {
    const new_idx = (theme_idx + 1) % themes.length
    set_theme_idx(new_idx)
    document.documentElement.setAttribute('data-theme', themes[new_idx].name)
  }

  const current_theme = themes[theme_idx]

  // 下拉菜单项组件
  const Dropdown_item = ({ item }: { item: Menu_item }) => {
    if (!item.children) return null

    return (
      <div className="relative">
        <button
          className="flex items-center gap-0.5 px-3 py-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors"
          onMouseEnter={() => set_is_dropdown_open(true)}
          onMouseLeave={() => set_is_dropdown_open(false)}
        >
          {item.label}
          <ChevronDown
            className={cn(
              'size-3.5 transition-transform duration-200',
              is_dropdown_open && 'rotate-180'
            )}
          />
        </button>
        {/* 下拉菜单 */}
        {is_dropdown_open && (
          <div
            className="absolute top-full left-0 min-w-[120px] bg-card border border-border rounded-lg z-50 overflow-hidden"
            onMouseEnter={() => set_is_dropdown_open(true)}
            onMouseLeave={() => set_is_dropdown_open(false)}
          >
            {item.children.map((child, index) => (
              <button
                key={child.key}
                onClick={() => on_menu_click?.(child.key)}
                className={cn(
                  'block w-full text-left px-4 py-2 text-sm text-foreground',
                  'hover:bg-primary hover:text-primary-foreground',
                  'transition-colors',
                  index === 0 && 'rounded-t-lg',
                  index === item.children!.length - 1 && 'rounded-b-lg'
                )}
              >
                {child.label}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {/* 移动端汉堡菜单按钮 - 固定在左边 */}
      <Button
        variant="ghost"
        size="icon-sm"
        className="fixed top-0 left-4 z-[60] md:hidden text-foreground hover:text-primary"
        onClick={() => set_is_mobile_menu_open(!is_mobile_menu_open)}
        aria-label="菜单"
      >
        {is_mobile_menu_open ? (
          <X className="size-4" />
        ) : (
          <Menu className="size-4" />
        )}
      </Button>

      {/* 导航栏 - 居中不占满宽度 */}
      <nav className="fixed top-0 left-1/2 -translate-x-1/2 z-50 bg-background/80 backdrop-blur-md rounded-b-lg border border-border shadow-sm">
        <div className="flex items-center gap-1 px-4 h-10">
          {/* 桌面端菜单 */}
          <div className="hidden md:flex items-center gap-1">
            {menu_items.map((item) =>
              item.children ? (
                <Dropdown_item key={item.key} item={item} />
              ) : (
                <button
                  key={item.key}
                  onClick={() => on_menu_click?.(item.key)}
                  className={cn(
                    'px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap',
                    current_page === item.key
                      ? 'text-primary bg-primary/10 rounded-md'
                      : 'text-foreground hover:text-primary'
                  )}
                >
                  {item.label}
                </button>
              )
            )}
          </div>

          {/* 移动端显示首页链接 */}
          <button
            className="md:hidden px-3 py-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors"
            onClick={() => on_menu_click?.('home')}
          >
            首页
          </button>

          {/* 功能按钮 */}
          <div className="flex items-center gap-2">
            {/* 搜索框 - 点击弹出搜索组件 */}
            <button
              onClick={() => set_is_search_open(true)}
              className={cn(
                'hidden md:flex items-center gap-1.5 px-2.5 py-1 h-7',
                'bg-muted/50 rounded-md border border-border',
                'text-muted-foreground text-xs',
                'hover:bg-muted hover:text-foreground transition-colors'
              )}
            >
              <Search className="size-3.5" />
              <span>搜索</span>
            </button>

            {/* 主题切换按钮 */}
            <button
              onClick={toggle_theme}
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center',
                'transition-all duration-200',
                'hover:bg-muted'
              )}
              style={{ color: current_theme.color }}
              title={`当前: ${current_theme.label}`}
            >
              <Palette className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* 移动端下拉菜单 */}
      {is_mobile_menu_open && (
        <div className="md:hidden fixed top-14 left-4 z-[60] bg-card rounded-xl border border-border shadow-sm min-w-[150px]">
          <div className="flex flex-col gap-1 px-2 py-2">
            {menu_items.map((item) =>
              item.children ? (
                <div key={item.key} className="flex flex-col">
                  <span className="px-3 py-1.5 text-sm font-medium text-muted-foreground">
                    {item.label}
                  </span>
                  <div className="pl-4">
                    {item.children.map((child) => (
                      <button
                        key={child.key}
                        onClick={() => {
                          on_menu_click?.(child.key)
                          set_is_mobile_menu_open(false)
                        }}
                        className="block px-3 py-1.5 text-sm text-foreground hover:text-primary transition-colors rounded-lg"
                      >
                        {child.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <button
                  key={item.key}
                  onClick={() => {
                    on_menu_click?.(item.key)
                    set_is_mobile_menu_open(false)
                  }}
                  className="px-3 py-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors rounded-lg"
                >
                  {item.label}
                </button>
              )
            )}
          </div>
        </div>
      )}

      {/* 搜索弹窗 */}
      <SearchModal
        is_open={is_search_open}
        on_close={() => set_is_search_open(false)}
      />
    </>
  )
}