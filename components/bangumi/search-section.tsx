'use client'

import { useState, useCallback, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { X, Plus, Minus, Search, CalendarIcon } from 'lucide-react'
import { BangumiCard } from './bangumi-card'
import { Skeleton } from '@/components/ui/skeleton'
import { search_bangumi_subjects, SORT_TYPES, SORT_LABELS, SUBJECT_TYPES } from '@/lib/bangumi-api'
import { convert_subject_info_to_subject } from '@/lib/bangumi-utils'
import type { BangumiSubject, BangumiRecord } from '@/lib/types/bangumi'
import type { SortType } from '@/lib/bangumi-api'

type DateValue = Date | undefined

const SUBJECT_TYPE_OPTIONS = [
  { value: '2', label: '动画' },
  { value: '1', label: '书籍' },
  { value: '3', label: '音乐' },
  { value: '4', label: '游戏' },
  { value: '6', label: '三次元' },
]

function format_display_date(date: DateValue): string {
  if (!date) return '选择日期'
  return date.toLocaleDateString('zh-CN')
}

function date_to_filter_string(date: DateValue, prefix: string): string | undefined {
  if (!date) return undefined
  return `${prefix}${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

interface SearchSectionProps {
  records: BangumiRecord[]
  on_card_click: (subject_id: number) => void
}

export function SearchSection({
  records,
  on_card_click,
}: SearchSectionProps) {
  // 关键词
  const [keyword, set_keyword] = useState('')
  // 排序
  const [sort, set_sort] = useState<SortType>('heat')
  // 条目类型
  const [subject_type, set_subject_type] = useState<string>('2')
  // 标签
  const [tags, set_tags] = useState<string[]>([])
  const [tag_input, set_tag_input] = useState('')
  // 包含关键字
  const [include_tags, set_include_tags] = useState<string[]>([])
  const [include_input, set_include_input] = useState('')
  // 排除关键字
  const [exclude_tags, set_exclude_tags] = useState<string[]>([])
  const [exclude_input, set_exclude_input] = useState('')
  // 评分范围
  const [rating_min, set_rating_min] = useState<string>('')
  const [rating_max, set_rating_max] = useState<string>('')
  // 日期范围
  const [air_date_start, set_air_date_start] = useState<DateValue | undefined>(undefined)
  const [air_date_end, set_air_date_end] = useState<DateValue | undefined>(undefined)
  // 排名范围
  const [rank_min, set_rank_min] = useState<string>('')
  const [rank_max, set_rank_max] = useState<string>('')

  // 结果
  const [results, set_results] = useState<BangumiSubject[]>([])
  const [is_loading, set_is_loading] = useState(false)
  const [has_searched, set_has_searched] = useState(false)

  // 搜索结果区域 ref
  const results_ref = useRef<HTMLDivElement>(null)

  const handle_search = useCallback(async () => {
    if (!keyword.trim() && include_tags.length === 0) {
      return
    }

    set_is_loading(true)
    set_has_searched(true)

    // 滚动到结果区域
    setTimeout(() => {
      results_ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)

    try {
      // 构建搜索关键词
      const search_keyword = [
        keyword.trim(),
        ...include_tags,
      ].filter(Boolean).join(' ')

      // 构建筛选条件
      const filter: Record<string, any> = {
        type: [parseInt(subject_type)],
      }

      // 标签
      if (tags.length > 0) {
        filter.tag = tags
      }

      // 日期范围
      const air_date_filters: string[] = []
      const start_filter = date_to_filter_string(air_date_start, '>=')
      const end_filter = date_to_filter_string(air_date_end, '<=')
      if (start_filter) air_date_filters.push(start_filter)
      if (end_filter) air_date_filters.push(end_filter)
      if (air_date_filters.length > 0) {
        filter.air_date = air_date_filters
      }

      // 评分范围
      const rating_filters: string[] = []
      if (rating_min) rating_filters.push(`>=${rating_min}`)
      if (rating_max) rating_filters.push(`<${rating_max}`)
      if (rating_filters.length > 0) {
        filter.rating = rating_filters
      }

      // 排名范围
      const rank_filters: string[] = []
      if (rank_min) rank_filters.push(`>${rank_min}`)
      if (rank_max) rank_filters.push(`<=${rank_max}`)
      if (rank_filters.length > 0) {
        filter.rank = rank_filters
      }

      const search_result = await search_bangumi_subjects({
        keyword: search_keyword,
        sort,
        filter,
        limit: 50,
      })

      // 本地排除关键字筛选
      let filtered_data = search_result.data
      if (exclude_tags.length > 0) {
        filtered_data = filtered_data.filter(subject => {
          const name = subject.name_cn || subject.name
          const summary = subject.summary || ''
          const text = `${name} ${summary}`.toLowerCase()
          return !exclude_tags.some(ex =>
            text.includes(ex.toLowerCase())
          )
        })
      }

      const converted_subjects = filtered_data.map(convert_subject_info_to_subject)
      set_results(converted_subjects)
    } catch (error) {
      console.error('Search failed:', error)
    }

    set_is_loading(false)
  }, [keyword, sort, subject_type, tags, include_tags, exclude_tags, air_date_start, air_date_end, rating_min, rating_max, rank_min, rank_max])

  const handle_clear = useCallback(() => {
    set_keyword('')
    set_sort('heat')
    set_subject_type('2')
    set_tags([])
    set_tag_input('')
    set_include_tags([])
    set_include_input('')
    set_exclude_tags([])
    set_exclude_input('')
    set_rating_min('')
    set_rating_max('')
    set_air_date_start(undefined)
    set_air_date_end(undefined)
    set_rank_min('')
    set_rank_max('')
    set_results([])
    set_has_searched(false)
  }, [])

  const add_tag = useCallback((
    set_tags: React.Dispatch<React.SetStateAction<string[]>>,
    input: string,
    set_input: (v: string) => void
  ) => {
    const tag = input.trim()
    if (tag) {
      set_tags(prev => prev.includes(tag) ? prev : [...prev, tag])
      set_input('')
    }
  }, [])

  const remove_tag = useCallback((set_tags: React.Dispatch<React.SetStateAction<string[]>>, tag: string) => {
    set_tags(prev => prev.filter(t => t !== tag))
  }, [])

  const has_filters = tags.length > 0 || include_tags.length > 0 || exclude_tags.length > 0 ||
    rating_min || rating_max || air_date_start || air_date_end || rank_min || rank_max ||
    sort !== 'heat' || subject_type !== '2'

  return (
    <div className="flex flex-col gap-4">
      {/* 搜索面板 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            {/* 关键词输入 */}
            <div className="flex gap-2">
              <Input
                value={keyword}
                onChange={(e) => set_keyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handle_search()}
                placeholder="搜索番剧..."
                className="flex-1"
              />
              <Button onClick={handle_search}>
                <Search className="size-4" />
                搜索
              </Button>
              {(keyword || has_filters) ? (
                <Button variant="ghost" onClick={handle_clear}>
                  <X className="size-4" />
                  清空
                </Button>
              ) : null}
            </div>

            <Separator />

            {/* 排序和类型 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-muted-foreground">排序方式</label>
                <Select value={sort} onValueChange={(v) => set_sort(v as SortType)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="选择排序" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {SORT_TYPES.map((s) => (
                      <SelectItem key={s} value={s}>{SORT_LABELS[s]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-muted-foreground">条目类型</label>
                <Select value={subject_type} onValueChange={set_subject_type}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="选择类型" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {SUBJECT_TYPE_OPTIONS.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* 标签筛选 */}
            <div className="flex flex-col gap-2">
              <label className="text-sm text-muted-foreground">标签筛选（且关系，可用 `-标签` 排除）</label>
              <div className="flex gap-2">
                <Input
                  value={tag_input}
                  onChange={(e) => set_tag_input(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && add_tag(set_tags, tag_input, set_tag_input)}
                  placeholder="添加标签..."
                  className="flex-1"
                />
                <Button variant="outline" size="icon" onClick={() => add_tag(set_tags, tag_input, set_tag_input)}>
                  <Plus className="size-4" />
                </Button>
              </div>
              {tags.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={tag.startsWith('-') ? 'destructive' : 'secondary'}
                      className="cursor-pointer"
                      onClick={() => remove_tag(set_tags, tag)}
                    >
                      {tag}
                      <X className="size-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>

            <Separator />

            {/* 包含关键字 */}
            <div className="flex flex-col gap-2">
              <label className="text-sm text-muted-foreground">包含关键字</label>
              <div className="flex gap-2">
                <Input
                  value={include_input}
                  onChange={(e) => set_include_input(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && add_tag(set_include_tags, include_input, set_include_input)}
                  placeholder="添加包含关键字..."
                  className="flex-1"
                />
                <Button variant="outline" size="icon" onClick={() => add_tag(set_include_tags, include_input, set_include_input)}>
                  <Plus className="size-4" />
                </Button>
              </div>
              {include_tags.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {include_tags.map((tag) => (
                    <Badge key={tag} variant="default" className="cursor-pointer" onClick={() => remove_tag(set_include_tags, tag)}>
                      {tag}
                      <X className="size-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>

            <Separator />

            {/* 排除关键字 */}
            <div className="flex flex-col gap-2">
              <label className="text-sm text-muted-foreground">排除关键字（本地筛选）</label>
              <div className="flex gap-2">
                <Input
                  value={exclude_input}
                  onChange={(e) => set_exclude_input(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && add_tag(set_exclude_tags, exclude_input, set_exclude_input)}
                  placeholder="添加排除关键字..."
                  className="flex-1"
                />
                <Button variant="outline" size="icon" onClick={() => add_tag(set_exclude_tags, exclude_input, set_exclude_input)}>
                  <Minus className="size-4" />
                </Button>
              </div>
              {exclude_tags.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {exclude_tags.map((tag) => (
                    <Badge key={tag} variant="destructive" className="cursor-pointer" onClick={() => remove_tag(set_exclude_tags, tag)}>
                      {tag}
                      <X className="size-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>

            <Separator />

            {/* 评分范围 */}
            <div className="flex flex-col gap-2">
              <label className="text-sm text-muted-foreground">评分范围</label>
              <div className="flex gap-2 items-center">
                <Input
                  value={rating_min}
                  onChange={(e) => set_rating_min(e.target.value)}
                  placeholder="最低评分"
                  type="number"
                  min="0"
                  max="10"
                  className="w-24"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  value={rating_max}
                  onChange={(e) => set_rating_max(e.target.value)}
                  placeholder="最高评分"
                  type="number"
                  min="0"
                  max="10"
                  className="w-24"
                />
              </div>
            </div>

            <Separator />

            {/* 排名范围 */}
            <div className="flex flex-col gap-2">
              <label className="text-sm text-muted-foreground">排名范围</label>
              <div className="flex gap-2 items-center">
                <Input
                  value={rank_min}
                  onChange={(e) => set_rank_min(e.target.value)}
                  placeholder="最低排名"
                  type="number"
                  min="0"
                  className="w-24"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  value={rank_max}
                  onChange={(e) => set_rank_max(e.target.value)}
                  placeholder="最高排名"
                  type="number"
                  min="0"
                  className="w-24"
                />
              </div>
            </div>

            <Separator />

            {/* 播出日期范围 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-muted-foreground flex items-center gap-1">
                  <CalendarIcon className="size-3" />
                  开播日期晚于
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start">
                      {format_display_date(air_date_start)}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={air_date_start} onSelect={set_air_date_start} captionLayout="dropdown" />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-muted-foreground flex items-center gap-1">
                  <CalendarIcon className="size-3" />
                  开播日期早于
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start">
                      {format_display_date(air_date_end)}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={air_date_end} onSelect={set_air_date_end} captionLayout="dropdown" />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 搜索结果 */}
      {has_searched ? (
        <div ref={results_ref} className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">
            搜索结果 {results.length > 0 ? `(${results.length})` : ''}
          </h2>

          {is_loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-[200px] rounded-lg" />
              ))}
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((subject) => (
                <BangumiCard
                  key={subject.id}
                  subject={subject}
                  record={records.find(r => r.subject_id === subject.id)}
                  on_click={() => on_card_click(subject.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              未找到相关番剧
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}