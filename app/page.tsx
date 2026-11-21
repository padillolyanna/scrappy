export const instant = false

import Footer from '@/components/layout/Footer'
import LegalBar from '@/components/layout/LegalBar'
import TopMarquee from '@/components/landing/TopMarquee'
import HomepageHero from '@/components/landing/HomepageHero'
import HomepageMakeCards from '@/components/landing/HomepageMakeCards'
import TodayOnScrappy from '@/components/landing/TodayOnScrappy'
import HomepageJoinFAQ from '@/components/landing/HomepageJoinFAQ'
import HomeDashboard from '@/components/landing/HomeDashboard'
import FeaturedScrapbooks, { type LiveScrapbook } from '@/components/landing/FeaturedScrapbooks'
import { createClient } from '@/lib/supabase-server'

export default async function Home() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const [
    featuredResult,
    promptResult,
    confessionsResult,
    totalScrapbooksResult,
    exchangeTotalResult,
    exchangeTodayResult,
  ] = await Promise.all([
    supabase
      .from('scrapbooks')
      .select('id, title, cover_id, like_count, view_count, profiles!inner(username)')
      .eq('is_public', true)
      .not('profiles.username', 'in', '("testuser","test","demo","admin_test")')
      .order('like_count', { ascending: false })
      .limit(6),
    supabase.from('daily_prompts').select('*').eq('date', today).maybeSingle(),
    supabase
      .from('confessions')
      .select('id, content, category')
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .limit(3),
    supabase.from('scrapbooks').select('id', { count: 'exact', head: true }).eq('is_public', true),
    supabase.from('exchanges').select('id', { count: 'exact', head: true }),
    supabase.from('exchanges').select('id', { count: 'exact', head: true }).gte('created_at', `${today}T00:00:00.000Z`),
  ])

  // Current user
  const { data: { user: authUser } } = await supabase.auth.getUser()
  let currentUser: { username: string; id: string } | null = null
  if (authUser) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', authUser.id)
      .single()
    currentUser = profile ? { username: profile.username, id: authUser.id } : null
  }

  // For dashboard: user's most recently edited scrapbook
  let latestScrapbook: { id: string; title: string } | null = null
  if (currentUser) {
    const { data } = await supabase
      .from('scrapbooks')
      .select('id, title')
      .eq('user_id', authUser!.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    latestScrapbook = data ?? null
  }

  // Shape featured scrapbooks
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

  const totalPublicScrapbooks = totalScrapbooksResult.count ?? 0

  const confessions = (confessionsResult.data ?? []) as Array<{ id: string; content: string; category: string }>

  const exchangeStats = {
    total: exchangeTotalResult.count ?? 0,
    today: exchangeTodayResult.count ?? 0,
  }

  // Show real showcase only if 6+ public scrapbooks exist; otherwise FeaturedScrapbooks falls back to demo
  const showcaseScrapbooks = totalPublicScrapbooks >= 6 ? featured.slice(0, 3) : []

  return (
    <div className="relative overflow-x-clip">
      <TopMarquee />

      {currentUser ? (
        /* ── Logged-in: dashboard ── */
        <>
          <HomeDashboard
            user={currentUser}
            prompt={promptResult.data ?? null}
            confessions={confessions}
            exchangeStats={exchangeStats}
            latestScrapbook={latestScrapbook}
          />
          <LegalBar />
        </>
      ) : (
        /* ── Logged-out: marketing homepage ── */
        <>
          <HomepageHero />
          <HomepageMakeCards />
          <TodayOnScrappy
            prompt={promptResult.data ?? null}
            confessions={confessions}
            exchangeStats={exchangeStats}
          />

          {/* Showcase — always visible; FeaturedScrapbooks handles demo fallback */}
          <section style={{ padding: '0 20px clamp(40px, 6vw, 64px)', maxWidth: 1120, margin: '0 auto' }}>
            <div className="text-center mb-2">
              <div className="font-pixel text-[#FF4FA3] tracking-widest" style={{ fontSize: '12px' }} aria-hidden="true">SHOWCASE</div>
              <h2 className="font-pacifico text-3xl sm:text-4xl text-[#3A0030] mt-1">
                scrapbooks <span aria-hidden="true">✦</span>
              </h2>
            </div>
            <FeaturedScrapbooks scrapbooks={showcaseScrapbooks} />
          </section>

          <HomepageJoinFAQ />
          <Footer />
        </>
      )}
    </div>
  )
}
