"use client"

import { useState } from "react"
import { Globe, Star, Copy, CopyCheck } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent, CardAction } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { LinkItem } from "@/lib/types/link"

interface LinkCardProps {
  link: LinkItem
  className?: string
}

export function LinkCard({ link, className }: LinkCardProps) {
  const [favicon_error, set_favicon_error] = useState(false)
  const [copied, set_copied] = useState(false)

  // 获取网站信息
  const { favicon_url, site_initial } = (() => {
    try {
      const url_obj = new URL(link.url)
      return {
        favicon_url: `${url_obj.origin}/favicon.ico`,
        site_initial: url_obj.hostname.replace(/^www\./, "").charAt(0).toUpperCase()
      }
    } catch {
      return { favicon_url: null, site_initial: null }
    }
  })()

  const handle_click = () => {
    window.open(link.url, "_blank")
  }

  const handle_copy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(link.url)
      set_copied(true)
      setTimeout(() => set_copied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const display_tags = link.tags.slice(0, 3)

  // 渲染 favicon 或 fallback 图标
  const render_favicon = () => {
    if (!favicon_url || favicon_error) {
      // favicon 不可用或加载失败时，显示网站首字母或 Globe 图标
      if (site_initial && /^[A-Za-z0-9]$/.test(site_initial)) {
        return (
          <div className="flex size-5 shrink-0 items-center justify-center rounded-sm bg-muted text-[10px] font-medium text-muted-foreground">
            {site_initial}
          </div>
        )
      }
      return <Globe className="size-5 shrink-0 text-muted-foreground" />
    }

    return (
      <img
        src={favicon_url}
        alt=""
        className="size-5 shrink-0 rounded-sm"
        onError={() => set_favicon_error(true)}
      />
    )
  }

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:ring-primary/30 hover:shadow-md",
        className
      )}
      onClick={handle_click}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {render_favicon()}
          <span className="truncate">{link.title}</span>
        </CardTitle>
        <CardAction className="flex items-center gap-1">
          {link.is_starred && (
            <Star className="size-4 fill-primary text-primary" />
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            className="shrink-0"
            onClick={handle_copy}
            aria-label="复制链接"
          >
            {copied ? (
              <CopyCheck className="size-4 text-primary" />
            ) : (
              <Copy className="size-4" />
            )}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-3">
        {link.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {link.description}
          </p>
        )}
        {display_tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {display_tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}