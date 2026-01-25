'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { LayoutList, CalendarCheck, FileEdit, Settings, User } from 'lucide-react'
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
      className="fixed left-0 top-0 z-50 hidden md:flex h-screen w-20 flex-col items-center border-r border-border bg-background/95 backdrop-blur-sm py-4"
    >
      {/* User Icon */}
      <div className="mb-6">
        <button className="flex flex-col items-center gap-1 p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
          <User className="h-5 w-5" />
          <span className="text-[10px] font-medium">User</span>
        </button>
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
        'flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 w-16',
        isActive
          ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-md'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="text-[10px] font-medium truncate w-full text-center">{label}</span>
    </button>
  )
}
