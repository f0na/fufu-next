import { notFound } from 'next/navigation'
import { fetch_bangumi_subject } from '@/lib/bangumi-api'
import { PageWrapper } from '@/components/layout/page-wrapper'
import { BangumiDetailPage } from './bangumi-detail-page'

interface PageProps {
  params: Promise<{ id: string }>
}

// 番剧详情页（Server Component）
export default async function AnimeDetailPage({ params }: PageProps) {
  const { id } = await params
  const subject_id = parseInt(id, 10)

  if (isNaN(subject_id) || subject_id <= 0) {
    notFound()
  }

  const subject_info = await fetch_bangumi_subject(subject_id)

  if (!subject_info) {
    notFound()
  }

  return (
    <PageWrapper current_page="anime">
      <BangumiDetailPage
        subject_info={subject_info}
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
    </PageWrapper>
  )
}