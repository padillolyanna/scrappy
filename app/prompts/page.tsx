import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import DailyPrompt from '@/components/landing/DailyPrompt'

export default function PromptsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 py-10 px-4">
        <div className="text-center mb-8">
          <div className="font-pixel text-xs text-[#FF4FA3] mb-2 tracking-widest" style={{ fontSize: '11px' }}>
            ✦ COMMUNITY PROMPTS ✦
          </div>
          <h1 className="font-pacifico text-5xl text-[#3A0030]" style={{ fontFamily: 'Pacifico, cursive', fontSize: 'clamp(28px, 6vw, 48px)' }}>
            daily question
          </h1>
        </div>
        <DailyPrompt />
      </main>
      <Footer />
    </div>
  )
}
