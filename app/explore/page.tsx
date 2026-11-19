import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

export default function ExplorePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="text-center max-w-md">
          <div className="text-7xl font-pixel text-[#FFB6D9] mb-4">◎</div>
          <h1 className="font-pacifico text-4xl text-[#3A0030] mb-3" style={{ fontFamily: 'Pacifico, cursive' }}>
            explore scrappy
          </h1>
          <p className="font-caveat text-xl text-[#888] mb-6" style={{ fontFamily: 'Caveat, cursive' }}>
            discover scrapbooks from the community — coming soon! ✦
          </p>
          <div className="font-pixel text-xs text-[#FFB6D9] mb-6" style={{ fontSize: '10px' }}>
            PHASE 2 FEATURE — IN DEVELOPMENT
          </div>
          <Link href="/scrapbook/create" className="btn-y2k">
            create your own scrapbook
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
