'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Link, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import type { ResourceSource, ResourceType } from '@/types'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/hooks/useTranslation'

interface AddSourceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (source: Omit<ResourceSource, 'id' | 'addedAt'>) => void
}

type SourceMode = 'url' | 'text'
type FetchStatus = 'idle' | 'loading' | 'success' | 'error'

export function AddSourceDialog({ open, onOpenChange, onSubmit }: AddSourceDialogProps) {
  const { t } = useTranslation()
  const [mode, setMode] = useState<SourceMode>('url')
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const resetForm = useCallback(() => {
    setMode('url')
    setUrl('')
    setTitle('')
    setContent('')
    setFetchStatus('idle')
    setError(null)
  }, [])

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      resetForm()
    }
  }, [open, resetForm])

  const isValidUrl = (str: string): boolean => {
    try {
      new URL(str)
      return true
    } catch {
      return false
    }
  }

  const handleFetchUrl = useCallback(async (urlToFetch: string) => {
    if (!urlToFetch.trim() || !isValidUrl(urlToFetch)) return

    setFetchStatus('loading')
    setError(null)

    try {
      const response = await fetch('/api/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToFetch.trim() }),
      })

      const data = await response.json()

      if (data.success) {
        setTitle(data.data.title || urlToFetch)
        setContent(data.data.content || '')
        setFetchStatus('success')
      } else {
        setError(data.error || 'Failed to fetch URL')
        setFetchStatus('error')
        // Set title to URL hostname as fallback
        try {
          setTitle(new URL(urlToFetch).hostname)
        } catch {
          setTitle(urlToFetch)
        }
      }
    } catch {
      setError('Failed to fetch URL. You can still add it manually.')
      setFetchStatus('error')
      try {
        setTitle(new URL(urlToFetch).hostname)
      } catch {
        setTitle(urlToFetch)
      }
    }
  }, [])

  // Auto-fetch when URL changes (debounced)
  useEffect(() => {
    if (mode !== 'url' || !url.trim() || !isValidUrl(url)) {
      if (fetchStatus !== 'idle') {
        setFetchStatus('idle')
      }
      return
    }

    const timer = setTimeout(() => {
      handleFetchUrl(url)
    }, 500)

    return () => clearTimeout(timer)
  }, [url, mode, handleFetchUrl, fetchStatus])

  const handleUrlPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text')
    if (isValidUrl(pastedText)) {
      // Fetch immediately on paste
      setTimeout(() => handleFetchUrl(pastedText), 100)
    }
  }

  const handleSubmit = () => {
    if (mode === 'url' && !url.trim()) return
    if (mode === 'text' && !content.trim()) return
    if (!title.trim()) return

    const source: Omit<ResourceSource, 'id' | 'addedAt'> = {
      title: title.trim(),
      type: mode as ResourceType,
      url: mode === 'url' ? url.trim() : undefined,
      content: content.trim() || undefined,
    }

    onSubmit(source)
    onOpenChange(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && canSubmit) {
      handleSubmit()
    }
  }

  const canSubmit = title.trim() && (mode === 'url' ? url.trim() : content.trim())

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" onKeyDown={handleKeyDown}>
        <DialogHeader>
          <DialogTitle>{t('addSource.title')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Mode selector */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMode('url')}
              className={cn(
                'flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all',
                mode === 'url'
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border hover:border-primary/30 hover:bg-muted/50'
              )}
            >
              <Link className="h-4 w-4" />
              <span className="text-sm font-medium">{t('addSource.url')}</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('text')}
              className={cn(
                'flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all',
                mode === 'text'
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border hover:border-primary/30 hover:bg-muted/50'
              )}
            >
              <FileText className="h-4 w-4" />
              <span className="text-sm font-medium">{t('addSource.text')}</span>
            </button>
          </div>

          {/* URL mode */}
          {mode === 'url' && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">{t('addSource.urlLabel')}</label>
                <div className="relative">
                  <Input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onPaste={handleUrlPaste}
                    placeholder="https://example.com/article"
                    className="pr-10"
                    autoFocus
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {fetchStatus === 'loading' && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                    {fetchStatus === 'success' && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    {fetchStatus === 'error' && (
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                    )}
                  </div>
                </div>
                {fetchStatus === 'loading' && (
                  <p className="text-xs text-muted-foreground">{t('addSource.fetchingContent')}</p>
                )}
                {error && (
                  <p className="text-xs text-amber-600">{error}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">{t('addSource.titleLabel')}</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('addSource.sourceTitle')}
                />
              </div>

              {/* Content preview */}
              {content && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted-foreground">
                    {t('addSource.preview')} ({content.split(/\s+/).length.toLocaleString()} {t('sources.words')})
                  </label>
                  <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg max-h-32 overflow-y-auto">
                    {content.slice(0, 500)}
                    {content.length > 500 && (
                      <span className="text-primary"> ...more</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Text mode */}
          {mode === 'text' && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">{t('addSource.titleLabel')}</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('addSource.sourceTitle')}
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">{t('addSource.contentLabel')}</label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={t('addSource.pasteOrType')}
                  rows={8}
                  className="resize-none"
                />
                {content && (
                  <p className="text-xs text-muted-foreground">
                    {content.split(/\s+/).length.toLocaleString()} {t('sources.words')}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('button.cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {t('sources.addSource')}
          </Button>
        </DialogFooter>

        <p className="text-xs text-center text-muted-foreground">
          {t('addSource.pressToAdd')} <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px]">⌘</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px]">Enter</kbd> {t('addSource.toAdd')}
        </p>
      </DialogContent>
    </Dialog>
  )
}
