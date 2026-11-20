export const SHOW_DEMO = process.env.NEXT_PUBLIC_SHOW_DEMO_CONTENT !== 'false'

export interface DemoActivity {
  username: string
  color: string
  text: string
  _isDemo: true
}

export interface DemoOnlineUser {
  username: string
  color: string
  _isDemo: true
}

export interface DemoConfession {
  id: string
  content: string
  category: string
  reaction_count: number
  _isDemo: true
}

export interface DemoScrapbook {
  id: string
  title: string
  cover_id: string
  like_count: number
  view_count: number
  profiles: { username: string } | null
  _isDemo: true
}

export const DEMO_ACTIVITY: DemoActivity[] = [
  { username: 'example_star', color: '#FF4FA3', text: 'just made my first scrapbook! ✦', _isDemo: true },
  { username: 'example_moon', color: '#7C4DDB', text: 'the daily prompt today is so good!!', _isDemo: true },
  { username: 'example_petal', color: '#FF6B00', text: "submitted my answer to today's prompt ♡", _isDemo: true },
  { username: 'example_glow', color: '#6FE3FF', text: 'my confession just got 10 reactions!', _isDemo: true },
  { username: 'example_haze', color: '#28C840', text: 'scrapbook exchange matched me with someone!', _isDemo: true },
]

export const DEMO_ONLINE_USERS: DemoOnlineUser[] = [
  { username: 'example_star', color: '#FFB6D9', _isDemo: true },
  { username: 'example_moon', color: '#C9A2FF', _isDemo: true },
  { username: 'example_petal', color: '#FFF0A8', _isDemo: true },
  { username: 'example_glow', color: '#A8DFFF', _isDemo: true },
  { username: 'example_haze', color: '#B6FFD9', _isDemo: true },
  { username: 'example_nova', color: '#FFD6EC', _isDemo: true },
]

export const DEMO_CONFESSIONS: DemoConfession[] = [
  { id: 'demo-c-1', content: 'I still look for familiar faces in crowded places even when I know they\'re gone.', category: 'LOVE', reaction_count: 12, _isDemo: true },
  { id: 'demo-c-2', content: 'Sometimes I wonder if I\'m doing enough or just pretending everything is okay.', category: 'LIFE', reaction_count: 8, _isDemo: true },
  { id: 'demo-c-3', content: 'I miss the people I used to talk to every single day. I wonder if they think about me.', category: 'FRIENDSHIP', reaction_count: 19, _isDemo: true },
  { id: 'demo-c-4', content: 'The smallest things remind me of memories I didn\'t know I still had.', category: 'RANDOM', reaction_count: 5, _isDemo: true },
  { id: 'demo-c-5', content: 'I wish I could tell someone everything without worrying about being misunderstood.', category: 'SECRETS', reaction_count: 14, _isDemo: true },
  { id: 'demo-c-6', content: 'I don\'t think I ever really stopped caring. I just learned how to stay quiet about it.', category: 'LOVE', reaction_count: 21, _isDemo: true },
  { id: 'demo-c-7', content: 'I hope my old friends are doing well, even if we don\'t talk anymore.', category: 'FRIENDSHIP', reaction_count: 17, _isDemo: true },
  { id: 'demo-c-8', content: 'I just want a version of life where I don\'t have to worry about everything.', category: 'LIFE', reaction_count: 9, _isDemo: true },
]

export const DEMO_SCRAPBOOKS: DemoScrapbook[] = [
  { id: 'demo-sb-1', title: 'Pink Princess Diary', cover_id: 'pink-princess', like_count: 0, view_count: 0, profiles: { username: 'example_star' }, _isDemo: true },
  { id: 'demo-sb-2', title: 'Cyber Dreams', cover_id: 'cyber-y2k', like_count: 0, view_count: 0, profiles: { username: 'example_moon' }, _isDemo: true },
  { id: 'demo-sb-3', title: 'Memories from 2003', cover_id: 'retro-camera', like_count: 0, view_count: 0, profiles: { username: 'example_nova' }, _isDemo: true },
]
