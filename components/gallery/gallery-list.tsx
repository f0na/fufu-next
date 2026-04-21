'use client'

import { GalleryCard } from './gallery-card'
import type { Gallery } from '@/lib/types/gallery'

interface GalleryListProps {
  galleries: Gallery[]
}

export function GalleryList({ galleries }: GalleryListProps) {
  if (galleries.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        暂无相册
      </div>
    )
  }

  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
      {galleries.map((gallery) => (
        <GalleryCard
          key={gallery.id}
          gallery={gallery}
          className="break-inside-avoid"
        />
      ))}
    </div>
  )
}