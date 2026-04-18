'use client'

import React, { useEffect, useRef, useState, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { codeToHtml } from 'shiki'
import mermaid from 'mermaid'
import { Card, CardContent } from '@/components/ui/card'
import { extract_headings_from_markdown, type TocHeading } from './post-toc'
import { cn } from '@/lib/utils'
import 'katex/dist/katex.min.css'

// 初始化 Mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: 'neutral',
  securityLevel: 'loose',
  timeline: {
    disableMulticolor: false,
    useMaxWidth: true,
  },
})

interface PostContentProps {
  /** Markdown 内容 */
  content: string
  /** 目录变化回调 */
  on_headings_change?: (headings: TocHeading[]) => void
  /** 自定义类名 */
  className?: string
}

// Mermaid 图表组件
function MermaidBlock({ code }: { code: string }) {
  const [svg, set_svg] = useState<string>('')
  const [error, set_error] = useState<string>('')

  useEffect(() => {
    mermaid
      .render('mermaid-' + Date.now(), code)
      .then(({ svg }) => set_svg(svg))
      .catch((err) => {
        set_error('图表渲染失败')
        console.error('Mermaid render error:', err)
      })
  }, [code])

  if (error) {
    return (
      <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm text-muted-foreground">
        {code}
      </pre>
    )
  }

  return (
    <div
      className="mermaid-container my-4 overflow-x-auto rounded-lg bg-muted/50 p-4"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}

// 代码块组件 - 修复横向滚动背景问题
function CodeBlock({
  code,
  lang,
}: {
  code: string
  lang?: string
}) {
  const [html, set_html] = useState<string>('')
  const [copied, set_copied] = useState(false)

  useEffect(() => {
    codeToHtml(code, {
      lang: lang || 'text',
      theme: 'github-light',
    })
      .then(set_html)
      .catch(() => {
        // 如果语言不支持，回退到纯文本
        set_html(`<pre class="shiki"><code>${escapeHtml(code)}</code></pre>`)
      })
  }, [code, lang])

  const handle_copy = async () => {
    await navigator.clipboard.writeText(code)
    set_copied(true)
    setTimeout(() => set_copied(false), 2000)
  }

  // Mermaid 图表使用专门的渲染组件
  if (lang === 'mermaid') {
    return <MermaidBlock code={code} />
  }

  return (
    <div className="relative group my-4">
      <button
        onClick={handle_copy}
        className={cn(
          'absolute top-3 right-3 z-10 px-2 py-1 text-xs rounded-md transition-all',
          'bg-background/80 text-muted-foreground hover:text-foreground',
          'opacity-0 group-hover:opacity-100',
          copied && 'opacity-100'
        )}
      >
        {copied ? '已复制' : '复制'}
      </button>
      {html ? (
        <div
          className="shiki-wrapper overflow-x-auto rounded-lg bg-muted p-4"
          style={{ maxWidth: '100%' }}
        >
          <div
            className="shiki text-sm min-w-full"
            style={{ display: 'inline-block' }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      ) : (
        <pre className="shiki overflow-x-auto rounded-lg bg-muted p-4 text-sm">
          <code>{code}</code>
        </pre>
      )}
    </div>
  )
}

// HTML 转义函数
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (char) => map[char])
}

// 数学公式检测 - 改进检测逻辑（备用）
function isMath(text: string): boolean {
  const trimmed = text.trim()
  // 块级公式 $$...$$
  if (trimmed.startsWith('$$') && trimmed.endsWith('$$')) {
    return true
  }
  // 行内公式 $...$ (但不匹配普通价格如 $5)
  if (trimmed.startsWith('$') && trimmed.endsWith('$') && trimmed.length > 2) {
    // 排除类似 "$5" 这样的普通文本
    const inner = trimmed.slice(1, -1)
    // 如果内部包含数学符号或空格，认为是公式
    if (inner.includes('=') || inner.includes('\\') || inner.includes('{') || inner.includes(' ') || inner.includes('^') || inner.includes('_')) {
      return true
    }
  }
  return false
}

// 解析图片尺寸语法
// 支持: ![alt =200x](url) 或 ![alt =200x100](url) 或 ![alt =x100](url)
function parse_image_size(alt: string): { alt_text: string; width?: number; height?: number } {
  if (!alt) return { alt_text: alt }

  // 匹配 =宽x高 格式
  const match = alt.match(/=(\d+)?x(\d+)?$/)
  if (match) {
    const width = match[1] ? parseInt(match[1], 10) : undefined
    const height = match[2] ? parseInt(match[2], 10) : undefined
    const alt_text = alt.replace(match[0], '').trim()
    return { alt_text, width, height }
  }

  return { alt_text: alt }
}

