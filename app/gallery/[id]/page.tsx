import { notFound } from 'next/navigation'
import { GallerySpace } from '@/components/gallery/gallery-space'
import { get_gallery_by_id } from '@/lib/gallery'

// 相册查看页（独立布局）
export default async function GalleryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const gallery = get_gallery_by_id(id)

  if (!gallery) {
    notFound()
  }

  return <GallerySpace gallery={gallery} />
}