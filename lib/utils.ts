import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function generateId(prefix = '') {
  return `${prefix}${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min
}

export function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export const CONFETTI_COLORS = ['#FF4FA3', '#C9B6FF', '#A8DFFF', '#FFF0A8', '#FFB6D9']

export const DECORATIONS = ['✦', '★', '♡', '✿', '♪', '◆', '●', '✸', '❋', '⊹']

export const SPARKLES = ['✦', '★', '✸', '⊹', '◆', '❋']

export const STICKER_CATEGORIES = {
  symbols: ['✦', '★', '♡', '✿', '◆', '⊹', '✸', '❋', '♪', '☆'],
  shapes: ['●', '◎', '◇', '△', '▽', '◉', '⬡', '⬟', '⬢', '⬣'],
  marks: ['✓', '✗', '✕', '✖', '✚', '✜', '✝', '✞', '✟', '✠'],
  lines: ['—', '~', '≈', '∼', '⌒', '∞', '≋', '⌇', '⌁', '⌀'],
  floral: ['✾', '✽', '✼', '✻', '✺', '✹', '✸', '✷', '✶', '✵'],
}
