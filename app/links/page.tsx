import { PageWrapper } from '@/components/layout/page-wrapper'
import { LinksContent } from '@/components/links/links-content'

// 链接页
export default function LinksPage() {
  return (
    <PageWrapper current_page="links">
      <div className="w-full max-w-[61.8%] px-4">
        <LinksContent
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
        />
      </div>
    </PageWrapper>
  )
}