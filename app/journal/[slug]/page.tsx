import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Footer from '@/components/layout/Footer'
import { JOURNAL_ARTICLES, getArticle, JOURNAL_CATEGORIES } from '@/lib/journal'
import { SITE_URL } from '@/lib/site'

export async function generateStaticParams() {
  return JOURNAL_ARTICLES.map((article) => ({ slug: article.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const article = getArticle(slug)
  if (!article) return { title: 'Not found' }
  return {
    title: `${article.title} — Scrappy Journal`,
    description: article.description,
    openGraph: {
      title: `${article.title} — Scrappy Journal`,
      description: article.description,
      type: 'article',
      publishedTime: new Date(article.publishedAt).toISOString(),
      siteName: 'Scrappy',
    },
    alternates: {
      canonical: `${SITE_URL}/journal/${article.slug}`,
    },
  }
}

function renderBody(body: string) {
  const lines = body.split('\n')
  const elements: React.ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="font-nunito font-extrabold text-xl text-[#3A0030] mt-7 mb-3">
          {line.slice(3)}
        </h2>
      )
    } else if (line.startsWith('**') && line.endsWith('**')) {
      elements.push(
        <p key={i} className="font-nunito font-bold text-[#3A0030] text-base mb-2">
          {line.slice(2, -2)}
        </p>
      )
    } else if (line.startsWith('- ')) {
      // Collect list items
      const items: string[] = []
      while (i < lines.length && lines[i].startsWith('- ')) {
        items.push(lines[i].slice(2))
        i++
      }
      elements.push(
        <ul key={`list-${i}`} className="font-nunito text-[15px] text-[#5A3A50] leading-relaxed mb-4 list-disc pl-5 space-y-1">
          {items.map((item, j) => (
            <li key={j} dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="underline text-[#7C4DDB] hover:text-[#FF4FA3]">$1</a>') }} />
          ))}
        </ul>
      )
      continue
    } else if (line === '---') {
      elements.push(<hr key={i} className="border-[#FFB6D9] my-7" />)
    } else if (line.trim() === '') {
      // skip blank lines
    } else {
      elements.push(
        <p
          key={i}
          className="font-nunito text-[15px] text-[#5A3A50] leading-relaxed mb-4"
          dangerouslySetInnerHTML={{
            __html: line
              .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
              .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="underline text-[#7C4DDB] hover:text-[#FF4FA3]">$1</a>'),
          }}
        />
      )
    }
    i++
  }
  return elements
}

const CATEGORY_COLORS: Record<string, string> = {
  'scrapbook-ideas': '#FF4FA3',
  'y2k-inspiration': '#7C4DDB',
  'creative-guides': '#1D9BF0',
  'scrappy-guides': '#14B8A6',
}

export default async function JournalArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = getArticle(slug)
  if (!article) return notFound()

  const color = CATEGORY_COLORS[article.category] ?? '#FF4FA3'
  const related = JOURNAL_ARTICLES.filter((a) => a.slug !== slug).slice(0, 2)

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    datePublished: new Date(article.publishedAt).toISOString(),
    publisher: {
      '@type': 'Organization',
      name: 'Scrappy',
      url: SITE_URL,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/journal/${article.slug}`,
    },
  }

  return (
    <div className="flex flex-col min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="flex-1 px-4 sm:px-6 py-8 sm:py-10">
        <article className="max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <nav aria-label="breadcrumb" className="font-nunito text-sm text-[#888] mb-4">
            <Link href="/" className="hover:text-[#FF4FA3]">home</Link>
            {' '}<span aria-hidden>›</span>{' '}
            <Link href="/journal" className="hover:text-[#FF4FA3]">journal</Link>
            {' '}<span aria-hidden>›</span>{' '}
            <span>{JOURNAL_CATEGORIES[article.category]}</span>
          </nav>

          {/* Category tag */}
          <span
            className="font-pixel text-white px-3 py-1 rounded-full inline-block mb-4 text-[10px]"
            style={{ background: color }}
          >
            {article.categoryLabel.toUpperCase()}
          </span>

          {/* Title */}
          <h1 className="font-pacifico text-3xl sm:text-4xl text-[#3A0030] mb-4 leading-tight">
            {article.title}
          </h1>

          {/* Meta */}
          <div className="font-nunito text-sm text-[#888] mb-6">
            {article.publishedAt} &middot; {article.readingTime} read
          </div>

          {/* Intro */}
          <div
            className="rounded-2xl border-2 p-5 mb-7 font-nunito text-base text-[#3A0030] leading-relaxed italic"
            style={{ borderColor: color, background: `${color}10` }}
          >
            {article.intro}
          </div>

          {/* Body */}
          <div className="info-prose">
            {renderBody(article.body)}
          </div>

          {/* Related articles */}
          {related.length > 0 && (
            <section className="mt-10">
              <div className="font-pixel text-[#FF4FA3] tracking-widest mb-4" style={{ fontSize: '11px' }}>
                MORE FROM THE JOURNAL
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {related.map((rel) => {
                  const relColor = CATEGORY_COLORS[rel.category] ?? '#FF4FA3'
                  return (
                    <Link
                      key={rel.slug}
                      href={`/journal/${rel.slug}`}
                      className="block rounded-2xl border-2 border-[#2B0A2E] p-4 hover:-translate-y-0.5 transition-transform no-underline bg-white"
                      style={{ boxShadow: '3px 4px 0 rgba(43,10,46,.12)' }}
                    >
                      <span
                        className="font-pixel text-white px-2 py-0.5 rounded-full text-[10px] inline-block mb-2"
                        style={{ background: relColor }}
                      >
                        {rel.categoryLabel.toUpperCase()}
                      </span>
                      <div className="font-nunito font-extrabold text-sm text-[#3A0030] leading-snug mb-1">
                        {rel.title}
                      </div>
                      <div className="font-nunito text-xs text-[#888]">
                        {rel.readingTime} read
                      </div>
                    </Link>
                  )
                })}
              </div>
              <div className="mt-4 text-center">
                <Link href="/journal" className="font-nunito text-sm text-[#7C4DDB] hover:text-[#FF4FA3] underline">
                  View all journal articles →
                </Link>
              </div>
            </section>
          )}
        </article>
      </main>
      <Footer />
    </div>
  )
}
