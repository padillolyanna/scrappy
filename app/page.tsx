export const instant = false

import Footer from '@/components/layout/Footer'
import HomeStatusPanel from '@/components/landing/HomeStatusPanel'
import FeaturedScrapbooks from '@/components/landing/FeaturedScrapbooks'
import DailyPrompt from '@/components/landing/DailyPrompt'
import ConfessionPreview from '@/components/landing/ConfessionPreview'
import ScrapbookExchange from '@/components/landing/ScrapbookExchange'
import FinalCTA from '@/components/landing/FinalCTA'
import SidebarWidgets from '@/components/landing/SidebarWidgets'
import { createClient } from '@/lib/supabase-server'

// LCD marquee strip (aesthetic tags)
function LcdMarquee() {
  const text =
    '✦ pink princess ✦ cyber y2k ✦ digital diary ✦ indie sleaze ✦ sweet memories ✦ blue dream ✦ retro camera ✦ glitter explosion ✦ diy aesthetic ✦ nostalgia core ✦ '
  const doubled = text + text

  return (
    <div className="lcd-strip">
      <div
        style={{
          display: 'flex',
          whiteSpace: 'nowrap',
          animation: 'marquee 25s linear infinite',
        }}
      >
        <span
          style={{
            fontFamily: "'Silkscreen', monospace",
            fontSize: 11,
            color: '#00ff41',
            letterSpacing: '0.06em',
            display: 'inline-block',
          }}
        >
          {doubled}
        </span>
        <span
          style={{
            fontFamily: "'Silkscreen', monospace",
            fontSize: 11,
            color: '#00ff41',
            letterSpacing: '0.06em',
            display: 'inline-block',
          }}
        >
          {doubled}
        </span>
      </div>
    </div>
  )
}

// Top marquee (original)
function TopMarquee() {
  const text =
    'SCRAPPY — YOUR LITTLE CORNER OF THE INTERNET ✦ MAKE MEMORIES ✦ DECORATE YOUR PAGES ✦ COLLECT ANSWERS ✦ SHARE YOUR STORY ✦ '
  const doubled = text + text

  return (
    <div
      style={{
        background: '#FF4FA3',
        overflow: 'hidden',
        padding: '5px 0',
        borderBottom: '2px solid #2B0A2E',
      }}
    >
      <div
        style={{ display: 'flex', whiteSpace: 'nowrap', animation: 'marquee 25s linear infinite' }}
      >
        <span
          style={{
            fontFamily: "'VT323', monospace",
            fontSize: 16,
            color: 'white',
            letterSpacing: '0.06em',
            display: 'inline-block',
          }}
        >
          {doubled}
        </span>
        <span
          style={{
            fontFamily: "'VT323', monospace",
            fontSize: 16,
            color: 'white',
            letterSpacing: '0.06em',
            display: 'inline-block',
          }}
        >
          {doubled}
        </span>
      </div>
    </div>
  )
}

// Sticker decorations
function StickerDecorations() {
  const stickers = [
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
          className="pointer-events-none select-none absolute"
          style={{
            top: s.top,
            left: (s as { left?: number }).left,
            right: (s as { right?: number }).right,
            fontSize: s.fontSize,
            color: s.color,
            transform: `rotate(${s.rotate})`,
            zIndex: 10,
          }}
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

  const [
    { data: featuredScrapbooks },
    { data: todayPrompt },
    { data: promptAnswers },
  ] = await Promise.all([
    supabase
      .from('scrapbooks')
      .select('id, title, cover_id, like_count, created_at, user_id, profiles!inner(username)')
      .eq('is_public', true)
      .order('like_count', { ascending: false })
      .limit(3),
    supabase.from('daily_prompts').select('*').eq('date', today).single(),
    supabase
      .from('prompt_answers')
      .select('user_id, answer_text, is_anonymous, like_count, profiles(username)')
      .eq('prompt_id', '')  // placeholder — will be replaced with actual id below
      .limit(0),
  ])

  // Fetch answers for today's prompt if we have one
  let todayAnswers: { user_id: string | null; answer_text: string; is_anonymous: boolean; like_count: number; profiles: { username: string } | null }[] = []
  if (todayPrompt?.id) {
    const { data } = await supabase
      .from('prompt_answers')
      .select('user_id, answer_text, is_anonymous, like_count, profiles(username)')
      .eq('prompt_id', todayPrompt.id)
      .order('like_count', { ascending: false })
      .limit(5)
    todayAnswers = (data as unknown as typeof todayAnswers) ?? []
  }

  // Map featured scrapbooks to expected shape
  const featured = (featuredScrapbooks ?? []).map((sb) => ({
    ...sb,
    profiles: Array.isArray(sb.profiles) ? (sb.profiles[0] as { username: string }) : (sb.profiles as { username: string } | null),
  }))

  return (
    <div className="relative">
      <StickerDecorations />

      {/* Top hot-pink marquee */}
      <TopMarquee />

      {/* Status panel: AIM-style + polaroid collage */}
      <HomeStatusPanel />

      {/* LCD aesthetic tags strip */}
      <LcdMarquee />

      {/* Two-column layout */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: '65% 35%',
          gap: 0,
          padding: '16px 20px',
        }}
      >
        {/* Left/main column */}
        <div className="flex flex-col gap-0 pr-4">
          {/* Featured scrapbooks */}
          <div style={{ marginBottom: 0 }}>
            <FeaturedScrapbooks scrapbooks={featured} />
          </div>

          {/* Confession wall */}
          <div>
            <ConfessionPreview />
          </div>
        </div>

        {/* Right sidebar */}
        <div>
          <SidebarWidgets />
        </div>
      </div>

      {/* Below two-column: daily prompt, exchange, final CTA */}
      <DailyPrompt initialPrompt={todayPrompt ?? null} initialAnswers={todayAnswers} />
      <ScrapbookExchange />
      <FinalCTA />

      <Footer />
    </div>
  )
}
