export const instant = false

import Footer from '@/components/layout/Footer'
import TopMarquee from '@/components/landing/TopMarquee'
import HomepageHero from '@/components/landing/HomepageHero'
import HomepageTemplates from '@/components/landing/HomepageTemplates'
import PhotoboothSection from '@/components/landing/PhotoboothSection'
import WhatYouCanDo from '@/components/landing/WhatYouCanDo'
import FreshScrapbooks, { type FreshScrapbook } from '@/components/landing/FreshScrapbooks'
import HomepageCTA from '@/components/landing/HomepageCTA'
import HomeDashboard from '@/components/landing/HomeDashboard'
import type { DashScrapbook } from '@/components/landing/DashboardScrapbooks'
import { createClient } from '@/lib/supabase-server'

export default async function Home() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const [
    freshResult,
    promptResult,
    exchangeTotalResult,
    exchangeTodayResult,
  ] = await Promise.all([
    supabase
      .from('scrapbooks')
      .select('id, title, cover_id, profiles!inner(username)')
      .eq('is_public', true)
      .not('profiles.username', 'in', '("testuser","test","demo","admin_test")')
      .order('created_at', { ascending: false })
      .limit(4),
    supabase.from('daily_prompts').select('*').eq('date', today).maybeSingle(),
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

  // Logged-in: fetch user's scrapbooks + latest
  let latestScrapbook: { id: string; title: string; cover_id: string } | null = null
  let userScrapbooks: DashScrapbook[] = []

  if (currentUser && authUser) {
    const { data: sbData } = await supabase
      .from('scrapbooks')
      .select('id, title, cover_id, is_public')
      .eq('user_id', authUser.id)
      .order('updated_at', { ascending: false })
      .limit(50)

    userScrapbooks = (sbData ?? []) as DashScrapbook[]
    if (userScrapbooks.length > 0) {
      const first = userScrapbooks[0]
      latestScrapbook = { id: first.id, title: first.title, cover_id: first.cover_id }
    }
  }

  // Marketing page: fresh public scrapbooks
  type FreshRow = { id: string; title: string; cover_id: string; profiles: { username: string } | { username: string }[] | null }
  const freshScrapbooks = (freshResult.data ?? []).map((sb) => {
    const row = sb as unknown as FreshRow
    return {
      id: row.id,
      title: row.title,
      cover_id: row.cover_id,
      profiles: Array.isArray(row.profiles) ? (row.profiles[0] as { username: string }) : (row.profiles as { username: string } | null),
    }
  }) as FreshScrapbook[]

  return (
    <div className="relative overflow-x-clip">
      <TopMarquee />

      {currentUser ? (
        /* ── Logged-in: dashboard ── */
        <HomeDashboard
          user={currentUser}
          prompt={promptResult.data ?? null}
          latestScrapbook={latestScrapbook}
          scrapbooks={userScrapbooks}
        />
      ) : (
        /* ── Logged-out: marketing homepage ── */
        <>
          <HomepageHero />
          <HomepageTemplates />
          <PhotoboothSection />
          <WhatYouCanDo />
          <FreshScrapbooks scrapbooks={freshScrapbooks} />
          <HomepageCTA />
          <Footer />
        </>
      )}
    </div>
  )
}
