'use client'

import { useState } from 'react'
import type { Post } from '@/lib/types/post'
import { PostLayout } from '@/components/post/post-layout'
import { PostSidebar } from '@/components/post/post-sidebar'
import { PostContent } from '@/components/post/post-content'
import { PostRecommend } from '@/components/post/post-recommend'
import { PostComments, type CommentsConfig } from '@/components/post/post-comments'
import type { TocHeading } from '@/components/post/post-toc'

interface PostPageContentProps {
  post: Post
  content: string
  recommended_posts: Post[]
  comments_config: CommentsConfig
  initial_comments_count?: number
}

export function PostPageContent({
  post,
  content,
  recommended_posts,
  comments_config,
  initial_comments_count = 0,
}: PostPageContentProps) {
  // 目录状态
  const [headings, set_headings] = useState<TocHeading[]>([])
  // 评论数状态（初始值为服务端获取的数量）
  const [comments_count, set_comments_count] = useState(initial_comments_count)

  return (
    <PostLayout
      profile_props={{
        name: 'Fufu',
        greeting: 'Ciallo～(∠・ω< )⌒★',
      }}
      announcement_props={{
        title: '公告',
        announcements: [
          {
            id: '1',
            content: '欢迎来到我的小站！这里是我的个人空间，记录着生活中的点点滴滴。',
            time: '2026-04-17',
          },
          {
            id: '2',
            content: '网站正在建设中，敬请期待更多内容。',
            time: '2026-04-16',
          },
        ],
        max_display: 3,
      }}
      right_sidebar={
        <PostSidebar
          cover={post.cover}
          likes={0}
          views={0}
          comments_count={comments_count}
          excerpt={post.excerpt}
          headings={headings}
          comments_section_id="comments"
        />
      }
      recommended_posts={<PostRecommend posts={recommended_posts} />}
      comments_section={
        <PostComments
          repo={comments_config.repo}
          repo_id={comments_config.repo_id}
          category={comments_config.category}
          category_id={comments_config.category_id}
          mapping={comments_config.mapping}
          section_id="comments"
          on_count_change={set_comments_count}
        />
      }
    >
      {/* 文章标题 */}
      <div className="bg-card/80 backdrop-blur-sm rounded-xl border border-border p-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">{post.title}</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <time>{post.date}</time>
          {post.tags.length > 0 && (
            <div className="flex gap-1">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-muted rounded text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 文章内容 */}
      <PostContent
        content={content}
        on_headings_change={set_headings}
      />
    </PostLayout>
  )
}