export const instant = false

import Footer from '@/components/layout/Footer'
import TopMarquee from '@/components/landing/TopMarquee'
import HomepageHero from '@/components/landing/HomepageHero'
import PhotoboothSection from '@/components/landing/PhotoboothSection'
import WhatYouCanDo from '@/components/landing/WhatYouCanDo'
import FreshScrapbooks, { type FreshScrapbook } from '@/components/landing/FreshScrapbooks'
import HomepageCTA from '@/components/landing/HomepageCTA'
import HomeDashboard from '@/components/landing/HomeDashboard'
import type { DashScrapbook } from '@/components/landing/DashboardScrapbooks'
import { createClient } from '@/lib/supabase-server'
import { sanitizeStyle, sanitizeExtras } from '@/lib/profileStyle'
import type { ProfileData } from '@/components/profile/ProfileLayout'

export default async function Home() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const [
    freshResult,
    promptResult,
  ] = await Promise.all([
    supabase
      .from('scrapbooks')
      .select('id, title, cover_id, profiles!inner(username)')
      .eq('is_public', true)
      .not('profiles.username', 'in', '("testuser","test","demo","admin_test")')
      .order('created_at', { ascending: false })
      .limit(4),
    supabase.from('daily_prompts').select('*').eq('date', today).maybeSingle(),
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

  // Logged-in: fetch user's scrapbooks + profile data
  let latestScrapbook: { id: string; title: string; cover_id: string } | null = null
  let userScrapbooks: DashScrapbook[] = []
  let profileData: ProfileData | null = null
  let profileStyle = null
  let profileExtras = null
  let profilePublicScrapbooks: { id: string; title: string | null; cover_id: string; like_count: number | null }[] = []
  let hasAnsweredToday = false
  let favoritesCount = 0
  let confessionsCount = 0

  if (currentUser && authUser) {
    const [sbRes, fullProfileRes, promptAnswerRes, favRes, confRes] = await Promise.all([
      supabase
        .from('scrapbooks')
        .select('id, title, cover_id, is_public')
        .eq('user_id', authUser.id)
        .order('updated_at', { ascending: false })
        .limit(50),
      supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single(),
      promptResult.data
        ? supabase
            .from('prompt_answers')
            .select('id')
            .eq('user_id', authUser.id)
            .eq('prompt_id', promptResult.data.id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      supabase.from('favorites').select('scrapbook_id', { count: 'exact', head: true }).eq('user_id', authUser.id),
      supabase.from('confessions').select('id', { count: 'exact', head: true }).eq('user_id', authUser.id),
    ])

    userScrapbooks = (sbRes.data ?? []) as DashScrapbook[]
    if (userScrapbooks.length > 0) {
      const first = userScrapbooks[0]
      latestScrapbook = { id: first.id, title: first.title, cover_id: first.cover_id }
    }

    if (fullProfileRes.data) {
      profileData = fullProfileRes.data as ProfileData
      profileStyle = sanitizeStyle(fullProfileRes.data.profile_style)
      profileExtras = sanitizeExtras(fullProfileRes.data.profile_extras)
    }

    hasAnsweredToday = !!promptAnswerRes.data
    favoritesCount = favRes.count ?? 0
    confessionsCount = confRes.count ?? 0

    // Public scrapbooks for profile preview
    const { data: pubSbs } = await supabase
      .from('scrapbooks')
      .select('id, title, cover_id, like_count')
      .eq('user_id', authUser.id)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(6)
    profilePublicScrapbooks = pubSbs ?? []
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
      {currentUser ? (
        /* ── Logged-in: dashboard ── */
        <HomeDashboard
          user={currentUser}
          prompt={promptResult.data ?? null}
          hasAnsweredToday={hasAnsweredToday}
          latestScrapbook={latestScrapbook}
          scrapbooks={userScrapbooks}
          favoritesCount={favoritesCount}
          confessionsCount={confessionsCount}
          profileData={profileData}
          profileStyle={profileStyle}
          profileExtras={profileExtras}
          profilePublicScrapbooks={profilePublicScrapbooks}
        />
      ) : (
        /* ── Logged-out: marketing homepage ── */
        <>
          <HomepageHero />
          <TopMarquee />
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
