export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface User {
  id: string
  email: string
  username: string
  display_name: string
  avatar_url?: string
  bio?: string
  mood?: string
  favorite_color?: string
  profile_theme?: string
  created_at: string
}

export interface ScrapbookCover {
  id: string
  name: string
  description: string
  bg_gradient: string
  accent_color: string
  stickers: string[]
  font_style: string
  preview_symbol: string
}

export interface Scrapbook {
  id: string
  user_id: string
  title: string
  slug: string
  cover_id: string
  cover_photo_url?: string
  is_public: boolean
  view_count: number
  like_count: number
  created_at: string
  updated_at: string
  user?: User
  pages?: ScrapbookPage[]
}

export interface ScrapbookPage {
  id: string
  scrapbook_id: string
  page_number: number
  title?: string
  bg_color: string
  bg_texture?: string
  elements: ScrapbookElement[]
  created_at: string
}

export interface ScrapbookElement {
  id: string
  page_id: string
  type: 'text' | 'image' | 'sticker' | 'question' | 'decoration'
  content: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  font_family?: string
  font_size?: number
  color?: string
  z_index: number
}

export interface Template {
  id: string
  name: string
  category: string
  description: string
  symbol: string
  questions: TemplateQuestion[]
}

export interface TemplateQuestion {
  id: string
  template_id: string
  question_text: string
  placeholder?: string
  order: number
}

export interface Answer {
  id: string
  user_id: string
  question_id: string
  scrapbook_id?: string
  answer_text: string
  is_public: boolean
  created_at: string
}

export interface DailyPrompt {
  id: string
  question_text: string
  date: string
  answer_count: number
}

export interface Confession {
  id: string
  content: string
  category: string
  is_anonymous: boolean
  user_id?: string
  reaction_count: number
  created_at: string
}

export interface Vote {
  id: string
  user_id: string
  scrapbook_id: string
  vote_type: 'like' | 'love' | 'creative' | 'nostalgic'
  created_at: string
}

export const SCRAPBOOK_COVERS: ScrapbookCover[] = [
  {
    id: 'pink-princess',
    name: 'Pink Princess',
    description: 'All things pink and dreamy',
    bg_gradient: 'from-pink-200 via-pink-100 to-pink-50',
    accent_color: '#FF4FA3',
    stickers: ['✦', '★', '♡', '✿', '◆'],
    font_style: 'Pacifico',
    preview_symbol: '✦',
  },
  {
    id: 'cyber-y2k',
    name: 'Cyber Y2K',
    description: 'Chrome, metallic, and futuristic',
    bg_gradient: 'from-purple-900 via-blue-900 to-purple-800',
    accent_color: '#A8DFFF',
    stickers: ['★', '◆', '✸', '⊹', '◎'],
    font_style: 'Press Start 2P',
    preview_symbol: '◆',
  },
  {
    id: 'digital-diary',
    name: 'Digital Diary',
    description: 'Your secret online journal',
    bg_gradient: 'from-yellow-50 via-cream to-pink-50',
    accent_color: '#FF4FA3',
    stickers: ['✦', '♡', '★', '✿', '♪'],
    font_style: 'Caveat',
    preview_symbol: '♡',
  },
  {
    id: 'indie-sleaze',
    name: 'Indie Sleaze',
    description: 'Grungy, raw, and unapologetic',
    bg_gradient: 'from-zinc-900 via-zinc-800 to-purple-900',
    accent_color: '#FFF0A8',
    stickers: ['✸', '◆', '★', '⊹', '●'],
    font_style: 'VT323',
    preview_symbol: '★',
  },
  {
    id: 'sweet-memories',
    name: 'Sweet Memories',
    description: 'Nostalgic and warm',
    bg_gradient: 'from-orange-50 via-yellow-50 to-pink-50',
    accent_color: '#FF9B6A',
    stickers: ['✿', '★', '♡', '✦', '◎'],
    font_style: 'Pacifico',
    preview_symbol: '✿',
  },
  {
    id: 'blue-dream',
    name: 'Blue Dream',
    description: 'Soft, calm, and ethereal',
    bg_gradient: 'from-blue-100 via-purple-50 to-blue-50',
    accent_color: '#6B9FFF',
    stickers: ['⊹', '✸', '★', '◆', '♡'],
    font_style: 'Caveat',
    preview_symbol: '⊹',
  },
  {
    id: 'retro-camera',
    name: 'Retro Camera',
    description: 'Film grain and photo booth vibes',
    bg_gradient: 'from-amber-100 via-yellow-50 to-orange-50',
    accent_color: '#8B4513',
    stickers: ['◎', '★', '✦', '◆', '✿'],
    font_style: 'Nunito',
    preview_symbol: '◎',
  },
  {
    id: 'glitter-explosion',
    name: 'Glitter Explosion',
    description: 'Maximum sparkle energy',
    bg_gradient: 'from-fuchsia-200 via-pink-200 to-purple-200',
    accent_color: '#FF4FA3',
    stickers: ['✦', '★', '✸', '⊹', '◆'],
    font_style: 'Pacifico',
    preview_symbol: '✸',
  },
]

