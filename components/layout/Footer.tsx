import Link from 'next/link'

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Scrapbook', href: '/scrapbook/create' },
  { label: 'Explore', href: '/explore' },
  { label: 'Highlights', href: '/highlights' },
  { label: 'Confessions', href: '/confessions' },
  { label: 'Daily Prompt', href: '/prompts' },
]

export default function Footer() {
  return (
    <footer
      style={{
        background: '#2B0A2E',
        margin: '0',
        padding: '0',
        borderTop: '2px solid #2B0A2E',
        borderRadius: '0 0 12px 12px',
      }}
    >
      <div style={{ padding: '16px 20px' }}>

        {/* Row 1: Nav links */}
        <div
          style={{
            fontFamily: 'Verdana, Tahoma, sans-serif',
            fontSize: 11,
            color: 'rgba(255,182,217,0.7)',
            textAlign: 'center',
            marginBottom: 8,
          }}
        >
          {NAV_LINKS.map((link, i) => (
            <span key={link.href}>
              <Link
                href={link.href}
                style={{ color: 'rgba(255,182,217,0.7)', textDecoration: 'none' }}
                className="hover:underline"
              >
                {link.label}
              </Link>
              {i < NAV_LINKS.length - 1 && (
                <span style={{ margin: '0 6px', opacity: 0.4 }}>|</span>
              )}
            </span>
          ))}
        </div>

        {/* Row 2: copyright */}
        <div
          style={{
            fontFamily: 'Verdana, Tahoma, sans-serif',
            fontSize: 10,
            color: 'rgba(255,182,217,0.5)',
            textAlign: 'center',
            marginBottom: 10,
          }}
        >
          &copy; 2026 SCRAPPY
        </div>

        {/* Row 3: Blinkies + guestbook link */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* Blinkie 1: I ♡ SCRAPPY */}
          <div
            className="blinkie"
            style={{
              background: 'linear-gradient(90deg, #FF4FA3, #D4006A)',
              color: 'white',
              borderColor: '#2B0A2E',
            }}
          >
            I ♡ SCRAPPY
          </div>

          {/* Blinkie 2: glitter power */}
          <div
            className="blinkie"
            style={{
              background: 'linear-gradient(90deg, #C9A2FF, #7C4DDB)',
              color: 'white',
              borderColor: '#2B0A2E',
            }}
          >
            glitter power
          </div>

          {/* Blinkie 3: y2k forever */}
          <div
            className="blinkie"
            style={{
              background: 'linear-gradient(90deg, #6FE3FF, #0099CC)',
              color: '#2B0A2E',
              borderColor: '#2B0A2E',
            }}
          >
            y2k forever
          </div>

          <Link
            href="/confessions"
            style={{
              fontFamily: "'VT323', monospace",
              fontSize: 13,
              color: '#FFB6D9',
              textDecoration: 'underline',
              marginLeft: 4,
            }}
          >
            sign my guestbook! →
          </Link>
        </div>
      </div>
    </footer>
  )
}
