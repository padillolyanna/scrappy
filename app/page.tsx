export const instant = false

import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import FloatingElements from '@/components/ui/FloatingElements'
import Marquee from '@/components/ui/Marquee'
import Hero from '@/components/landing/Hero'
import FeaturedScrapbooks, { type LiveScrapbook } from '@/components/landing/FeaturedScrapbooks'
import DailyPrompt from '@/components/landing/DailyPrompt'
import ScrappyHighlights from '@/components/landing/ScrappyHighlights'
import ConfessionPreview from '@/components/landing/ConfessionPreview'
import ScrapbookExchange from '@/components/landing/ScrapbookExchange'
import FinalCTA from '@/components/landing/FinalCTA'
import { createClient } from '@/lib/supabase-server'

export default async function Home() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('scrapbooks')
    .select('id, title, cover_id, like_count, view_count, profiles!inner(username)')
    .eq('is_public', true)
    .order('like_count', { ascending: false })
    .limit(3)

  const scrapbooks = (data ?? []).map((sb) => ({
    ...sb,
    profiles: Array.isArray(sb.profiles) ? sb.profiles[0] : sb.profiles,
  })) as LiveScrapbook[]

  return (
    <div className="flex flex-col min-h-screen relative overflow-x-hidden">
      <FloatingElements count={12} />
      <Navbar />
      <Marquee text="SCRAPPY — YOUR LITTLE CORNER OF THE INTERNET ✦ MAKE MEMORIES ✦ DECORATE YOUR PAGES ✦ COLLECT ANSWERS ✦ SHARE YOUR STORY ✦ " />
      <main className="flex-1">
        <Hero />
        <Marquee
          bg="bg-[#C9B6FF]"
          text="✦ pink princess ✦ cyber y2k ✦ digital diary ✦ indie sleaze ✦ sweet memories ✦ blue dream ✦ retro camera ✦ glitter explosion ✦ "
        />
        <FeaturedScrapbooks scrapbooks={scrapbooks} />
        <DailyPrompt />
        <ScrappyHighlights />
        <ConfessionPreview />
        <ScrapbookExchange />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  )
}
