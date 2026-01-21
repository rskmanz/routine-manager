'use client'

import React from 'react'
import { LayoutList, LayoutGrid, Table } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LayoutType } from './layouts/types'

interface LayoutSwitcherProps {
  value: LayoutType
  onChange: (layout: LayoutType) => void
}

const layouts: { type: LayoutType; icon: React.ReactNode; label: string }[] = [
  { type: 'scroll', icon: <LayoutList className="h-4 w-4" />, label: 'Scroll' },
  { type: 'grid', icon: <LayoutGrid className="h-4 w-4" />, label: 'Grid' },
  { type: 'table', icon: <Table className="h-4 w-4" />, label: 'Table' },
]

export function LayoutSwitcher({ value, onChange }: LayoutSwitcherProps) {
  return (
    <div className="inline-flex items-center rounded-xl bg-zinc-100/50 dark:bg-zinc-800/50 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-700/50 p-1 shadow-sm">
      {layouts.map(({ type, icon, label }) => (
        <button
          key={type}
          onClick={() => onChange(type)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
            value === type
              ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-md'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-zinc-700/50'
          )}
        >
          {icon}
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  )
}