export function PostContent({
  content,
  on_headings_change,
  className,
}: PostContentProps) {
  const content_ref = useRef<HTMLDivElement>(null)

  // 提取目录
  const headings = useMemo(() => {
    return extract_headings_from_markdown(content)
  }, [content])

  // 通知父组件目录变化
  useEffect(() => {
    on_headings_change?.(headings)
  }, [headings, on_headings_change])

  // 为标题添加 id
  useEffect(() => {
    if (!content_ref.current) return

    const heading_elements = content_ref.current.querySelectorAll('h1, h2, h3, h4, h5, h6')
    heading_elements.forEach((el, index) => {
      const heading = headings[index]
      if (heading && !el.id) {
        el.id = heading.id
      }
    })
  }, [content, headings])

  return (
    <Card size="sm" className={cn('overflow-hidden !pt-0 !gap-0', className)}>
      {/* 文档内容 - 移除顶部空白 */}
      <CardContent className="p-6 !pt-0 overflow-hidden">
        <div ref={content_ref} className="markdown-content">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              // 代码块
              code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '')
                const is_inline = !match && !String(children).includes('\n')

                if (is_inline) {
                  return (
                    <code
                      className="px-1.5 py-0.5 rounded bg-muted text-foreground font-mono text-sm"
                      {...props}
                    >
                      {children}
                    </code>
                  )
                }

                const lang = match?.[1]
                const code = String(children).replace(/\n$/, '')

                return <CodeBlock code={code} lang={lang} />
              },
              // 数学公式 - 使用katex-display类
              p({ children, node, ...props }) {
                // 检查children是否包含katex元素
                if (node?.children?.[0]?.type === 'raw' && String(node.children[0].value).includes('katex')) {
                  return <div className="katex-block my-4 overflow-x-auto text-center">{children}</div>
                }
                return <p className="mb-4 leading-7" {...props}>{children}</p>
              },
              // 表格 - 添加样式
              table({ children, ...props }) {
                return (
                  <div className="my-4 overflow-x-auto">
                    <table className="w-full border-collapse border border-border text-sm" {...props}>
                      {children}
                    </table>
                  </div>
                )
              },
              // 表头
              th({ children, ...props }) {
                return (
                  <th className="border border-border bg-muted px-3 py-2 text-left font-medium" {...props}>
                    {children}
                  </th>
                )
              },
              // 表格单元格
              td({ children, ...props }) {
                return (
                  <td className="border border-border px-3 py-2" {...props}>
                    {children}
                  </td>
                )
              },
              // 图片 - 支持尺寸语法 ![alt =200x](url)
              img({ src, alt, ...props }) {
                const { alt_text, width, height } = parse_image_size(alt || '')
                return (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={src}
                    alt={alt_text}
                    width={width}
                    height={height}
                    className="max-w-full h-auto rounded-lg"
                    loading="lazy"
                    {...props}
                  />
                )
              },
              // 链接
              a({ href, children, ...props }) {
                return (
                  <a
                    href={href}
                    target={href?.startsWith('http') ? '_blank' : undefined}
                    rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="text-primary hover:underline"
                    {...props}
                  >
                    {children}
                  </a>
                )
              },
              // 引用块
              blockquote({ children, ...props }) {
                return (
                  <blockquote
                    className="border-l-4 border-primary pl-4 my-4 text-muted-foreground italic"
                    {...props}
                  >
                    {children}
                  </blockquote>
                )
              },
              // 列表
              ul({ children, ...props }) {
                return <ul className="list-disc list-inside mb-4 space-y-1" {...props}>{children}</ul>
              },
              ol({ children, ...props }) {
                return <ol className="list-decimal list-inside mb-4 space-y-1" {...props}>{children}</ol>
              },
              // 标题
              h1: create_heading_component('h1', 'text-2xl font-bold mb-4 mt-6 text-foreground'),
              h2: create_heading_component('h2', 'text-xl font-bold mb-3 mt-6 text-foreground'),
              h3: create_heading_component('h3', 'text-lg font-semibold mb-2 mt-4 text-foreground'),
              h4: create_heading_component('h4', 'text-base font-semibold mb-2 mt-4 text-foreground'),
              h5: create_heading_component('h5', 'text-sm font-semibold mb-2 mt-4 text-foreground'),
              h6: create_heading_component('h6', 'text-sm font-medium mb-2 mt-4 text-foreground'),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  )
}

// 创建标题组件
function create_heading_component(tag: string, default_class: string) {
  return function Heading({
    id,
    children,
    className,
    ...props
  }: React.HTMLAttributes<HTMLHeadingElement>) {
    return React.createElement(
      tag,
      { id, className: cn(default_class, className), ...props },
      children
    )
  }
}