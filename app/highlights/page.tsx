export const instant = false

import Footer from '@/components/layout/Footer'
import FeaturedScrapbooks, { type LiveScrapbook } from '@/components/landing/FeaturedScrapbooks'
import { createClient } from '@/lib/supabase-server'

export default async function HighlightsPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('scrapbooks')
    .select('id, title, cover_id, like_count, view_count, profiles!inner(username)')
    .eq('is_public', true)
    .order('like_count', { ascending: false })
    .limit(9)

  const scrapbooks = (data ?? []).map((sb) => ({
    ...sb,
    profiles: Array.isArray(sb.profiles) ? sb.profiles[0] : sb.profiles,
  })) as LiveScrapbook[]

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 py-10">
        <div className="text-center mb-2 px-4">
          <div className="font-pixel text-xs text-[#FF4FA3] mb-2 tracking-widest" style={{ fontSize: '12px' }}>
            ✦ SCRAPPY HIGHLIGHTS ✦
          </div>
          <h1 className="font-pacifico text-5xl text-[#3A0030]" style={{ fontFamily: 'Pacifico, cursive', fontSize: 'clamp(28px, 6vw, 48px)' }}>
            community showcase
          </h1>
          <p className="font-caveat text-xl text-[#888] mt-2" style={{ fontFamily: 'Caveat, cursive' }}>
            the most loved scrapbooks on scrappy ✦
          </p>
        </div>
        <FeaturedScrapbooks scrapbooks={scrapbooks} />
      </main>
      <Footer />
    </div>
  )
}
