import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// 图片代理 API - 服务 content/imgs 目录下的图片
export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params

  // 安全检查：只允许图片文件
  const allowed_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  const ext = path.extname(filename).toLowerCase()
  if (!allowed_extensions.includes(ext)) {
    return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
  }

  const file_path = path.join(process.cwd(), 'content', 'imgs', filename)

  try {
    const file_buffer = fs.readFileSync(file_path)

    // 根据扩展名设置 Content-Type
    const content_types: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
    }

    return new NextResponse(file_buffer, {
      headers: {
        'Content-Type': content_types[ext] || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000',
      },
    })
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }
}