export const TEMPLATES: Template[] = [
  {
    id: 'about-me',
    name: 'ABOUT ME',
    category: 'personal',
    description: 'Tell the world who you are',
    symbol: '★',
    questions: [
      { id: 'am1', template_id: 'about-me', question_text: 'My name is...', placeholder: 'introduce yourself!', order: 1 },
      { id: 'am2', template_id: 'about-me', question_text: 'My nickname is...', placeholder: 'what do your friends call you?', order: 2 },
      { id: 'am3', template_id: 'about-me', question_text: 'My birthday is...', placeholder: 'month/day/year', order: 3 },
      { id: 'am4', template_id: 'about-me', question_text: 'Three words that describe me...', placeholder: 'quirky, creative, loud...', order: 4 },
      { id: 'am5', template_id: 'about-me', question_text: 'My current obsession is...', placeholder: 'what can\'t you stop thinking about?', order: 5 },
      { id: 'am6', template_id: 'about-me', question_text: 'My favorite song right now...', placeholder: 'on repeat 24/7', order: 6 },
      { id: 'am7', template_id: 'about-me', question_text: 'My comfort movie is...', placeholder: 'watched it 100 times and counting', order: 7 },
      { id: 'am8', template_id: 'about-me', question_text: 'Things that make me happy...', placeholder: 'list your little joys', order: 8 },
    ],
  },
  {
    id: 'getting-to-know-me',
    name: 'GETTING TO KNOW ME',
    category: 'personal',
    description: 'Go deeper and get personal',
    symbol: '◆',
    questions: [
      { id: 'gtk1', template_id: 'getting-to-know-me', question_text: 'A random fact about me...', placeholder: 'something unexpected!', order: 1 },
      { id: 'gtk2', template_id: 'getting-to-know-me', question_text: 'My biggest dream is...', placeholder: 'dream big!', order: 2 },
      { id: 'gtk3', template_id: 'getting-to-know-me', question_text: 'Something people don\'t know about me...', placeholder: 'spill the tea', order: 3 },
      { id: 'gtk4', template_id: 'getting-to-know-me', question_text: 'My favorite childhood memory...', placeholder: 'take me back', order: 4 },
      { id: 'gtk5', template_id: 'getting-to-know-me', question_text: 'My biggest pet peeve is...', placeholder: 'ugh...', order: 5 },
      { id: 'gtk6', template_id: 'getting-to-know-me', question_text: 'My ideal day looks like...', placeholder: 'describe your perfect day', order: 6 },
      { id: 'gtk7', template_id: 'getting-to-know-me', question_text: 'Something I want to experience...', placeholder: 'bucket list item', order: 7 },
    ],
  },
  {
    id: 'y2k-diary',
    name: 'MY 2000s DIARY',
    category: 'nostalgia',
    description: 'Relive your childhood memories',
    symbol: '✸',
    questions: [
      { id: 'y2k1', template_id: 'y2k-diary', question_text: 'My favorite childhood cartoon...', placeholder: 'saturday mornings!', order: 1 },
      { id: 'y2k2', template_id: 'y2k-diary', question_text: 'My first celebrity crush...', placeholder: 'don\'t be shy!', order: 2 },
      { id: 'y2k3', template_id: 'y2k-diary', question_text: 'My favorite childhood game...', placeholder: 'outside or online?', order: 3 },
      { id: 'y2k4', template_id: 'y2k-diary', question_text: 'My favorite childhood song...', placeholder: 'the banger of your era', order: 4 },
      { id: 'y2k5', template_id: 'y2k-diary', question_text: 'My most embarrassing memory...', placeholder: 'we all have one', order: 5 },
      { id: 'y2k6', template_id: 'y2k-diary', question_text: 'What I wanted to be when I grew up...', placeholder: 'childhood dreams', order: 6 },
    ],
  },
  {
    id: 'friendship',
    name: 'FRIENDSHIP SCRAPBOOK',
    category: 'social',
    description: 'Celebrate your best friend',
    symbol: '♡',
    questions: [
      { id: 'fr1', template_id: 'friendship', question_text: 'How we met...', placeholder: 'the origin story', order: 1 },
      { id: 'fr2', template_id: 'friendship', question_text: 'Our funniest memory...', placeholder: 'the one that always makes you laugh', order: 2 },
      { id: 'fr3', template_id: 'friendship', question_text: 'A song that reminds me of you...', placeholder: 'your friendship anthem', order: 3 },
      { id: 'fr4', template_id: 'friendship', question_text: 'Three words to describe our friendship...', placeholder: 'chaotic, genuine, forever', order: 4 },
      { id: 'fr5', template_id: 'friendship', question_text: 'Something I appreciate about you...', placeholder: 'make them feel special', order: 5 },
      { id: 'fr6', template_id: 'friendship', question_text: 'A memory I will never forget...', placeholder: 'forever in your heart', order: 6 },
    ],
  },
  {
    id: 'random-thoughts',
    name: 'RANDOM THOUGHTS',
    category: 'thoughts',
    description: 'Dump your brain here',
    symbol: '⊹',
    questions: [
      { id: 'rt1', template_id: 'random-thoughts', question_text: 'Something I\'ve always wanted to say...', placeholder: 'say it here, safely', order: 1 },
      { id: 'rt2', template_id: 'random-thoughts', question_text: 'A thought I can\'t get out of my head...', placeholder: 'rent free in your mind', order: 2 },
      { id: 'rt3', template_id: 'random-thoughts', question_text: 'My current life motto...', placeholder: 'words to live by', order: 3 },
      { id: 'rt4', template_id: 'random-thoughts', question_text: 'Something I wish people understood...', placeholder: 'your truth', order: 4 },
    ],
  },
]
