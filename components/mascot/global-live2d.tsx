'use client'

import { createPortal } from 'react-dom'
import { useContext } from 'react'
import { Live2DMascot } from '@/components/mascot/live2d-mascot'
import { RightSidebarPortalContext } from '@/context/right-sidebar-portal-context'

export function GlobalLive2D() {
  const { portal_target } = useContext(RightSidebarPortalContext)

  if (!portal_target) return null

  return createPortal(
    <Live2DMascot />,
    portal_target
  )
}