import type { ReactNode } from 'react'
import Link from 'next/link'
import Footer from '@/components/layout/Footer'

/** Shared Y2K "window" layout for About / Privacy / Contact style pages. */
export default function InfoPage({
  eyebrow, title, intro, children, updated,
}: {
  eyebrow: string
  title: string
  intro?: ReactNode
  children: ReactNode
  updated?: string
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 px-4 sm:px-6 py-8 sm:py-10">
        <article className="max-w-3xl mx-auto">
          <nav aria-label="breadcrumb" className="font-nunito text-sm text-[#888] mb-4">
            <Link href="/" className="hover:text-[#FF4FA3]">home</Link> <span aria-hidden>›</span> <span>{title.toLowerCase()}</span>
          </nav>
          <div className="font-pixel text-[#FF4FA3] tracking-widest mb-1" style={{ fontSize: '12px' }}>{eyebrow}</div>
          <h1 className="font-pacifico text-4xl sm:text-5xl text-[#3A0030] mb-3 leading-tight">{title}</h1>
          {intro && <div className="font-nunito text-lg text-[#5A3A50] leading-relaxed mb-6">{intro}</div>}
          {updated && <p className="font-nunito text-sm text-[#888] mb-6">Last updated: {updated}</p>}
          <div className="info-prose">{children}</div>
        </article>
      </main>
      <Footer />
    </div>
  )
}

export function InfoCard({ title, children, color = '#FF4FA3' }: { title: string; children: ReactNode; color?: string }) {
  return (
    <section className="bg-white rounded-2xl border-2 border-[#2B0A2E] overflow-hidden mb-5" style={{ boxShadow: '3px 4px 0 rgba(43,10,46,.18)' }}>
      <h2 className="px-4 py-2 font-nunito font-extrabold text-white text-lg" style={{ background: `linear-gradient(180deg, rgba(255,255,255,.35), ${color} 55%)`, borderBottom: '2px solid #2B0A2E' }}>
        {title}
      </h2>
      <div className="px-4 sm:px-5 py-4">{children}</div>
    </section>
  )
}
