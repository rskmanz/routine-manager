import type { ColorPattern } from '@/types'

// Color palettes for different patterns
const colorPalettes: Record<ColorPattern, string[]> = {
  monochrome: [
    'from-indigo-400 to-indigo-600',
    'from-indigo-500 to-indigo-700',
    'from-indigo-300 to-indigo-500',
    'from-violet-400 to-violet-600',
    'from-violet-500 to-violet-700',
    'from-purple-400 to-purple-600',
  ],
  complementary: [
    'from-rose-400 to-rose-600',
    'from-cyan-400 to-cyan-600',
    'from-amber-400 to-amber-600',
    'from-indigo-400 to-indigo-600',
    'from-emerald-400 to-emerald-600',
    'from-violet-400 to-violet-600',
  ],
  rainbow: [
    'from-red-400 to-red-600',
    'from-orange-400 to-orange-600',
    'from-yellow-400 to-yellow-600',
    'from-green-400 to-green-600',
    'from-blue-400 to-blue-600',
    'from-purple-400 to-purple-600',
  ],
  warm: [
    'from-rose-400 to-rose-600',
    'from-orange-400 to-orange-600',
    'from-amber-400 to-amber-600',
    'from-red-400 to-red-600',
    'from-pink-400 to-pink-600',
    'from-yellow-400 to-yellow-600',
  ],
  cool: [
    'from-cyan-400 to-cyan-600',
    'from-blue-400 to-blue-600',
    'from-indigo-400 to-indigo-600',
    'from-teal-400 to-teal-600',
    'from-sky-400 to-sky-600',
    'from-violet-400 to-violet-600',
  ],
}

// Get color for a goal based on its position in the category
export function getGoalColor(pattern: ColorPattern, index: number): string {
  const palette = colorPalettes[pattern]
  return palette[index % palette.length]
}

// Get preview colors for a pattern (for the UI)
export function getPatternPreview(pattern: ColorPattern): string[] {
  return colorPalettes[pattern].slice(0, 4)
}

// Pattern display info
export const patternInfo: Record<ColorPattern, { label: string; description: string }> = {
  monochrome: {
    label: 'Monochrome',
    description: 'Similar shades of purple/indigo',
  },
  complementary: {
    label: 'Complementary',
    description: 'Contrasting colors that pop',
  },
  rainbow: {
    label: 'Rainbow',
    description: 'Full spectrum of colors',
  },
  warm: {
    label: 'Warm',
    description: 'Red, orange, and yellow tones',
  },
  cool: {
    label: 'Cool',
    description: 'Blue, cyan, and teal tones',
  },
}
