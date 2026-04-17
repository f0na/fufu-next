'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { ProfileCard } from './profile-card'
import { LikeButton } from './like-button'
import { ClockWidget } from './clock-widget'
import { WaveDivider } from '@/components/ui/wave-divider'

type EntranceState = 'idle' | 'exiting'

const exit_variants = {
  idle: { x: 0, y: 0, opacity: 1 },
  exiting: (direction: 'left' | 'right' | 'up' | 'down') => ({
    x: direction === 'left' ? '-100vw' : direction === 'right' ? '100vw' : 0,
    y: direction === 'up' ? '-100vh' : direction === 'down' ? '100vh' : 0,
    opacity: 0,
    transition: { duration: 0.8, ease: 'easeInOut' as const },
  }),
}

export function EntrancePage() {
  const router = useRouter()
  const [state, set_state] = useState<EntranceState>('idle')

  const handle_enter = () => {
    set_state('exiting')
    setTimeout(() => router.push('/home'), 250)
  }

  return (
    <div
      className="fixed inset-0 w-screen h-screen overflow-hidden cursor-pointer"
      onClick={handle_enter}
    >
      {/* 背景图 */}
      <div className="absolute inset-0">
        <Image
          src="https://t.alcy.cc/moez"
          alt="背景"
          fill
          className="object-cover"
          priority
          unoptimized
        />
        <div className="absolute inset-0 bg-background/20" />
      </div>

      {/* 波浪分割 */}
      <div className="absolute bottom-0 w-full">
        <WaveDivider height={80} />
      </div>

      {/* 组件层 */}
      <AnimatePresence>
        {state === 'idle' && (
          <div className="absolute top-[65%] left-1/2 -translate-x-1/2 flex gap-4 items-end">
            {/* 左侧：个人信息卡片 */}
            <motion.div
              key="profile"
              custom="left"
              variants={exit_variants}
              initial="idle"
              exit="exiting"
              onClick={(e) => e.stopPropagation()}
            >
              <ProfileCard />
            </motion.div>

            {/* 右侧：点赞和时钟 */}
            <div className="flex flex-col gap-3 mb-6">
              <motion.div
                key="like"
                custom="up"
                variants={exit_variants}
                initial="idle"
                exit="exiting"
                onClick={(e) => e.stopPropagation()}
              >
                <LikeButton initial_count={42} />
              </motion.div>
              <motion.div
                key="clock"
                custom="down"
                variants={exit_variants}
                initial="idle"
                exit="exiting"
                onClick={(e) => e.stopPropagation()}
              >
                <ClockWidget />
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}