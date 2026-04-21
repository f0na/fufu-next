'use client'

import { useState, useEffect, useRef } from 'react'
import { FriendsList } from './friends-list'
import { FriendsSidebar } from './friends-sidebar'
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll'
import { ProfileCard } from '@/components/entrance/profile-card'
import { Announcement } from '@/components/home/announcement'
import type { FriendItem } from '@/lib/types/friend'
import type { AnnouncementItem } from '@/components/home/announcement'

interface FriendsContentProps {
  className?: string
  profile_props?: {
    name?: string
    avatar_url?: string
    greeting?: string
    social_links?: {
      bilibili?: string
      github?: string
      email?: string
    }
  }
  announcement_props?: {
    title?: string
    announcements?: AnnouncementItem[]
    max_display?: number
  }
}

export function FriendsContent({ className, profile_props, announcement_props }: FriendsContentProps) {
  const [friends, set_friends] = useState<FriendItem[]>([])
  const [page, set_page] = useState(1)
  const [has_more, set_has_more] = useState(true)
  const [is_loading, set_is_loading] = useState(false)

  const is_loading_ref = useRef(false)

  const fetch_friends = async (page_num: number, reset: boolean = false) => {
    if (is_loading_ref.current) return

    is_loading_ref.current = true
    set_is_loading(true)

    try {
      const params = new URLSearchParams()
      params.set('page', page_num.toString())
      params.set('limit', '12')

      const response = await fetch(`/api/friends?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        if (reset) {
          set_friends(data.friends)
          set_page(1)
        } else {
          set_friends(prev => [...prev, ...data.friends])
          set_page(page_num)
        }
        set_has_more(data.has_more)
      }
    } catch (error) {
      console.error('Failed to fetch friends:', error)
    } finally {
      set_is_loading(false)
      is_loading_ref.current = false
    }
  }

  useEffect(() => {
    const do_initial_load = async () => {
      if (is_loading_ref.current) return
      is_loading_ref.current = true
      set_is_loading(true)
      set_friends([])
      set_page(1)
      set_has_more(true)

      try {
        const params = new URLSearchParams()
        params.set('page', '1')
        params.set('limit', '12')

        const response = await fetch(`/api/friends?${params.toString()}`)
        if (response.ok) {
          const data = await response.json()
          set_friends(data.friends)
          set_has_more(data.has_more)
        }
      } catch (error) {
        console.error('Failed to fetch friends:', error)
      } finally {
        set_is_loading(false)
        is_loading_ref.current = false
      }
    }
    do_initial_load()
  }, [])

  const { sentinelRef, isLoading: scroll_loading } = useInfiniteScroll({
    has_more,
    onLoadMore: async () => {
      if (!is_loading_ref.current && has_more) {
        await fetch_friends(page + 1)
      }
    },
    root_margin: '100px',
    disabled: is_loading || friends.length === 0,
  })

  return (
    <div className={className}>
      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="hidden lg:flex flex-col gap-4 w-[16%] shrink-0">
          <ProfileCard
            {...profile_props}
            className="w-full"
          />
          <Announcement
            title={announcement_props?.title}
            announcements={announcement_props?.announcements}
          />
        </aside>

        <main className="flex-1 lg:w-[60%] min-w-0">
          <div className="lg:hidden mb-4">
            <FriendsSidebar is_portal_target={false} />
          </div>

          <FriendsList
            friends={friends}
            isLoading={is_loading || scroll_loading}
            hasMore={has_more}
            sentinelRef={sentinelRef}
          />
        </main>

        <aside className="hidden lg:block w-[20%] shrink-0">
          <FriendsSidebar is_portal_target={true} />
        </aside>
      </div>
    </div>
  )
}