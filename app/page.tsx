export const instant = false

import Footer from '@/components/layout/Footer'
import HomeStatusPanel from '@/components/landing/HomeStatusPanel'
import FeaturedScrapbooks, { type LiveScrapbook } from '@/components/landing/FeaturedScrapbooks'
import DailyPrompt from '@/components/landing/DailyPrompt'
import ConfessionPreview, { type ConfessionItem } from '@/components/landing/ConfessionPreview'
import ScrapbookExchange from '@/components/landing/ScrapbookExchange'
import FinalCTA from '@/components/landing/FinalCTA'
import WhatYouCanDo from '@/components/landing/WhatYouCanDo'
import LegalBar from '@/components/layout/LegalBar'
import SidebarWidgets, { type ActivityItem, type OnlineUser } from '@/components/landing/SidebarWidgets'
import { createClient } from '@/lib/supabase-server'

function LcdMarquee() {
  const text =
    '✦ pink princess ✦ cyber y2k ✦ digital diary ✦ indie sleaze ✦ sweet memories ✦ blue dream ✦ retro camera ✦ glitter explosion ✦ diy aesthetic ✦ nostalgia core ✦ '
  const doubled = text + text

  return (
    <div className="lcd-strip">
      <div style={{ display: 'flex', whiteSpace: 'nowrap', animation: 'marquee 25s linear infinite' }}>
        <span style={{ fontFamily: "'Silkscreen', monospace", fontSize: 12, color: '#00ff41', letterSpacing: '0.06em', display: 'inline-block' }}>
          {doubled}
        </span>
        <span style={{ fontFamily: "'Silkscreen', monospace", fontSize: 12, color: '#00ff41', letterSpacing: '0.06em', display: 'inline-block' }}>
          {doubled}
        </span>
      </div>
    </div>
  )
}

function TopMarquee() {
  const text =
    'SCRAPPY — YOUR LITTLE CORNER OF THE INTERNET ✦ MAKE MEMORIES ✦ DECORATE YOUR PAGES ✦ COLLECT ANSWERS ✦ SHARE YOUR STORY ✦ '
  const doubled = text + text

  return (
    <div style={{ background: '#FF4FA3', overflow: 'hidden', padding: '5px 0', borderBottom: '2px solid #2B0A2E' }}>
      <div style={{ display: 'flex', whiteSpace: 'nowrap', animation: 'marquee 25s linear infinite' }}>
        <span style={{ fontFamily: "'VT323', monospace", fontSize: 16, color: 'white', letterSpacing: '0.06em', display: 'inline-block' }}>
          {doubled}
        </span>
        <span style={{ fontFamily: "'VT323', monospace", fontSize: 16, color: 'white', letterSpacing: '0.06em', display: 'inline-block' }}>
          {doubled}
        </span>
      </div>
    </div>
  )
}

function StickerDecorations() {
  const stickers: Array<{ symbol: string; top: number; left?: number; right?: number; rotate: string; fontSize: number; color: string }> = [
    { symbol: '✦', top: 160, left: -14, rotate: '12deg', fontSize: 20, color: '#FF4FA3' },
    { symbol: '♡', top: 320, right: -12, rotate: '-8deg', fontSize: 18, color: '#C9A2FF' },
    { symbol: '✿', top: 480, left: -10, rotate: '0deg', fontSize: 16, color: '#FFB6D9' },
    { symbol: '★', top: 600, right: -10, rotate: '15deg', fontSize: 20, color: '#FFF0A8' },
    { symbol: '✿', top: 800, left: -12, rotate: '-10deg', fontSize: 18, color: '#6FE3FF' },
    { symbol: '◆', top: 940, right: -8, rotate: '8deg', fontSize: 14, color: '#FF4FA3' },
    { symbol: '◎', top: 1100, left: -10, rotate: '0deg', fontSize: 16, color: '#C9A2FF' },
  ]

  return (
    <>
      {stickers.map((s, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="pointer-events-none select-none absolute hidden md:block"
          style={{ top: s.top, left: s.left, right: s.right, fontSize: s.fontSize, color: s.color, transform: `rotate(${s.rotate})`, zIndex: 10 }}
        >
          {s.symbol}
        </span>
      ))}
    </>
  )
}

