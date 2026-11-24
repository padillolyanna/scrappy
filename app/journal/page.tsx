import type { Metadata } from 'next'
import Link from 'next/link'
import Footer from '@/components/layout/Footer'
import { JOURNAL_ARTICLES, JOURNAL_CATEGORIES } from '@/lib/journal'

export const metadata: Metadata = {
  title: 'Journal — Scrappy',
  description: 'Scrapbook ideas, Y2K inspiration, creative guides and tips for making digital scrapbooks, using the photobooth, and getting the most out of Scrappy.',
  openGraph: {
    title: 'Journal — Scrappy',
    description: 'Scrapbook ideas, Y2K inspiration, creative guides and tips.',
    type: 'website',
  },
}

const CATEGORY_COLORS: Record<string, string> = {
  'scrapbook-ideas': '#FF4FA3',
  'y2k-inspiration': '#7C4DDB',
  'creative-guides': '#1D9BF0',
  'scrappy-guides': '#14B8A6',
}

export default function JournalPage() {
  const featured = JOURNAL_ARTICLES[0]
  const rest = JOURNAL_ARTICLES.slice(1)

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 px-4 sm:px-6 py-8 sm:py-10">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <nav aria-label="breadcrumb" className="font-nunito text-sm text-[#888] mb-4">
            <Link href="/" className="hover:text-[#FF4FA3]">home</Link> <span aria-hidden>›</span> <span>journal</span>
          </nav>
          <div className="font-pixel text-[#FF4FA3] tracking-widest mb-1" style={{ fontSize: '12px' }}>SCRAPPY JOURNAL</div>
          <h1 className="font-pacifico text-4xl sm:text-5xl text-[#3A0030] mb-3 leading-tight">The Journal</h1>
          <p className="font-nunito text-lg text-[#5A3A50] leading-relaxed mb-8">
            Scrapbook ideas, Y2K aesthetics, creative guides and tips for making digital scrapbooks that actually matter.
          </p>

          {/* Featured article */}
          <Link
            href={`/journal/${featured.slug}`}
            className="block mb-8 rounded-2xl border-2 border-[#2B0A2E] overflow-hidden hover:-translate-y-1 transition-transform no-underline"
            style={{ boxShadow: '4px 5px 0 rgba(43,10,46,.18)' }}
          >
            <div
              className="h-40 flex items-end p-5"
              style={{ background: `linear-gradient(135deg, ${featured.coverColor}22, ${featured.coverColor}66)` }}
            >
              <div>
                <span
                  className="font-pixel text-white px-2 py-1 rounded-full text-[10px] inline-block mb-2"
                  style={{ background: featured.coverColor }}
                >
                  {featured.categoryLabel.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="bg-white p-5">
              <h2 className="font-nunito font-extrabold text-xl text-[#3A0030] leading-snug mb-2">
                {featured.title}
              </h2>
              <p className="font-nunito text-[15px] text-[#5A3A50] leading-relaxed mb-3">
                {featured.description}
              </p>
              <div className="font-nunito text-sm text-[#888]">
                {featured.publishedAt} &middot; {featured.readingTime} read
              </div>
            </div>
          </Link>

          {/* Article grid */}
          <div className="grid sm:grid-cols-2 gap-5 mb-10">
            {rest.map((article) => {
              const color = CATEGORY_COLORS[article.category] ?? '#FF4FA3'
              return (
                <Link
                  key={article.slug}
                  href={`/journal/${article.slug}`}
                  className="block rounded-2xl border-2 border-[#2B0A2E] overflow-hidden hover:-translate-y-0.5 transition-transform no-underline bg-white"
                  style={{ boxShadow: '3px 4px 0 rgba(43,10,46,.15)' }}
                >
                  <div
                    className="h-24 flex items-end p-4"
                    style={{ background: `linear-gradient(135deg, ${color}18, ${color}44)` }}
                  >
                    <span
                      className="font-pixel text-white px-2 py-0.5 rounded-full text-[10px]"
                      style={{ background: color }}
                    >
                      {article.categoryLabel.toUpperCase()}
                    </span>
                  </div>
                  <div className="p-4">
                    <h2 className="font-nunito font-extrabold text-base text-[#3A0030] leading-snug mb-2">
                      {article.title}
                    </h2>
                    <p className="font-nunito text-sm text-[#5A3A50] leading-relaxed mb-2 line-clamp-2">
                      {article.description}
                    </p>
                    <div className="font-nunito text-xs text-[#888]">
                      {article.publishedAt} &middot; {article.readingTime} read
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Category index */}
          <div className="bg-white rounded-2xl border-2 border-[#2B0A2E] p-5" style={{ boxShadow: '3px 4px 0 rgba(43,10,46,.12)' }}>
            <div className="font-pixel text-[#FF4FA3] tracking-widest mb-3" style={{ fontSize: '11px' }}>TOPICS</div>
            <div className="grid sm:grid-cols-2 gap-2">
              {Object.entries(JOURNAL_CATEGORIES).map(([key, label]) => {
                const color = CATEGORY_COLORS[key] ?? '#FF4FA3'
                const count = JOURNAL_ARTICLES.filter((a) => a.category === key).length
                return (
                  <div
                    key={key}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 font-nunito text-sm font-semibold"
                    style={{ background: `${color}18`, color }}
                  >
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                    {label}
                    <span className="ml-auto text-xs opacity-60">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
