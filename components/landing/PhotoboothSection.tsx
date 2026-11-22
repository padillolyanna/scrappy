import Link from 'next/link'

const STEPS = [
  { n: '01', label: 'pick a frame' },
  { n: '02', label: 'snap 4 poses' },
  { n: '03', label: 'decorate + save' },
]

const STRIP_FRAMES = [
  'linear-gradient(135deg, #C9A2FF 0%, #A8DFFF 100%)',
  'linear-gradient(135deg, #A8DFFF 0%, #6FE3FF 100%)',
  'linear-gradient(135deg, #FFF0A8 0%, #FFD580 100%)',
]

function BoothIllustration() {
  return (
    <div className="relative flex justify-center" style={{ height: 400 }}>
      {/* Main booth body */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-60%)',
          width: 220,
          borderRadius: 20,
          border: '3px solid #2B0A2E',
          boxShadow: '5px 5px 0 #2B0A2E',
          overflow: 'hidden',
          background: 'white',
          top: 0,
          bottom: 20,
        }}
      >
        {/* Header: "snap snap!" */}
        <div
          className="font-pacifico text-center"
          style={{
            background: 'linear-gradient(90deg, #FF9ECF 0%, #FF4FA3 100%)',
            padding: '10px 16px',
            fontSize: 20,
            color: 'white',
            textShadow: '1px 1px 0 rgba(0,0,0,0.18)',
          }}
        >
          snap snap!
        </div>

        {/* Camera viewport */}
        <div
          style={{
            background: 'linear-gradient(135deg, #E0D0FF 0%, #C0D8FF 50%, #D0F0FF 100%)',
            padding: '20px 24px',
            position: 'relative',
            borderBottom: '3px solid #2B0A2E',
          }}
        >
          {/* Polka dots */}
          {[
            { top: 10, left: 12 }, { top: 10, left: 36 }, { top: 10, left: 60 },
            { top: 10, right: 12 }, { top: 10, right: 36 },
            { bottom: 10, left: 12 }, { bottom: 10, left: 36 },
            { bottom: 10, right: 12 }, { bottom: 10, right: 36 }, { bottom: 10, right: 60 },
          ].map((pos, i) => (
            <div
              key={i}
              aria-hidden="true"
              style={{
                position: 'absolute',
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.7)',
                ...pos,
              }}
            />
          ))}

          {/* Camera lens */}
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 38% 35%, #555, #111 60%)',
              border: '4px solid #2B0A2E',
              margin: '12px auto',
              boxShadow: '0 0 0 5px rgba(255,255,255,0.4), inset 0 2px 6px rgba(255,255,255,0.15)',
              position: 'relative',
            }}
          >
            {/* Lens highlight */}
            <div
              style={{
                position: 'absolute',
                top: 10,
                left: 12,
                width: 18,
                height: 12,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.35)',
                transform: 'rotate(-20deg)',
              }}
            />
          </div>
        </div>

        {/* Striped bottom */}
        <div
          style={{
            flex: 1,
            height: 160,
            background: 'repeating-linear-gradient(90deg, #FFB6D9 0px, #FFB6D9 15px, #fff 15px, #fff 30px)',
          }}
        />

        {/* Footer / base */}
        <div
          style={{
            height: 22,
            background: '#D8C4D0',
            borderTop: '3px solid #2B0A2E',
          }}
        />
      </div>

      {/* Photo strip hanging off the right */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(32%)',
          top: 48,
          width: 72,
          background: 'white',
          border: '2.5px solid #2B0A2E',
          borderRadius: 8,
          padding: '4px 4px 6px',
          boxShadow: '3px 4px 0 #2B0A2E',
          zIndex: 10,
        }}
      >
        {STRIP_FRAMES.map((bg, i) => (
          <div
            key={i}
            style={{
              height: 62,
              background: bg,
              borderRadius: 4,
              marginBottom: i < 2 ? 3 : 0,
            }}
          />
        ))}
        <div
          className="font-caveat text-center"
          style={{ fontSize: 12, color: '#FF4FA3', marginTop: 4 }}
        >
          bff 4ever
        </div>
      </div>

      {/* HF-07 label */}
      <div
        className="font-silkscreen absolute"
        style={{ bottom: 4, left: '50%', transform: 'translateX(-82%)', fontSize: 9, color: '#aaa', letterSpacing: '0.08em' }}
      >
        HF-07 BOOTH
      </div>

      {/* HF-08 label */}
      <div
        className="font-silkscreen absolute"
        style={{ bottom: 4, left: '50%', transform: 'translateX(32%)', fontSize: 9, color: '#aaa', letterSpacing: '0.08em' }}
      >
        HF-08 STRIP
      </div>
    </div>
  )
}

export default function PhotoboothSection() {
  return (
    <section style={{ padding: '0 20px clamp(40px, 6vw, 64px)', maxWidth: 1120, margin: '0 auto' }}>
      <div className="grid md:grid-cols-2 gap-10 items-center">

        {/* Left: booth illustration */}
        <BoothIllustration />

        {/* Right: copy + steps + CTA */}
        <div>
          <div
            className="font-silkscreen tracking-widest mb-3"
            style={{ fontSize: '11px', color: '#E0007A' }}
          >
            + THE PHOTOBOOTH
          </div>
          <h2
            className="font-pacifico"
            style={{ fontSize: 'clamp(28px, 4vw, 42px)', color: 'var(--c-text)', lineHeight: 1.15, marginBottom: 14 }}
          >
            step inside the purikura machine
          </h2>
          <p
            className="font-nunito"
            style={{ fontSize: 15, color: 'var(--c-text)', opacity: 0.75, lineHeight: 1.65, marginBottom: 24 }}
          >
            Pick a frame, strike four poses, then decorate your strip with stamps and gems. Save it to your phone or stick it straight onto a scrapbook page.
          </p>

          {/* 3 horizontal step cards */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {STEPS.map((s) => (
              <div
                key={s.n}
                style={{
                  border: '2px solid #2B0A2E',
                  borderRadius: 12,
                  padding: '10px 12px',
                  background: 'white',
                }}
              >
                <div
                  className="font-silkscreen"
                  style={{ fontSize: 10, color: '#E0007A', marginBottom: 4 }}
                >
                  {s.n}
                </div>
                <div
                  className="font-nunito font-extrabold"
                  style={{ fontSize: 13, color: 'var(--c-text)', lineHeight: 1.2 }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          <Link href="/photobooth" className="btn-pill btn-pill-purple" style={{ fontSize: 14 }}>
            Try the photobooth →
          </Link>
        </div>

      </div>
    </section>
  )
}
