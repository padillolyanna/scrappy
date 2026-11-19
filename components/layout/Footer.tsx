import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#3A0030] text-[#FFB6D9] mt-auto">
      <div
        className="h-6 w-full"
        style={{ background: 'linear-gradient(to bottom, transparent, #3A0030)', marginTop: '-1px' }}
      />

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div
              className="font-pacifico text-3xl text-glitter mb-2"
              style={{ fontFamily: 'Pacifico, cursive', fontSize: '28px' }}
            >
              SCRAPPY
            </div>
            <p className="font-caveat text-[#FFB6D9]/70 text-lg" style={{ fontFamily: 'Caveat, cursive' }}>
              Your little corner of the internet. ✦
            </p>
            <div className="mt-3 font-pixel text-xs text-[#FFB6D9]/50" style={{ fontSize: '10px' }}>
              &copy; 2024 SCRAPPY — made with love
            </div>
          </div>

          <div>
            <div className="font-pixel text-xs text-[#FFB6D9]/60 mb-3 tracking-widest" style={{ fontSize: '10px' }}>
              EXPLORE
            </div>
            <div className="flex flex-col gap-2">
              {['Home', 'Create Scrapbook', 'Highlights', 'Confession Wall', 'Daily Prompt'].map((l) => (
                <Link
                  key={l}
                  href="#"
                  className="font-nunito text-sm text-[#FFB6D9]/70 hover:text-[#FFB6D9] transition-colors"
                >
                  {l}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="font-pixel text-xs text-[#FFB6D9]/60 mb-3 tracking-widest" style={{ fontSize: '10px' }}>
              SCRAPPY ✦ 2024
            </div>
            <div className="font-caveat text-[#FFB6D9]/60 text-base leading-relaxed" style={{ fontFamily: 'Caveat, cursive' }}>
              A digital scrapbook community for everyone who wants their little piece of the internet.
            </div>
            <div className="mt-4 flex gap-3 text-xl">
              {['✦', '★', '♡', '✿', '◆'].map((s, i) => (
                <span key={i} className="sticker cursor-pointer text-[#FFB6D9]/60">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-[#FFB6D9]/20 pt-6 overflow-hidden">
          <div className="font-pixel text-xs text-[#FFB6D9]/30 whitespace-nowrap" style={{ fontSize: '10px', animation: 'marquee 30s linear infinite' }}>
            {Array(6).fill('✦ make memories ✦ collect answers ✦ decorate your pages ✦ leave a little piece of yourself ✦ ').join('')}
          </div>
        </div>
      </div>
    </footer>
  )
}
