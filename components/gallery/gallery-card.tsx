'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { Gallery } from '@/lib/types/gallery'

interface GalleryCardProps {
  gallery: Gallery
  className?: string
}

export function GalleryCard({ gallery, className }: GalleryCardProps) {
  return (
    <Link href={`/gallery/${gallery.id}`}>
      <div
        className={cn(
          'relative cursor-pointer group pb-2',
          className
        )}
      >
        {/* 封面 - 细边框 */}
        <div className="rounded-xl border border-border/50 overflow-hidden">
          <img
            src={gallery.cover_path}
            alt={gallery.title}
            className="aspect-[3/4] w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>

        {/* 标题和标签 */}
        <div className="pt-2 px-1">
          <h3 className="font-medium text-sm leading-tight truncate">
            {gallery.title}
          </h3>
          {/* 标签 */}
          {gallery.tags && gallery.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {gallery.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}