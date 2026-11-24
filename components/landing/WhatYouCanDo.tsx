import Link from 'next/link'

const FEATURES = [
  {
    title: 'Scrapbook',
    href: '/scrapbook/create',
    color: '#E0007A',
    icon: '✦',
    text: 'Spiral-notebook pages you decorate with photos, frames, gems, washi tape and handwritten notes. Fully editable.',
  },
  {
    title: 'Photobooth',
    href: '/photobooth',
    color: '#1D9BF0',
    icon: '◎',
    text: 'Snap 1–6 photos and decorate them like a purikura machine with patterns, rhinestones and stamps.',
  },
  {
    title: 'Your profile',
    href: '/my-space',
    color: '#6A3FD0',
    icon: '★',
    text: 'A customizable profile page with glitter names, layouts, backgrounds and a Top 8.',
  },
  {
    title: 'Note exchange',
    href: '/exchange',
    color: '#14B8A6',
    icon: '✉',
    text: "Pass notes like it's 2004: answer the same questions as a friend and reveal them together.",
  },
]

export default function WhatYouCanDo() {
  return (
    <section style={{ padding: '0 20px clamp(40px, 6vw, 64px)', maxWidth: 1120, margin: '0 auto' }}>
      <div className="text-center mb-8">
        <div
          className="font-silkscreen tracking-widest mb-2"
          style={{ fontSize: '11px', color: 'var(--c-primary)' }}
        >
          WHAT YOU CAN MAKE
        </div>
        <h2
          className="font-pacifico"
          style={{ fontSize: 'clamp(26px, 4vw, 38px)', color: 'var(--c-text)', lineHeight: 1.1 }}
        >
          things to do on scrappy <span aria-hidden="true">✦</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {FEATURES.map((f) => (
          <Link
            key={f.title}
            href={f.href}
            className="group card-ink block overflow-hidden transition-transform hover:-translate-y-1"
          >
            <div
              className="flex items-center gap-2 px-4 py-3 text-white font-nunito font-extrabold text-base"
              style={{ background: f.color }}
            >
              <span aria-hidden="true">{f.icon}</span>
              {f.title}
            </div>
            <p className="px-4 py-3 font-nunito text-[14px] leading-snug" style={{ color: 'var(--c-text)' }}>
              {f.text}
            </p>
            <div className="px-4 pb-3 font-nunito font-bold text-sm group-hover:underline" style={{ color: f.color }}>
              try it →
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
