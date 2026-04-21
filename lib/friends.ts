import * as fs from 'fs'
import * as path from 'path'
import type { FriendItem, FriendsResponse } from './types/friend'

const FRIENDS_FILE = path.join(process.cwd(), 'content/friends/friends.json')

const DATA_SOURCE = process.env.DATA_SOURCE || 'local'

function read_friends_from_file(): FriendItem[] {
  if (!fs.existsSync(FRIENDS_FILE)) {
    return []
  }

  try {
    const file_content = fs.readFileSync(FRIENDS_FILE, 'utf-8')
    const data = JSON.parse(file_content)
    return Array.isArray(data.friends) ? data.friends : []
  } catch (error) {
    console.error('Failed to read friends file:', error)
    return []
  }
}

async function fetch_all_friends(): Promise<FriendItem[]> {
  if (DATA_SOURCE === 'api') {
    return read_friends_from_file()
  }

  return read_friends_from_file()
}

export async function get_friends(options: {
  page?: number
  limit?: number
  sort?: 'asc' | 'desc'
} = {}): Promise<FriendsResponse> {
  const {
    page = 1,
    limit = 10,
    sort = 'desc',
  } = options

  let friends = await fetch_all_friends()

  friends.sort((a, b) => {
    const date_a = new Date(a.created_at).getTime()
    const date_b = new Date(b.created_at).getTime()
    return sort === 'desc' ? date_b - date_a : date_a - date_b
  })

  const start_index = (page - 1) * limit
  const end_index = start_index + limit
  const paginated_friends = friends.slice(start_index, end_index)
  const has_more = end_index < friends.length

  return {
    friends: paginated_friends,
    page,
    has_more,
  }
}

export async function get_friend_by_id(id: string): Promise<FriendItem | null> {
  const friends = await fetch_all_friends()
  return friends.find((friend) => friend.id === id) || null
}