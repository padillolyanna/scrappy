import { TEMPLATES } from '@/lib/types'

/* Scrapbook Exchange: a shared "slam book" notebook passed between two people.
   All database access goes through the RPCs in 20261125000001_exchange_notebooks.sql. */

export type Cover = 'pink' | 'purple' | 'blue' | 'mint' | 'yellow' | 'leopard'
export const COVERS: { id: Cover; label: string }[] = [
  { id: 'pink', label: 'bubblegum' },
  { id: 'purple', label: 'grape soda' },
  { id: 'blue', label: 'sky' },
  { id: 'mint', label: 'mint' },
  { id: 'yellow', label: 'lemonade' },
  { id: 'leopard', label: 'pink leopard' },
]

export const MAX_QUESTIONS = 15
export const MAX_QUESTION_LEN = 160
export const MAX_ANSWER_LEN = 600

export interface NotebookQuestion { id: string; text: string }

export interface NotebookTemplate {
  id: string
  name: string
  blurb: string
  sticker: string // pixel sticker id from the object shelf
  questions: string[]
}

const SLAM_BOOK = [
  'Name, nickname & sign...',
  'Favourite colour?',
  'Favourite song right now?',
  'Celebrity crush?',
  'Best friend(s)?',
  'Most embarrassing moment?',
  'If you could live anywhere...',
  'What do you want to be when you grow up?',
  'Describe me in three words!',
  'Leave a message for me ♡',
]

export const NOTEBOOK_TEMPLATES: NotebookTemplate[] = [
  { id: 'slam-book', name: 'slam book', blurb: 'the classic 2004 slam book', sticker: 'gem-heart', questions: SLAM_BOOK },
  ...TEMPLATES.map((t) => ({
    id: t.id,
    name: t.name.toLowerCase(),
    blurb: t.description.toLowerCase(),
    sticker: ({ 'about-me': 'cute-star', 'getting-to-know-me': 'charm-bow', 'y2k-diary': 'y2k-computer', friendship: 'cute-bunny', 'random-thoughts': 'cute-kitten' } as Record<string, string>)[t.id] ?? 'cute-star',
    questions: [...t.questions].sort((a, b) => a.order - b.order).map((q) => q.question_text),
  })),
  { id: 'custom', name: 'blank notebook', blurb: 'write every question yourself', sticker: 'mat-polaroid', questions: [] },
]

/* extra ideas shown under the question editor */
export const QUESTION_IDEAS = [
  'What is on your phone wallpaper?',
  'Last thing that made you laugh?',
  'Your go-to karaoke song?',
  'Cats or dogs?',
  'Dream holiday?',
  'Your comfort food?',
  'What are you looking forward to?',
  'A secret talent?',
  'Your away message would say...',
  'Top 3 songs on your playlist?',
  'Your zodiac sign & is it accurate?',
  'Something that made you smile today?',
]

export interface ExchangeInfo {
  id: string
  title: string
  cover: Cover
  template_id: string
  questions: NotebookQuestion[]
  creator: { username: string | null; display_name: string | null; avatar_url: string | null } | null
  is_creator: boolean
  is_member: boolean
  i_answered: boolean
  other_answered: boolean
  full: boolean
  expired: boolean
  revealed: boolean
}

export interface RevealPerson {
  is_me: boolean
  username: string | null
  display_name: string | null
  avatar_url: string | null
  answers: Record<string, string>
}

export interface ShelfNotebook {
  token: string
  title: string
  cover: Cover
  n_questions: number
  i_answered: boolean
  other_answered: boolean
  revealed: boolean
  friend: string | null
  created_at: string
}

export const personName = (p: { display_name?: string | null; username?: string | null } | null | undefined) =>
  p?.display_name || p?.username || 'someone'

export function shelfStatus(n: ShelfNotebook): { label: string; tone: 'new' | 'turn' | 'wait' | 'done' } {
  if (n.revealed) return { label: 'revealed! ✦', tone: 'done' }
  if (!n.i_answered) return { label: 'your turn ✎', tone: 'turn' }
  if (!n.friend) return { label: 'not passed on yet', tone: 'new' }
  return { label: `waiting for ${n.friend}`, tone: 'wait' }
}

/* turn a database error into something friendly */
export function rpcMessage(e: { message?: string } | null | undefined) {
  const m = e?.message ?? ''
  if (/function .* does not exist|schema cache/i.test(m)) return 'the exchange needs its database update first (run the exchange_notebooks migration).'
  return m || 'something went wrong, please try again.'
}
