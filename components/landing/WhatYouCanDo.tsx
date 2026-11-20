import Link from 'next/link'

const FEATURES = [
  { title: 'Make a scrapbook', href: '/scrapbook/create', color: '#FF4FA3', icon: '✦', text: 'Spiral-notebook pages you decorate with photos, frames, gems, washi tape, doodles and handwritten notes. Everything stays editable.' },
  { title: 'Photobooth strips', href: '/photobooth', color: '#1D9BF0', icon: '◎', text: 'Snap 1–6 photos, then decorate them like a purikura machine with patterns, magazine covers, rhinestones and stamps.' },
  { title: 'Daily prompt', href: '/prompts', color: '#7C4DDB', icon: '◆', text: 'One fun question every day. Answer it, read everyone else\'s, and save your favourites into a scrapbook.' },
  { title: 'Confession wall', href: '/confessions', color: '#F43F5E', icon: '♡', text: 'Say the little things you can\'t say out loud, anonymously. Moderated and kind.' },
  { title: 'Scrapbook exchange', href: '/exchange', color: '#14B8A6', icon: '✉', text: 'Pass notes like it\'s 2004: answer the same questions as a friend, reveal them together and make a friendship page.' },
  { title: 'Your own page', href: '/my-space', color: '#F59E0B', icon: '★', text: 'A customizable profile with glitter names, layouts, backgrounds, a Top 8, a profile song and a comment wall.' },
]

const FAQ = [
  { q: 'Is Scrappy free?', a: 'Yes. Making scrapbooks, photo strips and your profile page is free. Ads help keep the site running.' },
  { q: 'Do I need an account?', a: 'You can browse public scrapbooks, highlights and confessions without one. To save your own creations, sign up with your email; it takes a minute.' },
  { q: 'Who can see my scrapbook?', a: 'You choose: public (anyone), link-only (only people with the link) or private (just you). You can change it any time.' },
  { q: 'Does it work on my phone?', a: 'Yes! Scrappy works in any modern browser on phones, tablets and computers. The photobooth uses your phone camera.' },
  { q: 'Can I download what I make?', a: 'Photo strips download as PNG images, and scrapbook spreads can be saved as images from the editor.' },
]

export default function WhatYouCanDo() {
  return (
    <section aria-labelledby="what-you-can-do" className="px-4 sm:px-6 py-8" style={{ borderTop: '2px solid #2B0A2E', background: '#FFF8FB' }}>
      <div className="text-center mb-6">
        <div className="font-pixel text-[#FF4FA3] tracking-widest" style={{ fontSize: '12px' }}>WELCOME TO SCRAPPY</div>
        <h2 id="what-you-can-do" className="font-pacifico text-3xl sm:text-4xl text-[#3A0030] leading-tight">what you can do here ✦</h2>
        <p className="font-nunito text-base sm:text-lg text-[#5A3A50] max-w-2xl mx-auto mt-2 leading-relaxed">
          Scrappy is a free digital scrapbook community inspired by the early-2000s internet: a place to keep memories, make cute things and
          meet people who love that handmade, glittery feeling.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {FEATURES.map((f) => (
          <Link
            key={f.title}
            href={f.href}
            className="group block bg-white rounded-2xl border-2 border-[#2B0A2E] overflow-hidden transition-transform hover:-translate-y-1"
            style={{ boxShadow: '3px 4px 0 rgba(43,10,46,.18)' }}
          >
            <div className="flex items-center gap-2 px-4 py-2 text-white font-nunito font-extrabold text-lg" style={{ background: `linear-gradient(180deg, rgba(255,255,255,.35), ${f.color} 55%)`, borderBottom: '2px solid #2B0A2E' }}>
              <span aria-hidden className="font-chango">{f.icon}</span>
              {f.title}
            </div>
            <p className="px-4 py-3 font-nunito text-[15px] text-[#3A2A35] leading-snug">{f.text}</p>
            <div className="px-4 pb-3 font-nunito font-bold text-sm group-hover:underline" style={{ color: f.color }}>try it →</div>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid lg:grid-cols-[1fr_1.2fr] gap-5 items-start">
        <div className="bg-white rounded-2xl border-2 border-[#2B0A2E] p-5" style={{ boxShadow: '3px 4px 0 rgba(43,10,46,.18)' }}>
          <h3 className="font-pacifico text-2xl text-[#FF4FA3] mb-2">about scrappy</h3>
          <p className="font-nunito text-[15px] text-[#3A2A35] leading-relaxed">
            Remember decorating your page, collecting glitter graphics and filling in quizzes for your best friends? Scrappy brings that cosy,
            creative internet back. Make a scrapbook about your summer, a photo strip with your besties, or a profile page that looks exactly
            how you want, and leave a little piece of yourself behind.
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            <Link href="/about" className="btn-outline-y2k text-sm px-4 py-2">read more about us</Link>
            <Link href="/explore" className="btn-y2k text-sm px-4 py-2">explore scrapbooks</Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl border-2 border-[#2B0A2E] p-5" style={{ boxShadow: '3px 4px 0 rgba(43,10,46,.18)' }}>
          <h3 className="font-pacifico text-2xl text-[#7C4DDB] mb-2">questions ♡</h3>
          <div className="divide-y-2 divide-[#FFE4F0]">
            {FAQ.map((f) => (
              <details key={f.q} className="py-2 group">
                <summary className="cursor-pointer list-none flex justify-between items-center gap-3 font-nunito font-extrabold text-base text-[#3A0030]">
                  {f.q}
                  <span aria-hidden className="text-[#FF4FA3] transition-transform group-open:rotate-45 text-xl leading-none">+</span>
                </summary>
                <p className="font-nunito text-[15px] text-[#3A2A35] leading-relaxed mt-1">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
