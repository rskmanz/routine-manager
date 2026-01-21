'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Sparkles, User, Copy, Plus, Loader2, ListChecks, Lightbulb, Wand2, Zap } from 'lucide-react'
import { useChat } from '@/hooks/useChat'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { ChatMessage, ContentBlock } from '@/types'
import { cn } from '@/lib/utils'

interface AIChatProps {
  routineTitle: string
  routineBlocks: ContentBlock[]
  onInsertBlock: (block: Omit<ContentBlock, 'id' | 'order'>) => void
}

export function AIChat({ routineTitle, routineBlocks, onInsertBlock }: AIChatProps) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, isLoading, error, sendMessage } = useChat({
    routineContext: {
      title: routineTitle,
      blocks: routineBlocks.map((b) => ({ type: b.type, content: b.content })),
    },
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const message = input.trim()
    setInput('')
    await sendMessage(message)
  }

  const handleInsertBlock = (block: { type: string; content: string }) => {
    onInsertBlock({
      type: block.type as ContentBlock['type'],
      content: block.content,
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <p className="text-foreground font-medium mb-2">
              AI Assistant
            </p>
            <p className="text-sm text-muted-foreground max-w-xs">
              Ask me to help with your routine. I can suggest content, structure,
              or automation strategies.
            </p>
            <div className="mt-4 space-y-2">
              <SuggestionButton
                onClick={() => sendMessage('Suggest some content blocks for this routine')}
              >
                Suggest content blocks
              </SuggestionButton>
              <SuggestionButton
                onClick={() => sendMessage('How can I automate this routine?')}
              >
                Automation ideas
              </SuggestionButton>
              <SuggestionButton
                onClick={() => sendMessage('Help me structure this routine better')}
              >
                Improve structure
              </SuggestionButton>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((message) => (
              <ChatMessageBubble
                key={message.id}
                message={message}
                onInsertBlock={handleInsertBlock}
                onCopy={copyToClipboard}
              />
            ))}
          </AnimatePresence>
        )}

        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-muted-foreground"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Thinking...</span>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg"
          >
            {error}
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-2 border-t border-border">
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {quickActions.map((action) => (
            <QuickActionButton
              key={action.label}
              label={action.label}
              icon={action.icon}
              onClick={() => sendMessage(action.prompt)}
              disabled={isLoading}
            />
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 pt-2 border-t border-border">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI for help..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}

// Quick action definitions
const quickActions = [
  { label: 'Checklist', icon: ListChecks, prompt: 'Create a checklist for this routine based on the content' },
  { label: 'Steps', icon: Lightbulb, prompt: 'Suggest step-by-step instructions for this routine' },
  { label: 'Improve', icon: Wand2, prompt: 'Improve and refine this routine content' },
  { label: 'Triggers', icon: Zap, prompt: 'Suggest automation triggers for this routine' },
]

interface QuickActionButtonProps {
  label: string
  icon: React.ComponentType<{ className?: string }>
  onClick: () => void
  disabled?: boolean
}

function QuickActionButton({ label, icon: Icon, onClick, disabled }: QuickActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap',
        'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground',
        'disabled:opacity-50 disabled:cursor-not-allowed'
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  )
}

interface SuggestionButtonProps {
  onClick: () => void
  children: React.ReactNode
}

function SuggestionButton({ onClick, children }: SuggestionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="text-sm text-primary hover:text-primary/80 hover:underline transition-colors"
    >
      {children}
    </button>
  )
}

interface ChatMessageBubbleProps {
  message: ChatMessage
  onInsertBlock: (block: { type: string; content: string }) => void
  onCopy: (text: string) => void
}

function ChatMessageBubble({ message, onInsertBlock, onCopy }: ChatMessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn('flex gap-3', isUser && 'justify-end')}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
      )}

      <div
        className={cn(
          'max-w-[80%] rounded-lg p-3',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-foreground'
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>

        {/* Suggested blocks */}
        {message.suggestedBlocks && message.suggestedBlocks.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-xs font-medium opacity-70">Suggested blocks:</p>
            {message.suggestedBlocks.map((block) => (
              <div
                key={block.id}
                className="flex items-start gap-2 bg-background/10 rounded p-2"
              >
                <div className="flex-1">
                  <span className="text-xs font-medium text-primary/80">
                    [{block.type}]
                  </span>
                  <p className="text-xs mt-1">{block.content}</p>
                </div>
                <button
                  onClick={() => onInsertBlock({ type: block.type, content: block.content })}
                  className="p-1 hover:bg-background/20 rounded transition-colors"
                  title="Insert block"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        {!isUser && (
          <div className="mt-2 flex justify-end">
            <button
              onClick={() => onCopy(message.content)}
              className="p-1 hover:bg-background/20 rounded transition-colors opacity-50 hover:opacity-100"
              title="Copy message"
            >
              <Copy className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
          <User className="h-4 w-4 text-secondary-foreground" />
        </div>
      )}
    </motion.div>
  )
}
