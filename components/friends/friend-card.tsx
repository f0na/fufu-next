"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { FriendItem } from "@/lib/types/friend"

interface FriendCardProps {
  friend: FriendItem
  className?: string
}

export function FriendCard({ friend, className }: FriendCardProps) {
  const [avatar_loaded, set_avatar_loaded] = useState(false)
  const [favicon_loaded, set_favicon_loaded] = useState(false)
  const [favicon_api_loaded, set_favicon_api_loaded] = useState(false)

  const { primary_avatar, favicon_url, favicon_api_url, site_initial } = (() => {
    try {
      const url_obj = new URL(friend.url)
      const domain = url_obj.hostname.replace(/^www\./, '')
      return {
        primary_avatar: friend.avatar || null,
        favicon_url: `${url_obj.origin}/favicon.ico`,
        favicon_api_url: `https://api.iowen.cn/favicon/${domain}.png`,
        site_initial: domain.charAt(0).toUpperCase()
      }
    } catch {
      return {
        primary_avatar: friend.avatar || null,
        favicon_url: null,
        favicon_api_url: null,
        site_initial: null
      }
    }
  })()

  const handle_click = () => {
    window.open(friend.url, "_blank")
  }

  // 后台预加载图片
  useEffect(() => {
    if (primary_avatar && !avatar_loaded) {
      const img = new window.Image()
      img.src = primary_avatar
      img.onload = () => set_avatar_loaded(true)
    }
  }, [primary_avatar, avatar_loaded])

  useEffect(() => {
    if (favicon_url && !favicon_loaded) {
      const img = new window.Image()
      img.src = favicon_url
      img.onload = () => set_favicon_loaded(true)
    }
  }, [favicon_url, favicon_loaded])

  useEffect(() => {
    if (favicon_api_url && !favicon_api_loaded && !favicon_loaded) {
      const img = new window.Image()
      img.src = favicon_api_url
      img.onload = () => set_favicon_api_loaded(true)
    }
  }, [favicon_api_url, favicon_api_loaded, favicon_loaded])

  const render_avatar = () => {
    // 用户提供了头像链接且加载成功
    if (primary_avatar && avatar_loaded) {
      return (
        <Image
          src={primary_avatar}
          alt={friend.name}
          width={48}
          height={48}
          className="size-12 shrink-0 rounded-lg object-cover"
          unoptimized
        />
      )
    }

    // 网站自己的 favicon 加载成功
    if (favicon_url && favicon_loaded) {
      return (
        <Image
          src={favicon_url}
          alt=""
          width={48}
          height={48}
          className="size-12 shrink-0 rounded-lg object-cover"
          unoptimized
        />
      )
    }

    // favicon API 加载成功
    if (favicon_api_url && favicon_api_loaded) {
      return (
        <Image
          src={favicon_api_url}
          alt=""
          width={48}
          height={48}
          className="size-12 shrink-0 rounded-lg object-cover"
          unoptimized
        />
      )
    }

    // 显示网站首字母作为文字头像（默认）
    if (site_initial && /^[A-Za-z0-9]$/.test(site_initial)) {
      return (
        <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted text-lg font-medium text-muted-foreground">
          {site_initial}
        </div>
      )
    }

    // 默认图标
    return (
      <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted text-lg font-medium text-muted-foreground">
        ?
      </div>
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
        <CardTitle className="flex items-center gap-3">
          {render_avatar()}
          <span className="truncate">{friend.name}</span>
        </CardTitle>
      </CardHeader>
      {friend.description && (
        <CardContent>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {friend.description}
          </p>
        </CardContent>
      )}
    </Card>
  )
}