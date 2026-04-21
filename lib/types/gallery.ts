// 相册相关类型定义

export interface Gallery {
  id: string
  title: string
  cover_path: string  // 封面图片路径
  photos: string[]    // 图片路径数组
  tags: string[]      // 标签
  created_at: string
}

export interface PhotoState {
  id: string          // 照片路径作为 id
  x: number           // 位置 x
  y: number           // 位置 y
  rotation: number    // 旋转角度
  z_index: number     // 层级
}