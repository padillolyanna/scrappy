import Link from 'next/link'

const CARDS = [
  {
    title: 'Make a scrapbook',
    href: '/scrapbook/create',
    color: '#FF4FA3',
    icon: '✦',
    text: 'Spiral-notebook pages you decorate with photos, frames, gems and washi tape. Everything stays editable.',
  },
  {
    title: 'Photobooth strips',
    href: '/photobooth',
    color: '#1D9BF0',
    icon: '◎',
    text: 'Snap photos, then decorate them like a purikura machine with patterns, rhinestones and stamps.',
  },
  {
    title: 'Your own page',
    href: '/my-space',
    color: '#F59E0B',
    icon: '★',
    text: 'A customizable profile with glitter names, layouts, backgrounds, a Top 8 and a comment wall.',
  },
]

export default function HomepageMakeCards() {
  return (
    <section style={{ padding: '0 20px clamp(40px, 6vw, 64px)', maxWidth: 1120, margin: '0 auto' }}>
      <div className="text-center mb-6">
        <div className="font-pixel text-[#FF4FA3] tracking-widest" style={{ fontSize: '12px' }} aria-hidden="true">WHAT YOU CAN MAKE</div>
        <h2 className="font-pacifico text-3xl sm:text-4xl text-[#3A0030] mt-1">
          things you can create <span aria-hidden="true">✦</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {CARDS.map((f) => (
          <Link
            key={f.title}
            href={f.href}
            className="group block bg-white rounded-2xl border-2 border-[#2B0A2E] overflow-hidden transition-transform hover:-translate-y-1"
            style={{ boxShadow: '3px 4px 0 rgba(43,10,46,.18)' }}
          >
            <div
              className="flex items-center gap-2 px-4 py-2 text-white font-nunito font-extrabold text-lg"
              style={{ background: `linear-gradient(180deg, rgba(255,255,255,.35), ${f.color} 55%)`, borderBottom: '2px solid #2B0A2E' }}
            >
              <span aria-hidden="true">{f.icon}</span>
              {f.title}
            </div>
            <p className="px-4 py-3 font-nunito text-[15px] text-[#3A2A35] leading-snug">{f.text}</p>
            <div className="px-4 pb-3 font-nunito font-bold text-sm group-hover:underline" style={{ color: f.color }}>
              try it →
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
