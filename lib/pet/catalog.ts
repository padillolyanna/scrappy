/* My Little Pet — accessory catalog.
   The same ids, slots, rarities and unlock rules are seeded into public.pet_accessories
   by supabase/migrations/20261124000001_my_little_pet.sql; the database is what enforces
   ownership, this file is what the UI shows and draws. Keep the two in sync. */

export type Slot = 'head' | 'eyes' | 'glasses' | 'cheeks' | 'body' | 'outfit' | 'effect'
export type Category = 'head' | 'face' | 'body' | 'outfit' | 'effect'
export type Rarity = 'common' | 'rare' | 'special' | 'limited'
export type Unlock =
  | 'free' | 'first_scrapbook' | 'first_public' | 'first_hangout' | 'first_exchange'
  | 'five_scrapbooks' | 'prompts_3' | 'prompts_7' | 'event_holiday_2026'

export type Equipped = Partial<Record<Slot, string>>

export interface PetItem {
  id: string
  name: string
  category: Category
  slot: Slot
  rarity: Rarity
  unlock: Unlock
  description: string
  addedAt: string
}

export const SLOTS: Slot[] = ['head', 'eyes', 'glasses', 'cheeks', 'body', 'outfit', 'effect']

export const CATEGORIES: { id: Category; label: string; slots: Slot[] }[] = [
  { id: 'head', label: 'Head', slots: ['head'] },
  { id: 'face', label: 'Face', slots: ['eyes', 'glasses', 'cheeks'] },
  { id: 'body', label: 'Body', slots: ['body'] },
  { id: 'outfit', label: 'Outfits', slots: ['outfit'] },
  { id: 'effect', label: 'Effects', slots: ['effect'] },
]

export const SLOT_LABEL: Record<Slot, string> = {
  head: 'head', eyes: 'eyes', glasses: 'glasses', cheeks: 'cheeks', body: 'body', outfit: 'outfit', effect: 'effect',
}

export const RARITY: Record<Rarity, { label: string; color: string }> = {
  common: { label: 'Common', color: '#6B4A66' },
  rare: { label: 'Rare', color: '#1E6ED2' },
  special: { label: 'Special', color: '#7C3AED' },
  limited: { label: 'Limited Edition', color: '#C2006B' },
}

export const UNLOCK_TEXT: Record<Unlock, string> = {
  free: 'Free for everyone',
  first_scrapbook: 'Make your first scrapbook',
  first_public: 'Publish your first public scrapbook',
  first_hangout: 'RSVP to your first Journal Hangout',
  first_exchange: 'Complete a Scrapbook Exchange with a friend',
  five_scrapbooks: 'Make 5 scrapbooks',
  prompts_3: 'Answer 3 daily prompts',
  prompts_7: 'Answer 7 daily prompts',
  event_holiday_2026: 'Holiday event: log in between Dec 1, 2026 and Jan 6, 2027',
}

