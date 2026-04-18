import { notFound } from 'next/navigation'
import { get_post_by_slug, get_post_content, get_posts, get_recommended_posts, get_comments_count } from '@/lib/posts'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { HeroSection } from '@/components/home/hero-section'
import type { CommentsConfig } from '@/components/post/post-comments'
import { PostPageContent } from './post-page-content'

// 评论配置
const comments_config: CommentsConfig = {
  repo: 'f0na/fufu-next',
  repo_id: 'R_kgDOSF1Eww',
  category: 'Announcements',
  category_id: 'DIC_kwDOSF1Ew84C7HmC',
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

  // 获取初始评论数（服务端）
  const github_token = process.env.GITHUB_TOKEN
  let initial_comments_count = 0

  if (github_token) {
    const pathname = `posts/${slug}`
    initial_comments_count = await get_comments_count(pathname, {
      repo: comments_config.repo,
      repo_id: comments_config.repo_id,
      category_id: comments_config.category_id,
      github_token,
    })
  }

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
          initial_comments_count={initial_comments_count}
        />
      </div>

      {/* 页脚 */}
      <Footer />
    </div>
  )
}