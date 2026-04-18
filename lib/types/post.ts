export interface Post {
  slug: string
  title: string
  date: string
  tags: string[]
  cover?: string
  excerpt?: string
  content?: string
  views?: number
  likes?: number
  comments_count?: number
}

export interface PostsResponse {
  posts: Post[]
  page: number
  has_more: boolean
}