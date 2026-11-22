// SCRAPPY asset library. Stickers are lo-fi Y2K clip-art drawn in code by
// scripts/draw-stickers.py (flat 2D, plum outlines, white die-cut, 32-colour
// palette) and stored as small lossless WebP files in /public/assets/scrappy.
// Thumbnails (≤128px) are used for browsing; full images (≤256px) are used on
// the canvas and in exports. Regenerate with:
//   python3 scripts/draw-stickers.py public/assets/scrappy
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

export const STICKER_ASSETS: StickerAsset[] = [
  { id: 'gem-heart', label: 'pink heart rhinestone', category: 'gems', aspect: 1.112 },
  { id: 'gem-diamond', label: 'diamond', category: 'gems', aspect: 0.806 },
  { id: 'gem-oval', label: 'lilac oval gem', category: 'gems', aspect: 1.257 },
  { id: 'gem-star', label: 'star gem', category: 'gems', aspect: 1.049 },
  { id: 'gem-drop', label: 'aqua teardrop', category: 'gems', aspect: 0.756 },
  { id: 'gem-square', label: 'mint square gem', category: 'gems', aspect: 0.973 },
  { id: 'gem-pearl', label: 'pearl', category: 'gems', aspect: 1.0 },
  { id: 'gem-row', label: 'rhinestone row', category: 'gems', aspect: 4.444 },
  { id: 'gem-butterfly', label: 'gem butterfly', category: 'gems', aspect: 1.157 },
  { id: 'charm-clip', label: 'butterfly clip', category: 'charms', aspect: 1.092 },
  { id: 'charm-padlock', label: 'heart padlock', category: 'charms', aspect: 0.882 },
  { id: 'charm-cherry', label: 'cherry charm', category: 'charms', aspect: 0.846 },
  { id: 'charm-keychain', label: 'star keychain', category: 'charms', aspect: 0.748 },
  { id: 'charm-ring', label: 'flower ring', category: 'charms', aspect: 0.639 },
  { id: 'charm-bow', label: 'pink bow', category: 'charms', aspect: 1.259 },
  { id: 'charm-locket', label: 'heart locket', category: 'charms', aspect: 0.819 },
  { id: 'charm-bracelet', label: 'bead bracelet', category: 'charms', aspect: 1.155 },
  { id: 'charm-tiara', label: 'tiara', category: 'charms', aspect: 1.36 },
  { id: 'y2k-flip', label: 'flip phone', category: 'y2k', aspect: 0.521 },
  { id: 'y2k-mp3', label: 'mp3 player', category: 'y2k', aspect: 0.706 },
  { id: 'y2k-camera', label: 'digicam', category: 'y2k', aspect: 1.388 },
  { id: 'y2k-cd', label: 'cd', category: 'y2k', aspect: 1.0 },
  { id: 'y2k-handheld', label: 'handheld game', category: 'y2k', aspect: 1.225 },
  { id: 'y2k-computer', label: 'bubble computer', category: 'y2k', aspect: 0.819 },
  { id: 'y2k-pet', label: 'virtual pet', category: 'y2k', aspect: 0.735 },
  { id: 'y2k-cassette', label: 'cassette', category: 'y2k', aspect: 1.556 },
  { id: 'y2k-pager', label: 'pager', category: 'y2k', aspect: 1.581 },
  { id: 'cute-bunny', label: 'bunny', category: 'cute', aspect: 0.765 },
  { id: 'cute-kitten', label: 'kitten', category: 'cute', aspect: 0.907 },
  { id: 'cute-strawberry', label: 'strawberry', category: 'cute', aspect: 0.811 },
  { id: 'cute-cupcake', label: 'cupcake', category: 'cute', aspect: 0.765 },
  { id: 'cute-daisy', label: 'happy daisy', category: 'cute', aspect: 1.035 },
  { id: 'cute-cloud', label: 'happy cloud', category: 'cute', aspect: 1.442 },
  { id: 'cute-rainbow', label: 'rainbow', category: 'cute', aspect: 1.644 },
  { id: 'cute-icecream', label: 'ice cream', category: 'cute', aspect: 0.527 },
  { id: 'cute-star', label: 'star friend', category: 'cute', aspect: 1.044 },
  { id: 'mat-washi', label: 'washi tape', category: 'materials', aspect: 2.505 },
  { id: 'mat-clip', label: 'heart paperclip', category: 'materials', aspect: 1.117 },
  { id: 'mat-polaroid', label: 'instant photo', category: 'materials', aspect: 0.803 },
  { id: 'mat-paper', label: 'notebook scrap', category: 'materials', aspect: 0.936 },
  { id: 'mat-sticky', label: 'sticky note', category: 'materials', aspect: 0.92 },
  { id: 'mat-pin', label: 'safety pin', category: 'materials', aspect: 2.975 },
  { id: 'mat-ticket', label: 'ticket stub', category: 'materials', aspect: 2.125 },
  { id: 'mat-pushpin', label: 'pushpin', category: 'materials', aspect: 0.55 },
  { id: 'mat-doily', label: 'paper doily', category: 'materials', aspect: 1.0 },
]

export const FRAME_ASSETS: FrameAsset[] = []

export const assetFull = (id: string) => `/assets/scrappy/full/${id}.webp`
export const assetThumb = (id: string) => `/assets/scrappy/thumbs/${id}.webp`

export function findStickerAsset(id: string) {
  return STICKER_ASSETS.find((a) => a.id === id)
}
export function findFrameAsset(id: string) {
  return FRAME_ASSETS.find((a) => a.id === id)
}
