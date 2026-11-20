import Link from 'next/link'

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Scrapbook', href: '/scrapbook/create' },
  { label: 'Explore', href: '/explore' },
  { label: 'Highlights', href: '/highlights' },
  { label: 'Confessions', href: '/confessions' },
  { label: 'Daily Prompt', href: '/prompts' },
]

const INFO_LINKS = [
  { label: 'About Scrappy', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Photobooth', href: '/photobooth' },
  { label: 'Scrapbook Exchange', href: '/exchange' },
]

export default function Footer() {
  return (
    <footer className="bg-[#3A0030] text-[#FFB6D9]">
      {/* Gradient fade-in at top */}
      <div
        className="h-6 w-full"
        style={{ background: 'linear-gradient(to bottom, transparent, #3A0030)', marginTop: '-1px' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* LEFT */}
          <div>
            <div
              className="font-pacifico text-3xl text-glitter mb-2"
              style={{ fontFamily: 'Pacifico, cursive' }}
            >
              SCRAPPY
            </div>
            <p className="font-caveat text-[#FFB6D9]/70 text-lg" style={{ fontFamily: 'Caveat, cursive' }}>
              Your little corner of the internet. ✦
            </p>
            <div className="mt-3 font-pixel text-[#FFB6D9]/40" style={{ fontSize: '12px' }}>
              &copy; 2026 SCRAPPY. ALL RIGHTS RESERVED.
            </div>
          </div>

          {/* MIDDLE */}
          <div>
            <div className="font-pixel text-[#FFB6D9]/50 tracking-widest mb-3" style={{ fontSize: '12px' }}>
              EXPLORE
            </div>
            <div className="flex flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-nunito text-sm text-[#FFB6D9]/85 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div>
            <div className="font-pixel text-[#FFB6D9]/50 tracking-widest mb-3" style={{ fontSize: '12px' }}>
              INFO
            </div>
            <p className="font-caveat text-[#FFB6D9]/60 text-base mb-4" style={{ fontFamily: 'Caveat, cursive' }}>
              A digital scrapbook community for everyone who wants their little piece of the internet.
            </p>
            <div className="flex flex-col gap-2">
              {INFO_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="font-nunito text-sm text-[#FFB6D9]/80 hover:text-[#FFB6D9] transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom marquee strip */}
        <div className="border-t border-[#FFB6D9]/20 pt-6 overflow-hidden">
          <div
            className="font-pixel text-[#FFB6D9]/30 whitespace-nowrap"
            style={{ fontSize: '12px', animation: 'marquee 30s linear infinite' }}
          >
            {Array(6)
              .fill('✦ make memories ✦ collect answers ✦ decorate your pages ✦ leave a little piece of yourself ✦ ')
              .join('')}
          </div>
        </div>
      </div>
    </footer>
  )
}
