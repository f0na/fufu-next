export interface LinkItem {
  id: string
  title: string
  url: string
  description?: string
  tags: string[]
  created_at: string
  is_starred?: boolean
}

export interface LinksResponse {
  links: LinkItem[]
  page: number
  has_more: boolean
}

export interface LinksMeta {
  all_tags: string[]
}