import Link from 'next/link'
import { SCRAPBOOK_COVERS, type ScrapbookCover } from '@/lib/types'

const TEMPLATE_IDS = ['pink-princess', 'cyber-y2k', 'sweet-memories', 'blue-dream']

type TemplateStyle = {
  washi1: string
  washi2: string
  photoFill: string
  sampleText: string
  sampleFont: string
  sampleColor: string
  glowColor?: string
}

const STYLES: Record<string, TemplateStyle> = {
  'pink-princess': {
    washi1: '#C9A2FF', washi2: '#FFB6D9',
    photoFill: 'linear-gradient(135deg, #FF9ECF, #C9A2FF)',
    sampleText: 'memories ♡',
    sampleFont: "'Pacifico', cursive",
    sampleColor: '#3A0030',
  },
  'cyber-y2k': {
    washi1: '#00CFFF', washi2: '#A020F0',
    photoFill: 'linear-gradient(135deg, #00CFFF, #A020F0)',
    sampleText: 'CYBER.DIARY',
    sampleFont: "'VT323', monospace",
    sampleColor: '#00CFFF',
    glowColor: 'rgba(0,207,255,0.6)',
  },
  'sweet-memories': {
    washi1: '#FFB347', washi2: '#FF9B6A',
    photoFill: 'linear-gradient(135deg, #FFE4B5, #FFDAB9)',
    sampleText: 'nostalgia ✿',
    sampleFont: "'Pacifico', cursive",
    sampleColor: '#7A4A00',
  },
  'blue-dream': {
    washi1: '#A8DFFF', washi2: '#6B9FFF',
    photoFill: 'linear-gradient(135deg, #DBEAFE, #A8DFFF)',
    sampleText: 'dreaming...',
    sampleFont: "'Caveat', cursive",
    sampleColor: '#1A3A6A',
  },
}

function ScrapbookPreview({ cover }: { cover: ScrapbookCover }) {
  const s = STYLES[cover.id]

  if (!s) {
    return (
      <div className={`bg-gradient-to-br ${cover.bg_gradient} flex items-center justify-center`} style={{ height: 160 }}>
        <span className="font-pixel opacity-50" style={{ fontSize: 32, color: cover.accent_color }}>{cover.preview_symbol}</span>
      </div>
    )
  }

  return (
    <div className={`bg-gradient-to-br ${cover.bg_gradient}`} style={{ height: 160, position: 'relative', overflow: 'hidden' }}>
      {/* Washi tape strip */}
      <div style={{
        position: 'absolute', top: 18, left: -8, right: -8, height: 11,
        background: s.washi1, opacity: 0.6, transform: 'rotate(-1.5deg)',
      }} />
      <div style={{
        position: 'absolute', top: 18, left: -8, width: 55, height: 11,
        background: s.washi2, opacity: 0.5, transform: 'rotate(-1.5deg)',
      }} />

      {/* Mini polaroid */}
      <div style={{
        position: 'absolute', top: 36, left: 10,
        width: 70, background: 'white',
        padding: '4px 4px 18px',
        boxShadow: '2px 3px 8px rgba(0,0,0,0.22)',
        transform: 'rotate(-4deg)',
        zIndex: 2,
      }}>
        <div style={{ width: '100%', height: 48, background: s.photoFill, borderRadius: 1 }} />
      </div>

      {/* Sticker 1 */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: 10, right: 14,
        fontSize: 24, color: cover.accent_color, opacity: 0.9,
      }}>{cover.stickers[0]}</div>

      {/* Sticker 2 */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: 46, right: 38,
        fontSize: 15, color: cover.accent_color, opacity: 0.7,
      }}>{cover.stickers[1]}</div>

      {/* Sample text */}
      <div style={{
        position: 'absolute', bottom: 14, right: 10,
        fontFamily: s.sampleFont,
        fontSize: cover.id === 'cyber-y2k' ? 20 : 15,
        color: s.sampleColor,
        textShadow: s.glowColor ? `0 0 8px ${s.glowColor}` : undefined,
        maxWidth: '55%',
        textAlign: 'right',
        lineHeight: 1.2,
      }}>
        {s.sampleText}
      </div>

      {/* Sticker 3 */}
      <div aria-hidden="true" style={{
        position: 'absolute', bottom: 12, left: 90,
        fontSize: 14, color: cover.accent_color, opacity: 0.6,
      }}>{cover.stickers[2] ?? cover.preview_symbol}</div>
    </div>
  )
}

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
            <ScrapbookPreview cover={t} />
            <div style={{ padding: '8px 12px 12px' }}>
              <div className="font-nunito font-extrabold text-sm" style={{ color: 'var(--c-text)' }}>{t.name}</div>
              <div className="font-nunito text-xs leading-snug mt-0.5" style={{ color: 'var(--c-text)', opacity: 0.65 }}>
                {t.description}
              </div>
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
