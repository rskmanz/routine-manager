'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import type { ViewType } from '@/types'

interface NavigationContextValue {
  currentView: ViewType
  setCurrentView: (view: ViewType) => void
  selectedRoutineId: string | null
  setSelectedRoutineId: (id: string | null) => void
  navigateToView: (view: ViewType, routineId?: string) => void
}

const NavigationContext = createContext<NavigationContextValue | null>(null)

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [selectedRoutineId, setSelectedRoutineId] = useState<string | null>(null)

  // Determine current view from pathname
  const getCurrentView = useCallback((): ViewType => {
    if (pathname.startsWith('/routines/')) {
      return 'editor'
    }
    if (pathname === '/schedule') {
      return 'schedule'
    }
    return 'list'
  }, [pathname])

  const [currentView, setCurrentViewState] = useState<ViewType>(getCurrentView())

  // Sync view with pathname
  useEffect(() => {
    const view = getCurrentView()
    setCurrentViewState(view)

    // Extract routine ID from pathname if in editor
    if (pathname.startsWith('/routines/')) {
      const routineId = pathname.split('/routines/')[1]
      if (routineId) {
        setSelectedRoutineId(routineId)
      }
    }
  }, [pathname, getCurrentView])

  const setCurrentView = useCallback((view: ViewType) => {
    setCurrentViewState(view)
  }, [])

  const navigateToView = useCallback((view: ViewType, routineId?: string) => {
    switch (view) {
      case 'list':
        router.push('/')
        break
      case 'schedule':
        router.push('/schedule')
        break
      case 'editor':
        if (routineId) {
          setSelectedRoutineId(routineId)
          router.push(`/routines/${routineId}`)
        } else if (selectedRoutineId) {
          router.push(`/routines/${selectedRoutineId}`)
        }
        break
    }
  }, [router, selectedRoutineId])

  return (
    <NavigationContext.Provider
      value={{
        currentView,
        setCurrentView,
        selectedRoutineId,
        setSelectedRoutineId,
        navigateToView,
      }}
    >
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider')
  }
  return context
}
