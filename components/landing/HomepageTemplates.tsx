import Link from 'next/link'
import { SCRAPBOOK_COVERS } from '@/lib/types'

const TEMPLATE_IDS = ['pink-princess', 'cyber-y2k', 'sweet-memories', 'blue-dream']

export default function HomepageTemplates() {
  const templates = SCRAPBOOK_COVERS.filter((c) => TEMPLATE_IDS.includes(c.id))

  return (
    <section style={{ padding: '0 20px clamp(32px, 5vw, 48px)', maxWidth: 1120, margin: '0 auto' }}>
      <div className="text-center mb-6">
        <div className="font-pixel tracking-widest" style={{ fontSize: '12px', color: 'var(--c-primary)' }} aria-hidden="true">START CREATING</div>
        <h2 className="font-pacifico text-3xl sm:text-4xl mt-1" style={{ color: 'var(--c-text)' }}>
          pick a template <span aria-hidden="true">✦</span>
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        {templates.map((t) => (
          <Link
            key={t.id}
            href={`/scrapbook/create?template=${t.id}`}
            className="group block rounded-2xl border-2 overflow-hidden transition-transform hover:-translate-y-1"
            style={{ background: 'var(--c-panel)', borderColor: 'var(--c-outline)', boxShadow: '3px 4px 0 rgba(43,10,46,.18)' }}
          >
            <div
              className={`bg-gradient-to-br ${t.bg_gradient} flex items-center justify-center`}
              style={{ height: 100, position: 'relative' }}
            >
              <span className="font-pixel opacity-50" style={{ fontSize: 32, color: t.accent_color }}>
                {t.preview_symbol}
              </span>
              {t.stickers.slice(0, 2).map((s, i) => (
                <span
                  key={i}
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    top: i === 0 ? 8 : undefined,
                    bottom: i === 1 ? 8 : undefined,
                    right: 8,
                    fontSize: 14,
                    opacity: 0.65,
                    color: t.accent_color,
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
            <div style={{ padding: '8px 12px 12px' }}>
              <div className="font-nunito font-extrabold text-sm" style={{ color: 'var(--c-text)' }}>{t.name}</div>
              <div className="font-nunito text-xs leading-snug mt-0.5" style={{ color: 'var(--c-text)', opacity: 0.65 }}>{t.description}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="text-center">
        <Link
          href="/scrapbook/create"
          style={{ fontFamily: "'VT323', monospace", fontSize: 16, color: 'var(--c-primary)', textDecoration: 'underline' }}
        >
          or create from scratch →
        </Link>
      </div>
    </section>
  )
}
