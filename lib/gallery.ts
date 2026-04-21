import fs from 'fs'
import path from 'path'
import type { Gallery } from './types/gallery'

const gallery_path = path.join(process.cwd(), 'content', 'gallery.json')

export function get_galleries(): Gallery[] {
  try {
    const data = fs.readFileSync(gallery_path, 'utf-8')
    const json = JSON.parse(data)
    return json.galleries || []
  } catch {
    return []
  }
}

export function get_gallery_by_id(id: string): Gallery | null {
  const galleries = get_galleries()
  return galleries.find(g => g.id === id) || null
}