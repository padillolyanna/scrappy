import Footer from '@/components/layout/Footer'
import FeaturedScrapbooks from '@/components/landing/FeaturedScrapbooks'

export default function HighlightsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 py-10">
        <div className="text-center mb-2 px-4">
          <div className="font-pixel text-xs text-[#FF4FA3] mb-2 tracking-widest" style={{ fontSize: '11px' }}>
            ✦ SCRAPPY HIGHLIGHTS ✦
          </div>
          <h1 className="font-pacifico text-5xl text-[#3A0030]" style={{ fontFamily: 'Pacifico, cursive', fontSize: 'clamp(28px, 6vw, 48px)' }}>
            community showcase
          </h1>
        </div>
        <FeaturedScrapbooks />
      </main>
      <Footer />
    </div>
  )
}
