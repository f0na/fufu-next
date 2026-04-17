'use client'

import { useState } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { HeroSection } from '@/components/home/hero-section'
import { HomeLayout } from '@/components/home/home-layout'
import { ArchiveContent } from '@/components/archive/archive-content'

// 首页内容（与关于页一致）
function HomeContent() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-foreground">网站介绍</h1>
      <p className="text-muted-foreground leading-relaxed">
        这里是可爱芙芙的小窝，欢迎大家^^
      </p>
      <p className="text-muted-foreground leading-relaxed">
        这里是我的个人空间，记录着生活中的点点滴滴。
      </p>
      <p className="text-muted-foreground leading-relaxed">
        网站正在建设中，敬请期待更多内容。
      </p>
    </div>
  )
}

// 链接内容
function LinksContent() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-foreground">链接</h1>
      <p className="text-muted-foreground">收藏链接页面，正在建设中...</p>
    </div>
  )
}

// 追番内容
function AnimeContent() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-foreground">追番</h1>
      <p className="text-muted-foreground">追番记录页面，正在建设中...</p>
    </div>
  )
}

// 相册内容
function GalleryContent() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-foreground">相册</h1>
      <p className="text-muted-foreground">相册页面，正在建设中...</p>
    </div>
  )
}

// 友人帐内容
function FriendsContent() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-foreground">友人帐</h1>
      <p className="text-muted-foreground">友情链接页面，正在建设中...</p>
    </div>
  )
}

// 站状态内容
function StatusContent() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-foreground">网站状态</h1>
      <p className="text-muted-foreground">网站运行状态页面，正在建设中...</p>
    </div>
  )
}

export default function HomePage() {
  const [current_page, set_current_page] = useState('home')

  const handle_menu_click = (key: string) => {
    set_current_page(key)
  }

  // 判断是否为归档页
  const is_archive = current_page === 'archive'

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* 导航栏 */}
      <Navbar on_menu_click={handle_menu_click} current_page={current_page} />

      {/* 图片区域（含波浪分割） */}
      <HeroSection />

      {/* 主内容区域 */}
      <div className="flex-1 flex justify-center py-8">
        {is_archive ? (
          // 归档页使用特殊布局：三栏（左侧边栏 + 归档列表 + 筛选栏）
          <div className="w-full max-w-[61.8%] px-4">
            <ArchiveContent
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
              }}
            />
          </div>
        ) : (
          // 其他页面使用标准HomeLayout
          <HomeLayout
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
          >
            {/* 内容区 */}
            <div className="bg-card/80 backdrop-blur-sm rounded-xl border border-border p-6">
              {current_page === 'home' && <HomeContent />}
              {current_page === 'links' && <LinksContent />}
              {current_page === 'anime' && <AnimeContent />}
              {current_page === 'gallery' && <GalleryContent />}
              {current_page === 'friends' && <FriendsContent />}
              {current_page === 'status' && <StatusContent />}
            </div>
          </HomeLayout>
        )}
      </div>

      {/* 页脚 */}
      <Footer />
    </div>
  )
}