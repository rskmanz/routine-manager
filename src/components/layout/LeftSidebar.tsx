'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { LayoutList, CalendarCheck, FileEdit, Settings } from 'lucide-react'
import { useNavigation } from '@/contexts/NavigationContext'
import type { ViewType } from '@/types'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/hooks/useTranslation'

interface NavItem {
  id: ViewType
  icon: React.ComponentType<{ className?: string }>
  labelKey: string
  requiresRoutine?: boolean
}

const navItems: NavItem[] = [
  { id: 'list', icon: LayoutList, labelKey: 'nav.list' },
  { id: 'schedule', icon: CalendarCheck, labelKey: 'nav.schedule' },
  { id: 'editor', icon: FileEdit, labelKey: 'nav.editor', requiresRoutine: true },
]

export function LeftSidebar() {
  const { currentView, navigateToView, selectedRoutineId } = useNavigation()
  const { t } = useTranslation()

  return (
    <motion.aside
      initial={{ x: -56, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed left-0 top-0 z-50 flex h-screen w-14 flex-col items-center border-r border-border bg-background/95 backdrop-blur-sm py-4"
    >
      {/* Logo/Brand */}
      <div className="mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-lg shadow-lg">
          R
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex flex-1 flex-col items-center gap-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentView === item.id
          const isDisabled = item.requiresRoutine && !selectedRoutineId

          if (isDisabled) {
            return null
          }

          return (
            <NavButton
              key={item.id}
              icon={Icon}
              label={t(item.labelKey as any)}
              isActive={isActive}
              onClick={() => navigateToView(item.id)}
            />
          )
        })}
      </nav>

      {/* Bottom Section */}
      <div className="mt-auto">
        <NavButton
          icon={Settings}
          label={t('button.settings')}
          isActive={false}
          onClick={() => {
            // TODO: Open settings modal
          }}
        />
      </div>
    </motion.aside>
  )
}

interface NavButtonProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  isActive: boolean
  onClick: () => void
}

function NavButton({ icon: Icon, label, isActive, onClick }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200',
        isActive
          ? 'bg-primary text-primary-foreground shadow-md'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      <Icon className="h-5 w-5" />

      {/* Active indicator */}
      {isActive && (
        <motion.div
          layoutId="nav-indicator"
          className="absolute -left-[3px] h-6 w-1.5 rounded-full bg-primary"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}

      {/* Tooltip */}
      <span className="absolute left-full ml-3 whitespace-nowrap rounded-md bg-popover px-2 py-1 text-xs font-medium text-popover-foreground shadow-md opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none">
        {label}
      </span>
    </button>
  )
}