const D = '2026-11-24'
export const PET_ITEMS: PetItem[] = [
  // head
  { id: 'bow-pink', name: 'Tiny bow', category: 'head', slot: 'head', rarity: 'common', unlock: 'free', addedAt: D, description: 'A glossy pink bow clipped just above the ear.' },
  { id: 'clip-heart', name: 'Heart clip', category: 'head', slot: 'head', rarity: 'common', unlock: 'free', addedAt: D, description: 'A jelly heart hair clip with a little shine.' },
  { id: 'clip-butterfly', name: 'Butterfly clip', category: 'head', slot: 'head', rarity: 'common', unlock: 'free', addedAt: D, description: 'The classic 2002 butterfly clip, in baby blue.' },
  { id: 'ears-cat', name: 'Cat ears', category: 'head', slot: 'head', rarity: 'common', unlock: 'free', addedAt: D, description: 'Soft pink kitty ears. Meow.' },
  { id: 'antenna-stars', name: 'Antenna charms', category: 'head', slot: 'head', rarity: 'common', unlock: 'free', addedAt: D, description: 'Two tiny star charms hanging off the antenna.' },
  { id: 'clip-star', name: 'Star clip', category: 'head', slot: 'head', rarity: 'rare', unlock: 'first_scrapbook', addedAt: D, description: 'A gold star clip for making your very first scrapbook.' },
  { id: 'headphones', name: 'Pink headphones', category: 'head', slot: 'head', rarity: 'rare', unlock: 'first_hangout', addedAt: D, description: 'Big candy-pink headphones for hangout playlists.' },
  { id: 'crown', name: 'Mini crown', category: 'head', slot: 'head', rarity: 'special', unlock: 'five_scrapbooks', addedAt: D, description: 'A tiny gold crown with pink gems. Scrapbook royalty.' },
  // face
  { id: 'eyes-sparkle', name: 'Sparkly eyes', category: 'face', slot: 'eyes', rarity: 'common', unlock: 'free', addedAt: D, description: 'Big shiny eyes with star highlights.' },
  { id: 'eyes-happy', name: 'Happy eyes', category: 'face', slot: 'eyes', rarity: 'common', unlock: 'free', addedAt: D, description: 'Smiling ^ ^ eyes.' },
  { id: 'eyes-sleepy', name: 'Sleepy eyes', category: 'face', slot: 'eyes', rarity: 'common', unlock: 'free', addedAt: D, description: 'Cozy half-asleep eyes.' },
  { id: 'eyes-wink', name: 'Wink', category: 'face', slot: 'eyes', rarity: 'common', unlock: 'free', addedAt: D, description: 'One eye open, one eye winking.' },
  { id: 'glasses-round', name: 'Round glasses', category: 'face', slot: 'glasses', rarity: 'common', unlock: 'free', addedAt: D, description: 'Little round specs for reading diaries.' },
  { id: 'glasses-heart', name: 'Heart glasses', category: 'face', slot: 'glasses', rarity: 'common', unlock: 'free', addedAt: D, description: 'Pink tinted heart-shaped sunnies.' },
  { id: 'blush', name: 'Blush', category: 'face', slot: 'cheeks', rarity: 'common', unlock: 'free', addedAt: D, description: 'Rosy pink cheeks.' },
  { id: 'freckles', name: 'Tiny freckles', category: 'face', slot: 'cheeks', rarity: 'common', unlock: 'free', addedAt: D, description: 'A sprinkle of freckles.' },
  { id: 'sticker-star', name: 'Face sticker', category: 'face', slot: 'cheeks', rarity: 'common', unlock: 'free', addedAt: D, description: 'A gold star sticker on the cheek.' },
  // body
  { id: 'necklace-pearl', name: 'Pearl necklace', category: 'body', slot: 'body', rarity: 'common', unlock: 'free', addedAt: D, description: 'A string of tiny plastic pearls.' },
  { id: 'ribbon-neck', name: 'Neck ribbon', category: 'body', slot: 'body', rarity: 'common', unlock: 'free', addedAt: D, description: 'A satin ribbon tied in a bow.' },
  { id: 'bag-mini', name: 'Mini bag', category: 'body', slot: 'body', rarity: 'common', unlock: 'free', addedAt: D, description: 'A little yellow shoulder bag for snacks and stickers.' },
  { id: 'badge-heart', name: 'Heart badge', category: 'body', slot: 'body', rarity: 'common', unlock: 'free', addedAt: D, description: 'A pin-back button with a heart.' },
  { id: 'backpack', name: 'Tiny backpack', category: 'body', slot: 'body', rarity: 'rare', unlock: 'first_public', addedAt: D, description: 'A lilac jelly backpack for sharing your first public scrapbook.' },
  { id: 'charm-heart', name: 'Heart charm', category: 'body', slot: 'body', rarity: 'rare', unlock: 'first_exchange', addedAt: D, description: 'A friendship heart charm from a finished exchange.' },
  { id: 'badge-star', name: 'Star badge', category: 'body', slot: 'body', rarity: 'rare', unlock: 'prompts_3', addedAt: D, description: 'A gold star pin for answering daily prompts.' },
  // outfits
  { id: 'hoodie-pink', name: 'Pink hoodie', category: 'outfit', slot: 'outfit', rarity: 'common', unlock: 'free', addedAt: D, description: 'A comfy pink hoodie with a sparkle print.' },
  { id: 'hoodie-purple', name: 'Purple hoodie', category: 'outfit', slot: 'outfit', rarity: 'common', unlock: 'free', addedAt: D, description: 'The same hoodie in grape purple.' },
  { id: 'outfit-pastel', name: 'Pastel stripes', category: 'outfit', slot: 'outfit', rarity: 'common', unlock: 'free', addedAt: D, description: 'A mint, lilac and pink striped top.' },
  { id: 'pajamas', name: 'Pajamas', category: 'outfit', slot: 'outfit', rarity: 'common', unlock: 'free', addedAt: D, description: 'Baby blue polka-dot PJs for sleepovers.' },
  { id: 'outfit-metallic', name: 'Y2K metallic', category: 'outfit', slot: 'outfit', rarity: 'common', unlock: 'free', addedAt: D, description: 'A shiny silver top with pink trim.' },
  { id: 'sweater-holiday', name: 'Holiday sweater', category: 'outfit', slot: 'outfit', rarity: 'limited', unlock: 'event_holiday_2026', addedAt: D, description: 'A pink knit sweater with snowflakes. Holiday 2026 only.' },
  // effects
  { id: 'fx-sparkles', name: 'Sparkles', category: 'effect', slot: 'effect', rarity: 'common', unlock: 'free', addedAt: D, description: 'Twinkly sparkles all around.' },
  { id: 'fx-hearts', name: 'Floating hearts', category: 'effect', slot: 'effect', rarity: 'common', unlock: 'free', addedAt: D, description: 'Little hearts drifting up.' },
  { id: 'fx-stars', name: 'Stars', category: 'effect', slot: 'effect', rarity: 'common', unlock: 'free', addedAt: D, description: 'Gold stars spinning nearby.' },
  { id: 'fx-bubbles', name: 'Tiny bubbles', category: 'effect', slot: 'effect', rarity: 'common', unlock: 'free', addedAt: D, description: 'Soap bubbles floating by.' },
  { id: 'fx-glitter', name: 'Glitter trail', category: 'effect', slot: 'effect', rarity: 'special', unlock: 'five_scrapbooks', addedAt: D, description: 'A shimmering trail of glitter.' },
  { id: 'fx-holo', name: 'Holographic glow', category: 'effect', slot: 'effect', rarity: 'special', unlock: 'prompts_7', addedAt: D, description: 'A rainbow holo aura that shifts colour.' },
]

export const ITEM_BY_ID: Record<string, PetItem> = Object.fromEntries(PET_ITEMS.map((i) => [i.id, i]))

/** Drop unknown ids and anything in the wrong slot. */
export function cleanEquipped(raw: unknown): Equipped {
  const out: Equipped = {}
  if (!raw || typeof raw !== 'object') return out
  for (const slot of SLOTS) {
    const id = (raw as Record<string, unknown>)[slot]
    if (typeof id === 'string' && ITEM_BY_ID[id]?.slot === slot) out[slot] = id
  }
  return out
}

export function isOwned(item: PetItem, owned: Set<string>) {
  return item.unlock === 'free' || owned.has(item.id)
}
