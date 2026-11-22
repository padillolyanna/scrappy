import Link from 'next/link'

const DECO = [
  { g: '✦', style: { top: '16px', left: '24px', fontSize: 48 } },
  { g: '★', style: { bottom: '16px', right: '40px', fontSize: 40 } },
  { g: '♡', style: { top: '50%', left: '12px', fontSize: 32, transform: 'translateY(-50%)' } },
  { g: '✿', style: { top: '24px', right: '20px', fontSize: 36 } },
  { g: '◆', style: { bottom: '32px', left: '25%', fontSize: 28 } },
]

export default function HomepageCTA() {
  return (
    <section style={{ padding: '0 20px clamp(40px, 6vw, 72px)', maxWidth: 1120, margin: '0 auto' }}>
      <div
        className="card-ink text-center"
        style={{
          background: 'linear-gradient(135deg, #3A0030 0%, #200040 100%)',
          borderColor: '#2B0A2E',
          padding: 'clamp(40px, 6vw, 64px) 24px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {DECO.map(({ g, style }, i) => (
          <span
            key={i}
            aria-hidden="true"
            className="absolute select-none pointer-events-none"
            style={{ fontFamily: "'VT323', monospace", color: 'rgba(255,255,255,0.05)', ...style }}
          >
            {g}
          </span>
        ))}

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div
            className="font-silkscreen tracking-widest mb-4"
            style={{ fontSize: '11px', color: '#FF4FA3' }}
          >
            JOIN THE CLUB
          </div>
          <h2
            className="font-pacifico"
            style={{
              fontSize: 'clamp(28px, 5vw, 48px)',
              color: 'white',
              lineHeight: 1.1,
              marginBottom: 16,
            }}
          >
            Claim your little corner.
          </h2>
          <p
            className="font-nunito"
            style={{
              fontSize: 17,
              color: 'rgba(255,182,217,0.85)',
              lineHeight: 1.6,
              marginBottom: 32,
              maxWidth: 480,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            It&apos;s free, it&apos;s yours, and it&apos;s exactly as chaotic as you want it to be.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/scrapbook/create" className="btn-pill btn-pill-pink" style={{ fontSize: 15 }}>
              ✦ Make my scrapbook
            </Link>
            <Link
              href="/explore"
              className="btn-pill"
              style={{
                fontSize: 15,
                background: 'rgba(255,255,255,0.1)',
                borderColor: 'rgba(255,255,255,0.35)',
                color: 'white',
                boxShadow: '5px 5px 0 rgba(255,255,255,0.08)',
              }}
            >
              Explore Scrappy
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
