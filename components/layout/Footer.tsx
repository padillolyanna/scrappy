import Link from 'next/link'

const MAKE_LINKS = [
  { label: 'Scrapbook', href: '/scrapbook/create' },
  { label: 'Photobooth', href: '/photobooth' },
  { label: 'Explore', href: '/explore' },
]

const INFO_LINKS = [
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Privacy', href: '/privacy' },
]

export default function Footer() {
  return (
    <footer style={{ background: '#2B0A2E', borderTop: '3px solid var(--ink)' }}>
      <div style={{ maxWidth: 'var(--content-width)', margin: '0 auto', padding: '56px 24px 32px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 32 }}
        className="[grid-template-columns:1fr] sm:[grid-template-columns:1fr_1fr_1fr]"
      >
        {/* Logo + tagline */}
        <div>
          <div className="font-pacifico" style={{ fontSize: 28, color: '#FFE9F4', marginBottom: 8 }}>
            Scrappy
          </div>
          <p className="font-nunito" style={{ fontSize: 16, color: 'rgba(255,233,244,.6)', lineHeight: 1.6 }}>
            Your little corner of the internet ✦
          </p>
          <p className="font-silkscreen" style={{ fontSize: 11, color: 'rgba(255,233,244,.3)', marginTop: 12 }}>
            &copy; 2026 SCRAPPY
          </p>
        </div>

        {/* MAKE */}
        <div>
          <div className="font-silkscreen" style={{ fontSize: 11, color: 'rgba(255,233,244,.4)', letterSpacing: '0.08em', marginBottom: 16 }}>MAKE</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {MAKE_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="font-nunito font-bold" style={{ fontSize: 15, color: 'rgba(255,233,244,.75)', textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#FFE9F4' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,233,244,.75)' }}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* INFO */}
        <div>
          <div className="font-silkscreen" style={{ fontSize: 11, color: 'rgba(255,233,244,.4)', letterSpacing: '0.08em', marginBottom: 16 }}>INFO</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {INFO_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="font-nunito font-bold" style={{ fontSize: 15, color: 'rgba(255,233,244,.75)', textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#FFE9F4' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,233,244,.75)' }}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
