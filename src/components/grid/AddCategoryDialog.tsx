'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Briefcase, User, Heart, Folder, Book, Code, Music, Gamepad2, Plane, DollarSign, Check,
  Home, Car, Dumbbell, Coffee, Camera, Palette, Lightbulb, Target, Star, Zap,
  Globe, Headphones, ShoppingBag, Utensils, GraduationCap, Rocket, Award, Trophy,
  Sun, Moon, Mountain, Leaf, Flame
} from 'lucide-react'
import type { Category, ColorPattern } from '@/types'
import { getPatternPreview, patternInfo } from '@/lib/colorUtils'
import { cn } from '@/lib/utils'

const icons = [
  // Work & Professional
  { name: 'Briefcase', icon: <Briefcase className="w-5 h-5" /> },
  { name: 'Target', icon: <Target className="w-5 h-5" /> },
  { name: 'Lightbulb', icon: <Lightbulb className="w-5 h-5" /> },
  { name: 'Rocket', icon: <Rocket className="w-5 h-5" /> },
  { name: 'Code', icon: <Code className="w-5 h-5" /> },
  // Personal & Lifestyle
  { name: 'User', icon: <User className="w-5 h-5" /> },
  { name: 'Home', icon: <Home className="w-5 h-5" /> },
  { name: 'Coffee', icon: <Coffee className="w-5 h-5" /> },
  { name: 'Star', icon: <Star className="w-5 h-5" /> },
  { name: 'Zap', icon: <Zap className="w-5 h-5" /> },
  // Health & Fitness
  { name: 'Heart', icon: <Heart className="w-5 h-5" /> },
  { name: 'Dumbbell', icon: <Dumbbell className="w-5 h-5" /> },
  { name: 'Flame', icon: <Flame className="w-5 h-5" /> },
  { name: 'Sun', icon: <Sun className="w-5 h-5" /> },
  { name: 'Leaf', icon: <Leaf className="w-5 h-5" /> },
  // Learning & Creative
  { name: 'Book', icon: <Book className="w-5 h-5" /> },
  { name: 'GraduationCap', icon: <GraduationCap className="w-5 h-5" /> },
  { name: 'Palette', icon: <Palette className="w-5 h-5" /> },
  { name: 'Camera', icon: <Camera className="w-5 h-5" /> },
  { name: 'Music', icon: <Music className="w-5 h-5" /> },
  // Entertainment & Hobbies
  { name: 'Gamepad2', icon: <Gamepad2 className="w-5 h-5" /> },
  { name: 'Headphones', icon: <Headphones className="w-5 h-5" /> },
  { name: 'Mountain', icon: <Mountain className="w-5 h-5" /> },
  { name: 'Globe', icon: <Globe className="w-5 h-5" /> },
  { name: 'Plane', icon: <Plane className="w-5 h-5" /> },
  // Finance & Shopping
  { name: 'DollarSign', icon: <DollarSign className="w-5 h-5" /> },
  { name: 'ShoppingBag', icon: <ShoppingBag className="w-5 h-5" /> },
  { name: 'Award', icon: <Award className="w-5 h-5" /> },
  { name: 'Trophy', icon: <Trophy className="w-5 h-5" /> },
  { name: 'Folder', icon: <Folder className="w-5 h-5" /> },
]

const colorPatterns: ColorPattern[] = ['monochrome', 'complementary', 'rainbow', 'warm', 'cool']

interface AddCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => void
  editingCategory?: Category | null
}

export function AddCategoryDialog({
  open,
  onOpenChange,
  onSubmit,
  editingCategory,
}: AddCategoryDialogProps) {
  const [title, setTitle] = useState(editingCategory?.title || '')
  const [icon, setIcon] = useState(editingCategory?.icon || 'Folder')
  const [colorPattern, setColorPattern] = useState<ColorPattern>(editingCategory?.colorPattern || 'complementary')

  React.useEffect(() => {
    if (editingCategory) {
      setTitle(editingCategory.title)
      setIcon(editingCategory.icon)
      setColorPattern(editingCategory.colorPattern || 'complementary')
    } else {
      setTitle('')
      setIcon('Folder')
      setColorPattern('complementary')
    }
  }, [editingCategory, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    onSubmit({
      title: title.trim(),
      icon,
      colorPattern,
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Title
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Work & Professional"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Icon
              </label>
              <div className="flex flex-wrap gap-2">
                {icons.map((i) => (
                  <button
                    key={i.name}
                    type="button"
                    onClick={() => setIcon(i.name)}
                    className={`p-2.5 rounded-lg transition-all ${
                      icon === i.name
                        ? 'bg-primary/20 ring-2 ring-primary text-primary'
                        : 'hover:bg-accent text-muted-foreground'
                    }`}
                  >
                    {i.icon}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Color Pattern
              </label>
              <p className="text-xs text-muted-foreground mb-2">
                Choose how goals in this category will be colored automatically
              </p>
              <div className="grid grid-cols-1 gap-2">
                {colorPatterns.map((pattern) => {
                  const info = patternInfo[pattern]
                  const preview = getPatternPreview(pattern)
                  return (
                    <button
                      key={pattern}
                      type="button"
                      onClick={() => setColorPattern(pattern)}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-xl border transition-all text-left',
                        colorPattern === pattern
                          ? 'border-primary bg-primary/5 ring-2 ring-primary'
                          : 'border-border hover:border-primary/50 hover:bg-accent'
                      )}
                    >
                      <div className="flex -space-x-1">
                        {preview.map((color, i) => (
                          <div
                            key={i}
                            className={cn(
                              'w-5 h-5 rounded-full bg-gradient-to-br shadow-sm',
                              color
                            )}
                          />
                        ))}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{info.label}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {info.description}
                        </div>
                      </div>
                      {colorPattern === pattern && (
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
