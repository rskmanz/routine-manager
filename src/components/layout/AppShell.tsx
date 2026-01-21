'use client'

import React from 'react'
import { NavigationProvider } from '@/contexts/NavigationContext'
import { LeftSidebar } from './LeftSidebar'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <NavigationProvider>
      <div className="flex min-h-screen">
        {/* Left Sidebar */}
        <LeftSidebar />

        {/* Main Content Area */}
        <main className="flex-1 pl-14">
          {children}
        </main>
      </div>
    </NavigationProvider>
  )
}
