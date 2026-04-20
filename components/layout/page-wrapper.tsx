'use client'

import { ReactNode } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { HeroSection } from '@/components/home/hero-section'

interface PageWrapperProps {
  children: ReactNode
  current_page?: string
}

export function PageWrapper({ children, current_page }: PageWrapperProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar current_page={current_page} />
      <HeroSection />
      <div className="flex-1 flex justify-center py-8">
        {children}
      </div>
      <Footer />
    </div>
  )
}