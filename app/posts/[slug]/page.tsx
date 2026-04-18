import { notFound } from 'next/navigation'
import { get_post_by_slug, get_post_content, get_posts, get_recommended_posts } from '@/lib/posts'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { HeroSection } from '@/components/home/hero-section'
import type { CommentsConfig } from '@/components/post/post-comments'
import { PostPageContent } from './post-page-content'

// 评论配置（占位符）
const comments_config: CommentsConfig = {
  repo: 'placeholder/placeholder',
  repo_id: 'placeholder-id',
  category: 'Announcements',
  category_id: 'placeholder-category-id',
  mapping: 'pathname',
}

interface PageProps {
  params: Promise<{ slug: string }>
}

// 生成静态路径
export async function generateStaticParams() {
  const { posts } = get_posts({ limit: 100 })
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

// 文章详情页（Server Component）
export default async function PostPage({ params }: PageProps) {
  const { slug } = await params
  const post = get_post_by_slug(slug)

  if (!post) {
    notFound()
  }

  const content_result = get_post_content(slug)
  if (!content_result) {
    notFound()
  }

  // 获取推荐文章
  const recommended_posts = get_recommended_posts(post, 3)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* 导航栏 */}
      <Navbar current_page="archive" />

      {/* 图片区域（含波浪分割） */}
      <HeroSection />

      {/* 主内容区域 */}
      <div className="flex-1 flex justify-center py-8">
        <PostPageContent
          post={post}
          content={content_result.content}
          recommended_posts={recommended_posts}
          comments_config={comments_config}
        />
      </div>

      {/* 页脚 */}
      <Footer />
    </div>
  )
}