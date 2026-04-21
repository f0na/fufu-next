import { PageWrapper } from '@/components/layout/page-wrapper'
import { HomeLayout } from '@/components/home/home-layout'
import { StatusContent } from '@/components/status'

// 网站状态页
export default function StatusPage() {
  return (
    <PageWrapper current_page="status">
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
        <StatusContent />
      </HomeLayout>
    </PageWrapper>
  )
}