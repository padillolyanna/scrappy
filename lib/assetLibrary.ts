// SCRAPPY realistic asset library — photographed-style stickers and frames
// generated with Higgsfield AI, background-removed, and stored as optimised
// WebP files in /public/assets/scrappy. Thumbnails (256px) are used for
// browsing; full images (≤1024px) are used on the canvas and in exports.
//
// To add an asset: drop `<id>.webp` into public/assets/scrappy/full and
// public/assets/scrappy/thumbs, then add an entry below.

export type StickerCategory = 'gems' | 'charms' | 'y2k' | 'cute' | 'materials'
export type FrameCategory = 'camera' | 'purikura' | 'magazine' | 'scrapbook' | 'deco'

export interface StickerAsset {
  id: string
  label: string
  category: StickerCategory
  /** width / height of the artwork */
  aspect: number
}

export interface FrameAsset {
  id: string
  label: string
  category: FrameCategory
  aspect: number
  /** the transparent photo window, in % of the frame image */
  window: { x: number; y: number; w: number; h: number }
}

export const STICKER_CATEGORIES: { id: StickerCategory; label: string; color: string }[] = [
  { id: 'gems', label: 'rhinestones & gems', color: '#FF4FA3' },
  { id: 'charms', label: 'charms & accessories', color: '#7C4DDB' },
  { id: 'y2k', label: 'y2k gadgets', color: '#1D9BF0' },
  { id: 'cute', label: 'cute deco', color: '#F59E0B' },
  { id: 'materials', label: 'scrapbook materials', color: '#14B8A6' },
]

export const FRAME_CATEGORIES: { id: FrameCategory; label: string; color: string }[] = [
  { id: 'camera', label: 'digital camera', color: '#1D9BF0' },
  { id: 'purikura', label: 'purikura', color: '#FF4FA3' },
  { id: 'magazine', label: 'magazine', color: '#F59E0B' },
  { id: 'scrapbook', label: 'scrapbook', color: '#14B8A6' },
  { id: 'deco', label: '3D deco', color: '#7C4DDB' },
]

export const STICKER_ASSETS: StickerAsset[] = []

export const FRAME_ASSETS: FrameAsset[] = []

export const assetFull = (id: string) => `/assets/scrappy/full/${id}.webp`
export const assetThumb = (id: string) => `/assets/scrappy/thumbs/${id}.webp`

export function findStickerAsset(id: string) {
  return STICKER_ASSETS.find((a) => a.id === id)
}
export function findFrameAsset(id: string) {
  return FRAME_ASSETS.find((a) => a.id === id)
}
