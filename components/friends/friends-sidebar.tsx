'use client'

import { useLayoutEffect, useRef, useContext, useState, useEffect } from 'react'
import Image from 'next/image'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RightSidebarPortalContext } from '@/context/right-sidebar-portal-context'
import { UserPlus } from 'lucide-react'

interface FriendsSidebarProps {
  is_portal_target?: boolean
}

export function FriendsSidebar({ is_portal_target = false }: FriendsSidebarProps) {
  const portal_target_ref = useRef<HTMLDivElement>(null)
  const portal_registered_ref = useRef(false)
  const { set_portal_target } = useContext(RightSidebarPortalContext)

  const [link_url, set_link_url] = useState('')
  const [avatar_url, set_avatar_url] = useState('')
  const [avatar_loaded, set_avatar_loaded] = useState(false)
  const [favicon_loaded, set_favicon_loaded] = useState(false)
  const [favicon_api_loaded, set_favicon_api_loaded] = useState(false)
  const [name, set_name] = useState('')
  const [description, set_description] = useState('')

  // 处理后的完整 URL（用于获取 favicon）
  const processed_url = (() => {
    if (!link_url) return null
    if (link_url.startsWith('http://') || link_url.startsWith('https://')) {
      return link_url
    }
    return 'https://' + link_url
  })()

  // 从网站链接提取 favicon
  const { favicon_url, favicon_api_url, site_initial } = (() => {
    try {
      if (!processed_url) return { favicon_url: null, favicon_api_url: null, site_initial: null }
      const url_obj = new URL(processed_url)
      const domain = url_obj.hostname.replace(/^www\./, '')
      return {
        favicon_url: `${url_obj.origin}/favicon.ico`,
        favicon_api_url: `https://api.iowen.cn/favicon/${domain}.png`,
        site_initial: domain.charAt(0).toUpperCase()
      }
    } catch {
      return { favicon_url: null, favicon_api_url: null, site_initial: null }
    }
  })()

  // 链接变化时重置加载状态
  useLayoutEffect(() => {
    set_favicon_loaded(false)
    set_favicon_api_loaded(false)
  }, [link_url])

  useLayoutEffect(() => {
    if (is_portal_target && portal_target_ref.current && !portal_registered_ref.current) {
      set_portal_target(portal_target_ref.current)
      portal_registered_ref.current = true
    }
    return () => {
      set_portal_target(null)
      portal_registered_ref.current = false
    }
  }, [set_portal_target, is_portal_target])

  const handle_avatar_change = (value: string) => {
    set_avatar_url(value)
    set_avatar_loaded(false)
  }

  const handle_submit = () => {
    // 后台处理时自动补上 https://
    const final_url = processed_url || link_url
    console.log('提交申请:', { link_url: final_url, name, avatar_url, description })
  }

  // 后台预加载图片
  useEffect(() => {
    if (avatar_url && !avatar_loaded) {
      const img = new window.Image()
      img.src = avatar_url
      img.onload = () => set_avatar_loaded(true)
    }
  }, [avatar_url, avatar_loaded])

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

  // 渲染预览头像
  const render_preview_avatar = () => {
    // 用户提供了头像链接且加载成功
    if (avatar_url && avatar_loaded) {
      return (
        <Image
          src={avatar_url}
          alt="头像预览"
          width={40}
          height={40}
          className="size-10 rounded-lg object-cover"
          unoptimized
        />
      )
    }

    // 网站自己的 favicon 加载成功
    if (favicon_url && favicon_loaded) {
      return (
        <Image
          src={favicon_url}
          alt="网站图标"
          width={40}
          height={40}
          className="size-10 rounded-lg object-cover"
          unoptimized
        />
      )
    }

    // favicon API 加载成功
    if (favicon_api_url && favicon_api_loaded) {
      return (
        <Image
          src={favicon_api_url}
          alt="网站图标"
          width={40}
          height={40}
          className="size-10 rounded-lg object-cover"
          unoptimized
        />
      )
    }

    // 显示网站首字母作为文字头像（默认）
    if (site_initial && /^[A-Za-z0-9]$/.test(site_initial)) {
      return (
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-base font-medium text-muted-foreground">
          {site_initial}
        </div>
      )
    }

    // 默认图标
    return (
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-base font-medium text-muted-foreground">
        ?
      </div>
    )
  }

  return (
    <aside className="flex flex-col gap-4 w-full">
      {is_portal_target && <div ref={portal_target_ref} />}

      <Card size="sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            申请友链
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">网站链接 *</label>
            <Input
              placeholder="example.com"
              value={link_url}
              onChange={(e) => set_link_url(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">头像链接</label>
            <Input
              placeholder="https://example.com/avatar.png"
              value={avatar_url}
              onChange={(e) => handle_avatar_change(e.target.value)}
            />
            {/* 图片预览 */}
            <div className="flex items-center gap-2 pt-1">
              {render_preview_avatar()}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">名称 *</label>
            <Input
              placeholder="您的站点名称"
              value={name}
              onChange={(e) => set_name(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">描述</label>
            <Textarea
              placeholder="简短介绍您的站点..."
              value={description}
              onChange={(e) => set_description(e.target.value)}
              className="min-h-[60px]"
            />
          </div>
          <Button
            className="w-full"
            onClick={handle_submit}
            disabled={!link_url || !name}
          >
            添加申请
          </Button>
        </CardContent>
      </Card>
    </aside>
  )
}