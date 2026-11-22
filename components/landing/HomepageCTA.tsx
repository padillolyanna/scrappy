import Link from 'next/link'

export default function HomepageCTA() {
  return (
    <section style={{ padding: '80px 24px' }}>
      <div style={{ maxWidth: 'var(--content-width)', margin: '0 auto' }}>
        <div
          style={{
            maxWidth: 1000,
            margin: '0 auto',
            border: '3.5px solid var(--ink)',
            borderRadius: 30,
            background: 'linear-gradient(135deg, var(--pink-soft) 0%, var(--purple-soft) 100%)',
            boxShadow: '8px 8px 0 var(--ink)',
            padding: 'clamp(40px, 6vw, 64px) 32px',
            textAlign: 'center',
          }}
        >
          <h2 className="font-pacifico" style={{ fontSize: 'clamp(34px, 4.4vw, 56px)', color: 'var(--ink)', lineHeight: 1.1, marginBottom: 16 }}>
            start your first page
          </h2>
          <p className="font-nunito" style={{ fontSize: 18, color: 'var(--ink)', opacity: 0.7, lineHeight: 1.6, marginBottom: 32, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
            It takes under a minute. No email needed to try it.
          </p>
          <Link
            href="/scrapbook/create"
            className="font-nunito font-black"
            style={{
              minHeight: 54,
              padding: '0 36px',
              display: 'inline-flex',
              alignItems: 'center',
              borderRadius: 999,
              border: '3px solid var(--ink)',
              background: 'linear-gradient(to bottom, #FF7AC0, var(--pink))',
              color: 'white',
              fontSize: 18,
              textDecoration: 'none',
              boxShadow: 'inset 0 3px 0 rgba(255,255,255,.55), 0 5px 0 var(--ink)',
            }}
          >
            Make a scrapbook ✦
          </Link>
        </div>
      </div>
    </section>
  )
}
