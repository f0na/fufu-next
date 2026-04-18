'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Search, Palette, Menu, X } from 'lucide-react'

const themes = [
  { name: 'avemujica', label: 'AM', color: '#5a8fa8' },
  { name: 'mygo', label: 'MG', color: '#ff8899' },
]

// 导航菜单项
const nav_items = [
  { label: '首页', key: 'home', href: '/home' },
  { label: '归档', key: 'archive', href: '/home?tab=archive' },
  { label: '链接', key: 'links', href: '/home?tab=links' },
  { label: '追番', key: 'anime', href: '/home?tab=anime' },
  { label: '相册', key: 'gallery', href: '/home?tab=gallery' },
  { label: '友人帐', key: 'friends', href: '/home?tab=friends' },
]

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
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden">
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
          <div className="px-4 py-6 text-center text-muted-foreground text-sm">
            输入关键词搜索内容
          </div>
        </div>
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
  const [is_search_open, set_is_search_open] = useState(false)

  const toggle_theme = () => {
    const new_idx = (theme_idx + 1) % themes.length
    set_theme_idx(new_idx)
    document.documentElement.setAttribute('data-theme', themes[new_idx].name)
  }

  const current_theme = themes[theme_idx]

  return (
    <>
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

      <nav className="fixed top-0 left-1/2 -translate-x-1/2 z-50 bg-background/80 backdrop-blur-md rounded-b-lg border border-border shadow-sm">
        <div className="flex items-center gap-1 px-4 h-10">
          <div className="hidden md:flex items-center gap-1">
            {nav_items.map((item) =>
              on_menu_click ? (
                // 首页内：使用按钮触发状态切换
                <button
                  key={item.key}
                  onClick={() => on_menu_click(item.key)}
                  className={cn(
                    'px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap',
                    current_page === item.key
                      ? 'text-primary bg-primary/10 rounded-md'
                      : 'text-foreground hover:text-primary'
                  )}
                >
                  {item.label}
                </button>
              ) : (
                // 其他页面：使用 Link 跳转到首页
                <Link
                  key={item.key}
                  href={item.href}
                  className={cn(
                    'px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap',
                    current_page === item.key
                      ? 'text-primary bg-primary/10 rounded-md'
                      : 'text-foreground hover:text-primary'
                  )}
                >
                  {item.label}
                </Link>
              )
            )}
          </div>

          {on_menu_click ? (
            <button
              onClick={() => on_menu_click('home')}
              className="md:hidden px-3 py-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              首页
            </button>
          ) : (
            <Link
              href="/home"
              className="md:hidden px-3 py-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              首页
            </Link>
          )}

          <div className="flex items-center gap-2">
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

      {/* 移动端菜单 */}
      {is_mobile_menu_open && (
        <div className="md:hidden fixed top-14 left-4 z-[60] bg-card rounded-xl border border-border shadow-sm min-w-[150px]">
          <div className="flex flex-col gap-1 px-2 py-2">
            {nav_items.map((item) =>
              on_menu_click ? (
                <button
                  key={item.key}
                  onClick={() => {
                    on_menu_click(item.key)
                    set_is_mobile_menu_open(false)
                  }}
                  className="px-3 py-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors rounded-lg"
                >
                  {item.label}
                </button>
              ) : (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => set_is_mobile_menu_open(false)}
                  className="px-3 py-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors rounded-lg"
                >
                  {item.label}
                </Link>
              )
            )}
          </div>
        </div>
      )}

      <SearchModal
        is_open={is_search_open}
        on_close={() => set_is_search_open(false)}
      />
    </>
  )
}