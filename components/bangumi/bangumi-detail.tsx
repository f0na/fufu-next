'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Copy, Check, ExternalLink, AlertCircle } from 'lucide-react'
import { format_size } from '@/lib/anime-garden-client'
import { extract_episode, format_date } from '@/lib/bangumi-utils'
import type { BangumiSubject } from '@/lib/types/bangumi'
import { useState } from 'react'

interface BangumiDetailProps {
  subject: BangumiSubject | null
  is_loading: boolean
  resource_error?: string | null
  on_close: () => void
}

export function BangumiDetail({
  subject,
  is_loading,
  resource_error,
  on_close,
}: BangumiDetailProps) {
  const [copied_id, set_copied_id] = useState<number | null>(null)

  const handle_copy = async (magnet: string, resource_id: number) => {
    try {
      await navigator.clipboard.writeText(magnet)
      set_copied_id(resource_id)
      setTimeout(() => set_copied_id(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  // 加载中状态
  if (is_loading || !subject) {
    return (
      <div className="flex flex-col gap-4">
        <Button variant="ghost" onClick={on_close} className="self-start">
          <ArrowLeft className="size-4" />
          返回列表
        </Button>
        <div className="flex gap-4">
          <Skeleton className="w-[160px] aspect-[3/4]" />
          <div className="flex-1 flex flex-col gap-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        </div>
      </div>
    )
  }

  const display_name = subject.name_cn || subject.name

  return (
    <div className="flex flex-col gap-4">
      {/* 返回按钮 - 左对齐 */}
      <Button variant="ghost" onClick={on_close} className="self-start">
        <ArrowLeft className="size-4" />
        返回列表
      </Button>

      {/* 封面 + 基本信息（并排） */}
      <div className="flex gap-4">
        {/* 封面 */}
        {subject.images?.large ? (
          <img
            src={subject.images.large}
            alt={display_name}
            className="w-[160px] aspect-[3/4] object-cover rounded-lg shrink-0"
          />
        ) : subject.cover_url ? (
          <img
            src={subject.cover_url}
            alt={display_name}
            className="w-[160px] aspect-[3/4] object-cover rounded-lg shrink-0"
          />
        ) : (
          <div className="w-[160px] aspect-[3/4] bg-muted rounded-lg flex items-center justify-center shrink-0">
            <span className="text-muted-foreground text-lg font-medium">{display_name.slice(0, 2)}</span>
          </div>
        )}

        {/* 基本信息 */}
        <div className="flex-1 flex flex-col gap-2">
          <h1 className="text-lg font-bold">{display_name}</h1>
          {subject.name !== display_name && (
            <p className="text-muted-foreground text-sm">{subject.name}</p>
          )}

          {/* 评分 */}
          {subject.rating && subject.rating.score > 0 ? (
            <div className="flex items-center gap-2">
              <Badge variant="default">{subject.rating.score.toFixed(1)}</Badge>
              {subject.rating.total > 0 ? (
                <span className="text-muted-foreground text-sm">
                  {subject.rating.total} 人评分
                </span>
              ) : null}
            </div>
          ) : null}

          {/* 集数/开播日期 */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {subject.eps && subject.eps > 0 ? <span>共 {subject.eps} 集</span> : null}
            {subject.date && <span>开播: {subject.date}</span>}
          </div>

          {/* 标签 */}
          {subject.tags && subject.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {subject.tags.slice(0, 6).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
              ))}
            </div>
          )}

          {/* Bangumi 链接 */}
          <Button
            variant="outline"
            size="sm"
            asChild
            className="mt-2"
          >
            <a
              href={`https://bgm.tv/subject/${subject.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="size-4" />
              在 Bangumi 查看
            </a>
          </Button>
        </div>
      </div>

      {/* 详细介绍 */}
      {subject.summary && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">简介</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p className="whitespace-pre-wrap">{subject.summary}</p>
          </CardContent>
        </Card>
      )}

      {/* 更多信息 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">详细信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {subject.eps && subject.eps > 0 ? (
              <div>
                <span className="text-muted-foreground">集数: </span>
                <span>{subject.eps}</span>
              </div>
            ) : null}
            {subject.date ? (
              <div>
                <span className="text-muted-foreground">开播: </span>
                <span>{subject.date}</span>
              </div>
            ) : null}
            {subject.fansub && subject.fansub !== '0' ? (
              <div>
                <span className="text-muted-foreground">字幕组: </span>
                <span>{subject.fansub}</span>
              </div>
            ) : null}
            {subject.episode_count && subject.episode_count > 0 ? (
              <div>
                <span className="text-muted-foreground">资源数量: </span>
                <span>{subject.episode_count}</span>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* 资源列表 */}
      {resource_error ? (
        // 资源加载失败
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">资源列表</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-3 py-4">
              <AlertCircle className="size-8 text-destructive" />
              <p className="text-destructive font-medium">加载资源失败</p>
              <p className="text-muted-foreground text-sm text-center">{resource_error}</p>
            </div>
          </CardContent>
        </Card>
      ) : subject.resources.length > 0 ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">
              资源列表 ({subject.resources.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {(() => {
                // 按字幕组分组
                const groups = new Map<string, typeof subject.resources>()
                const no_fansub: typeof subject.resources = []

                for (const r of subject.resources) {
                  const fansub_name = r.fansub?.name
                  if (fansub_name) {
                    if (!groups.has(fansub_name)) {
                      groups.set(fansub_name, [])
                    }
                    groups.get(fansub_name)!.push(r)
                  } else {
                    no_fansub.push(r)
                  }
                }

                // 每组内按时间排序
                for (const [, resources] of groups) {
                  resources.sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
                }
                no_fansub.sort((a, b) => b.created_at.getTime() - a.created_at.getTime())

                // 渲染分组
                const all_groups = [...groups.entries()].sort((a, b) => b[1].length - a[1].length)

                return (
                  <>
                    {all_groups.map(([fansub_name, resources]) => (
                      <div key={fansub_name} className="flex flex-col gap-2">
                        {/* 字幕组标题 */}
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          {resources[0]?.fansub?.avatar ? (
                            <img
                              src={resources[0].fansub.avatar}
                              alt={fansub_name}
                              className="size-5 rounded"
                            />
                          ) : null}
                          <span>{fansub_name}</span>
                          <span className="text-xs">({resources.length})</span>
                        </div>

                        {/* 资源列表 */}
                        {resources.map((resource) => (
                          <div
                            key={resource.id}
                            className="flex items-start gap-3 p-2 rounded bg-muted/50 hover:bg-muted transition-colors"
                          >
                            {/* 集数标签 */}
                            <Badge variant="secondary" className="shrink-0 mt-0.5">
                              {extract_episode(resource.title) || '资源'}
                            </Badge>

                            {/* 标题 */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm break-all">
                                {resource.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                <span>{format_size(resource.size)}</span>
                                <span>{format_date(resource.created_at)}</span>
                              </div>
                            </div>

                            {/* 复制按钮 */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  className="shrink-0"
                                  onClick={() => handle_copy(resource.magnet, resource.id)}
                                >
                                  {copied_id === resource.id ? (
                                    <Check className="size-4 text-primary" />
                                  ) : (
                                    <Copy className="size-4" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {copied_id === resource.id ? '已复制' : '复制磁力链接'}
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        ))}
                      </div>
                    ))}

                    {/* 无字幕组的资源 */}
                    {no_fansub.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <span>未知字幕组</span>
                          <span className="text-xs">({no_fansub.length})</span>
                        </div>
                        {no_fansub.map((resource) => (
                          <div
                            key={resource.id}
                            className="flex items-start gap-3 p-2 rounded bg-muted/50 hover:bg-muted transition-colors"
                          >
                            <Badge variant="secondary" className="shrink-0 mt-0.5">
                              {extract_episode(resource.title) || '资源'}
                            </Badge>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm break-all">
                                {resource.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                <span>{format_size(resource.size)}</span>
                                <span>{format_date(resource.created_at)}</span>
                              </div>
                            </div>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  className="shrink-0"
                                  onClick={() => handle_copy(resource.magnet, resource.id)}
                                >
                                  {copied_id === resource.id ? (
                                    <Check className="size-4 text-primary" />
                                  ) : (
                                    <Copy className="size-4" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {copied_id === resource.id ? '已复制' : '复制磁力链接'}
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )
              })()}
            </div>
          </CardContent>
        </Card>
      ) : (
        // 资源加载中
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">资源列表</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-[60px] rounded" />
              ))}
              <p className="text-center text-muted-foreground text-sm">正在加载资源...</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}