export interface Post {
  slug: string
  title: string
  date: string
  tags: string[]
  cover?: string
  excerpt?: string
}

export interface PostsResponse {
  posts: Post[]
  page: number
  has_more: boolean
}