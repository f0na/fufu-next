export interface FriendItem {
  id: string
  name: string
  url: string
  avatar?: string
  description?: string
  created_at: string
}

export interface FriendsResponse {
  friends: FriendItem[]
  page: number
  has_more: boolean
}