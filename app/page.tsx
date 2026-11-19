import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import FloatingElements from '@/components/ui/FloatingElements'
import Marquee from '@/components/ui/Marquee'
import Hero from '@/components/landing/Hero'
import FeaturedScrapbooks from '@/components/landing/FeaturedScrapbooks'
import DailyPrompt from '@/components/landing/DailyPrompt'
import ConfessionPreview from '@/components/landing/ConfessionPreview'
import HowItWorks from '@/components/landing/HowItWorks'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen relative">
      <FloatingElements count={12} />
      <Navbar />
      <Marquee />
      <main className="flex-1">
        <Hero />
        <Marquee
          bg="bg-[#C9B6FF]"
          text="✦ pink princess ✦ cyber y2k ✦ digital diary ✦ indie sleaze ✦ sweet memories ✦ blue dream ✦ retro camera ✦ glitter explosion ✦ "
        />
        <FeaturedScrapbooks />
        <DailyPrompt />
        <HowItWorks />
        <ConfessionPreview />
      </main>
      <Footer />
    </div>
  )
}
