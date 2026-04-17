'use client'

import { createContext, useContext, useState, ReactNode, useCallback } from 'react'

interface RightSidebarPortalContextValue {
  portal_target: HTMLElement | null
  set_portal_target: (target: HTMLElement | null) => void
}

const default_value: RightSidebarPortalContextValue = {
  portal_target: null,
  set_portal_target: () => {},
}

export const RightSidebarPortalContext = createContext<RightSidebarPortalContextValue>(default_value)

export function use_right_sidebar_portal(): RightSidebarPortalContextValue {
  return useContext(RightSidebarPortalContext)
}

export function RightSidebarPortalProvider({ children }: { children: ReactNode }) {
  const [portal_target, set_portal_target_state] = useState<HTMLElement | null>(null)

  const set_portal_target = useCallback((target: HTMLElement | null) => {
    set_portal_target_state(target)
  }, [])

  const value: RightSidebarPortalContextValue = {
    portal_target,
    set_portal_target,
  }

  return (
    <RightSidebarPortalContext.Provider value={value}>
      {children}
    </RightSidebarPortalContext.Provider>
  )
}