export default async function Home() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]
  const fiveMinutesAgo = new Date(new Date().getTime() - 5 * 60 * 1000).toISOString()

  const [
    featuredResult,
    promptResult,
    confessionsResult,
    memberCountResult,
    onlineResult,
    exchangeTotalResult,
    exchangeTodayResult,
    activityResult,
  ] = await Promise.all([
    supabase
      .from('scrapbooks')
      .select('id, title, cover_id, like_count, view_count, profiles!inner(username)')
      .eq('is_public', true)
      .order('like_count', { ascending: false })
      .limit(3),
    supabase.from('daily_prompts').select('*').eq('date', today).maybeSingle(),
    supabase
      .from('confessions')
      .select('id, content, category, reaction_count')
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .limit(8),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id, username').gte('last_seen_at', fiveMinutesAgo).limit(20),
    supabase.from('exchanges').select('id', { count: 'exact', head: true }),
    supabase.from('exchanges').select('id', { count: 'exact', head: true }).gte('created_at', `${today}T00:00:00.000Z`),
    supabase
      .from('prompt_answers')
      .select('user_id, answer_text, is_anonymous, profiles(username)')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  // Fetch answers for today's prompt
  type PromptAnswer = { user_id: string | null; answer_text: string; is_anonymous: boolean; like_count: number; profiles: { username: string } | null }
  let todayAnswers: PromptAnswer[] = []
  if (promptResult.data?.id) {
    const { data } = await supabase
      .from('prompt_answers')
      .select('user_id, answer_text, is_anonymous, like_count, profiles(username)')
      .eq('prompt_id', promptResult.data.id)
      .order('like_count', { ascending: false })
      .limit(5)
    todayAnswers = (data as unknown as PromptAnswer[]) ?? []
  }

  // Current user for logged-in greeting
  const { data: { user: authUser } } = await supabase.auth.getUser()
  let currentUser: { username: string } | null = null
  if (authUser) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', authUser.id)
      .single()
    currentUser = profile ?? null
  }

  // Featured scrapbooks
  type FeaturedRow = { id: string; title: string; cover_id: string; like_count: number; view_count: number; profiles: { username: string } | { username: string }[] | null }
  const featured = (featuredResult.data ?? []).map((sb) => {
    const row = sb as unknown as FeaturedRow
    return {
      id: row.id,
      title: row.title,
      cover_id: row.cover_id,
      like_count: row.like_count,
      view_count: row.view_count,
      profiles: Array.isArray(row.profiles) ? (row.profiles[0] as { username: string }) : (row.profiles as { username: string } | null),
    }
  }) as LiveScrapbook[]

  const scrapbookOfDay = featured[0]
    ? { id: featured[0].id, title: featured[0].title, profiles: featured[0].profiles }
    : null

  const confessions = (confessionsResult.data ?? []) as ConfessionItem[]

  // Activity from recent answers
  type AnswerRow = { user_id: string | null; answer_text: string; is_anonymous: boolean; profiles: { username: string } | null }
  const activity: ActivityItem[] = (activityResult.data ?? []).map((a) => {
    const row = a as unknown as AnswerRow
    const username = row.is_anonymous ? 'anonymous' : (Array.isArray(row.profiles) ? (row.profiles as unknown as { username: string }[])[0]?.username : row.profiles?.username) ?? 'scrappy user'
    const text = row.answer_text.length > 60 ? row.answer_text.slice(0, 60) + '...' : row.answer_text
    return { username, text }
  })

  // Online users
  type OnlineRow = { id: string; username: string }
  const onlineUsers: OnlineUser[] = (onlineResult.data ?? []).map((u) => ({
    username: (u as unknown as OnlineRow).username,
  }))

  const exchangeStats = {
    total: exchangeTotalResult.count ?? 0,
    today: exchangeTodayResult.count ?? 0,
  }

  return (
    <div className="relative overflow-x-clip">
      <StickerDecorations />
      <TopMarquee />
      <HomeStatusPanel scrapbookOfDay={scrapbookOfDay} user={currentUser} />
      <LcdMarquee />

      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,65%)_minmax(0,35%)] gap-4 md:gap-0 px-3 py-4 sm:px-5">
        <div className="flex flex-col gap-0 md:pr-4 min-w-0">
          <FeaturedScrapbooks scrapbooks={featured} />
          <ConfessionPreview confessions={confessions} />
        </div>
        <div>
          <SidebarWidgets
            activity={activity}
            onlineUsers={onlineUsers}
            memberCount={memberCountResult.count ?? 0}
          />
        </div>
      </div>

      <DailyPrompt initialPrompt={promptResult.data ?? null} initialAnswers={todayAnswers} />
      <ScrapbookExchange exchangeStats={exchangeStats} />
      <WhatYouCanDo />
      {!currentUser && <FinalCTA />}
      {currentUser ? <LegalBar /> : <Footer />}
    </div>
  )
}
