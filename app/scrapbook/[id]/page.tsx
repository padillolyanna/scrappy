import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

export default function ScrapbookViewPage({ params }: PageProps<"/scrapbook/[id]">) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-[#FF4FA3]/10 border-2 border-[#FF4FA3]/30 rounded-xl px-4 py-3 mb-6 flex items-center gap-3">
            <span className="text-xl animate-sparkle text-[#FF4FA3]">✦</span>
            <div>
              <div className="font-pixel text-xs text-[#D4006E]" style={{ fontSize: '10px' }}>
                PREVIEW MODE
              </div>
              <div className="font-nunito text-sm text-[#888]">
                Your scrapbook is live. Share this link with friends.
              </div>
            </div>
            <Link href="/scrapbook/create" className="ml-auto btn-y2k text-xs py-1 px-4" style={{ fontSize: '11px' }}>
              edit ✦
            </Link>
          </div>

          <div className="bg-[#FFF8ED] rounded-2xl border-2 border-[#FFB6D9]/50 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-br from-pink-200 via-pink-100 to-pink-50 p-8 text-center relative">
              <div className="text-7xl font-pixel text-[#3A0030]/20 mb-3">✦</div>
              <h1
                className="font-pacifico text-3xl text-[#3A0030]"
                style={{ fontFamily: 'Pacifico, cursive', fontSize: '32px' }}
              >
                my scrapbook
              </h1>
              <div className="font-caveat text-[#888] mt-1" style={{ fontFamily: 'Caveat, cursive' }}>
                by @you ✦ just now
              </div>
              <div className="absolute top-3 right-3 text-sm animate-sparkle text-[#3A0030]/30">✦</div>
              <div className="absolute bottom-3 left-3 text-sm opacity-50 text-[#3A0030]/20">★ ★ ★</div>
            </div>

            <div className="p-8 space-y-4">
              <div className="font-pixel text-xs text-[#888] text-center mb-4" style={{ fontSize: '10px' }}>
                — PAGE 1 —
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border border-[#FFB6D9]/30">
                <div className="font-pixel text-xs text-[#888] mb-2" style={{ fontSize: '9px' }}>MY NAME IS...</div>
                <div className="font-caveat text-2xl text-[#3A0030]" style={{ fontFamily: 'Caveat, cursive', fontSize: '24px' }}>
                  your name goes here ✦
                </div>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border border-[#FFB6D9]/30">
                <div className="font-pixel text-xs text-[#888] mb-2" style={{ fontSize: '9px' }}>MY CURRENT OBSESSION IS...</div>
                <div className="font-caveat text-2xl text-[#3A0030]" style={{ fontFamily: 'Caveat, cursive', fontSize: '24px' }}>
                  your answer appears here ✦
                </div>
              </div>

              <div className="text-center pt-4">
                <div className="font-pixel text-xs text-[#888]" style={{ fontSize: '9px' }}>✦ made with SCRAPPY ✦</div>
                <Link href="/scrapbook/create" className="mt-3 btn-outline-y2k text-xs inline-block" style={{ fontSize: '11px' }}>
                  make your own scrapbook
                </Link>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mt-6">
            <button className="btn-outline-y2k text-xs py-2 px-5" style={{ fontSize: '11px' }}>♡ like</button>
            <button className="btn-outline-y2k text-xs py-2 px-5" style={{ fontSize: '11px' }}>share link</button>
            <button className="btn-outline-y2k text-xs py-2 px-5" style={{ fontSize: '11px' }}>save</button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
