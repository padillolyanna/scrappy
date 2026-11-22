import Link from 'next/link'

const STEPS = [
  { n: '01', title: 'Pick your booth', text: '5 frame styles: classic Purikura, film strip, Polaroid grid, retro TV, plain.' },
  { n: '02', title: 'Snap or upload', text: 'Use your camera live or drop in photos you already have.' },
  { n: '03', title: 'Decorate & download', text: 'Stamps, rhinestones, text and washi tape — all draggable, all stackable.' },
]

export default function PhotoboothSection() {
  return (
    <section style={{ padding: '0 20px clamp(40px, 6vw, 64px)', maxWidth: 1120, margin: '0 auto' }}>
      <div className="grid md:grid-cols-2 gap-10 items-center">

        {/* Left: booth visual (CSS fallback until HF-05 is added) */}
        <div
          className="card-ink flex items-center justify-center"
          style={{
            minHeight: 320,
            background: 'linear-gradient(135deg, #FFB6D9 0%, #C9A2FF 100%)',
            borderRadius: 16,
          }}
        >
          <div className="text-center" style={{ padding: 32 }}>
            <div style={{ fontFamily: "'VT323', monospace", fontSize: 96, lineHeight: 1, color: '#3A0030', opacity: 0.25 }}>◎</div>
            <div
              className="font-silkscreen"
              style={{ fontSize: 11, color: '#3A0030', opacity: 0.4, marginTop: 12, letterSpacing: '0.12em' }}
            >
              PHOTOBOOTH
            </div>
          </div>
        </div>

        {/* Right: description + steps + CTA */}
        <div>
          <div
            className="font-silkscreen tracking-widest mb-2"
            style={{ fontSize: '11px', color: '#6A3FD0' }}
          >
            SNAP + DECORATE
          </div>
          <h2
            className="font-pacifico"
            style={{ fontSize: 'clamp(26px, 4vw, 38px)', color: 'var(--c-text)', lineHeight: 1.1, marginBottom: 12 }}
          >
            photobooth strips <span aria-hidden="true">◎</span>
          </h2>
          <p
            className="font-nunito"
            style={{ fontSize: 15, color: 'var(--c-text)', opacity: 0.75, lineHeight: 1.6, marginBottom: 24 }}
          >
            Snap photos and decorate them like a purikura machine — patterns, rhinestones, stamps and
            text. Download as PNG or save straight into your scrapbook.
          </p>

          <div className="flex flex-col gap-3 mb-6">
            {STEPS.map((s) => (
              <div key={s.n} className="flex gap-3 items-start">
                <div
                  className="font-silkscreen flex-shrink-0"
                  style={{ fontSize: 11, color: '#6A3FD0', width: 26, paddingTop: 2 }}
                >
                  {s.n}
                </div>
                <div>
                  <div className="font-nunito font-extrabold text-[14px]" style={{ color: 'var(--c-text)' }}>{s.title}</div>
                  <div className="font-nunito text-[13px]" style={{ color: 'var(--c-text)', opacity: 0.65 }}>{s.text}</div>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/photobooth"
            className="btn-pill btn-pill-purple"
            style={{ fontSize: 14 }}
          >
            Try the photobooth →
          </Link>
        </div>
      </div>
    </section>
  )
}
