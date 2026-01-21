'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Link,
  FileText,
  Upload,
  ExternalLink,
  Trash2,
  BookOpen,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ResourceSource, ResourceType } from '@/types'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/hooks/useTranslation'
import { AddSourceDialog } from './AddSourceDialog'

interface SourcesPanelProps {
  sources: ResourceSource[]
  onAddSource: (source: Omit<ResourceSource, 'id' | 'addedAt'>) => void
  onRemoveSource: (id: string) => void
  className?: string
}

const typeConfig: Record<ResourceType, { icon: React.ComponentType<{ className?: string }>; color: string; bg: string; labelKey: string }> = {
  url: { icon: Link, color: 'text-blue-600', bg: 'bg-blue-50', labelKey: 'type.web' },
  text: { icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50', labelKey: 'type.text' },
  file: { icon: Upload, color: 'text-amber-600', bg: 'bg-amber-50', labelKey: 'type.file' },
}

export function SourcesPanel({
  sources,
  onAddSource,
  onRemoveSource,
  className,
}: SourcesPanelProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const { t } = useTranslation()

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{t('sources.title')}</h2>
          <p className="text-sm text-muted-foreground">
            {t('sources.emptyDesc')}
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          {t('sources.addSource')}
        </Button>
      </div>

      {/* Sources Grid or Empty State */}
      {sources.length === 0 ? (
        <EmptyState onAdd={() => setIsAddDialogOpen(true)} t={t} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {sources.map((source) => (
              <SourceCard
                key={source.id}
                source={source}
                onRemove={() => onRemoveSource(source.id)}
                t={t}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Stats */}
      {sources.length > 0 && (
        <div className="flex items-center gap-4 text-sm text-muted-foreground pt-4 border-t">
          <span>{sources.length} {sources.length !== 1 ? t('sources.sources') : t('sources.source')}</span>
          <span>•</span>
          <span>
            {sources.reduce((acc, s) => acc + (s.content?.length || 0), 0).toLocaleString()} {t('sources.characters')}
          </span>
        </div>
      )}

      {/* Add Source Dialog */}
      <AddSourceDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={onAddSource}
      />
    </div>
  )
}

function EmptyState({ onAdd, t }: { onAdd: () => void; t: (key: any) => string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/30"
    >
      <div className="rounded-full bg-zinc-100 dark:bg-zinc-800 p-4 mb-4">
        <BookOpen className="h-8 w-8 text-zinc-600 dark:text-zinc-400" />
      </div>
      <h3 className="font-semibold text-lg mb-2">{t('sources.empty')}</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
        {t('sources.emptyDesc')}
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={onAdd} className="gap-2">
          <Link className="h-4 w-4" />
          {t('dialog.addUrl')}
        </Button>
        <Button variant="outline" onClick={onAdd} className="gap-2">
          <FileText className="h-4 w-4" />
          {t('dialog.pasteText')}
        </Button>
      </div>
      <div className="flex items-center gap-2 mt-6 text-xs text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5" />
        <span>{t('sources.aiWillUse')}</span>
      </div>
    </motion.div>
  )
}

interface SourceCardProps {
  source: ResourceSource
  onRemove: () => void
  t: (key: any) => string
}

function SourceCard({ source, onRemove, t }: SourceCardProps) {
  const config = typeConfig[source.type]
  const Icon = config.icon
  const wordCount = source.content ? source.content.split(/\s+/).length : 0

  const handleClick = () => {
    if (source.url) {
      window.open(source.url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative rounded-xl border border-border bg-card overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Type Badge */}
      <div className={cn('absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-medium', config.bg, config.color)}>
        {t(config.labelKey)}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Icon & Title */}
        <div className="flex items-start gap-3 mb-3 pr-16">
          <div className={cn('p-2 rounded-lg shrink-0', config.bg)}>
            <Icon className={cn('h-4 w-4', config.color)} />
          </div>
          <div className="min-w-0">
            <h4 className="font-medium text-sm truncate" title={source.title}>
              {source.title}
            </h4>
            {source.url && (
              <p className="text-xs text-muted-foreground truncate" title={source.url}>
                {new URL(source.url).hostname}
              </p>
            )}
          </div>
        </div>

        {/* Content Preview */}
        {source.content && (
          <p className="text-xs text-muted-foreground line-clamp-3 mb-3">
            {source.content.slice(0, 200)}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <span className="text-xs text-muted-foreground">
            {wordCount > 0 ? `${wordCount.toLocaleString()} ${t('sources.words')}` : t('sources.noContent')}
          </span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {source.url && (
              <button
                onClick={handleClick}
                className="p-1.5 rounded-md hover:bg-muted transition-colors"
                title={t('sources.openUrl')}
              >
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            )}
            <button
              onClick={onRemove}
              className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors"
              title={t('sources.removeSource')}
            >
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
