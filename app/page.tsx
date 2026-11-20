import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import FloatingElements from '@/components/ui/FloatingElements'
import Marquee from '@/components/ui/Marquee'
import Hero from '@/components/landing/Hero'
import FeaturedScrapbooks from '@/components/landing/FeaturedScrapbooks'
import DailyPrompt from '@/components/landing/DailyPrompt'
import ScrappyHighlights from '@/components/landing/ScrappyHighlights'
import ConfessionPreview from '@/components/landing/ConfessionPreview'
import ScrapbookExchange from '@/components/landing/ScrapbookExchange'
import FinalCTA from '@/components/landing/FinalCTA'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen relative overflow-x-hidden">
      <FloatingElements count={12} />
      <Navbar />
      <Marquee text="SCRAPPY — YOUR LITTLE CORNER OF THE INTERNET ✦ MAKE MEMORIES ✦ DECORATE YOUR PAGES ✦ COLLECT ANSWERS ✦ SHARE YOUR STORY ✦ VISITORS: 48,291 ✦ " />
      <main className="flex-1">
        <Hero />
        <Marquee
          bg="bg-[#C9B6FF]"
          text="✦ pink princess ✦ cyber y2k ✦ digital diary ✦ indie sleaze ✦ sweet memories ✦ blue dream ✦ retro camera ✦ glitter explosion ✦ "
        />
        <FeaturedScrapbooks />
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
