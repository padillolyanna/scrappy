import Link from 'next/link'
import { motion } from 'framer-motion'

export default function FinalCTA() {
  return (
    <section
      className="relative overflow-hidden py-20 lg:py-28"
      style={{ background: 'linear-gradient(135deg, #3A0030 0%, #200040 100%)' }}
    >
      {/* Decorative background symbols */}
      <div className="absolute top-8 left-8 font-pixel text-white opacity-5 select-none pointer-events-none" style={{ fontSize: '80px' }}>✦</div>
      <div className="absolute bottom-8 right-12 font-pixel text-white opacity-5 select-none pointer-events-none" style={{ fontSize: '64px' }}>★</div>
      <div className="absolute top-1/2 left-4 font-pixel text-white opacity-5 select-none pointer-events-none" style={{ fontSize: '48px' }}>♡</div>
      <div className="absolute top-6 right-6 font-pixel text-white opacity-5 select-none pointer-events-none" style={{ fontSize: '56px' }}>✿</div>
      <div className="absolute bottom-10 left-1/4 font-pixel text-white opacity-5 select-none pointer-events-none" style={{ fontSize: '40px' }}>◆</div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto"
        >
          {/* Sparkle */}
          <div className="font-pixel text-4xl text-[#FF4FA3] mb-6">✦</div>

          {/* Heading */}
          <h2
            className="font-pacifico text-white leading-tight"
            style={{ fontFamily: 'Pacifico, cursive', fontSize: 'clamp(32px, 6vw, 56px)' }}
          >
            Ready to claim your little corner?
          </h2>

          {/* Description */}
          <p
            className="font-caveat text-[#FFB6D9]/80 mt-4 mb-10"
            style={{ fontFamily: 'Caveat, cursive', fontSize: '20px' }}
          >
            Join thousands of people decorating their corner of the internet. It's free, it's yours, and it's exactly as chaotic as you want it to be.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/scrapbook/create" className="btn-y2k text-lg px-10 py-4">
              ✦ MAKE MY SCRAPBOOK
            </Link>
            <Link
              href="/explore"
              className="rounded-full font-nunito font-bold text-lg transition-all hover:bg-white/10"
              style={{
                border: '2px solid rgba(255,255,255,0.4)',
                color: 'white',
                padding: '1rem 2.5rem',
              }}
            >
              EXPLORE SCRAPPY
            </Link>
          </div>

          {/* Decorative pixel row */}
          <div className="font-pixel mt-12 tracking-widest text-[#FFB6D9]/20 select-none" style={{ fontSize: '14px' }}>
            ✦ ★ ♡ ✿ ♪ ◆ ✦ ★ ♡ ✿ ♪ ◆ ✦
          </div>
        </motion.div>
      </div>
    </section>
  )
}
