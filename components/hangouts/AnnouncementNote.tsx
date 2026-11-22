import Link from 'next/link'
import type { AnnouncementWithMeta } from '@/lib/announcements'

const NOTE_BG: Record<string, string> = {
  pink: '#FFD6EA',
  lilac: '#E6DBFF',
  blue: '#D6EEFF',
  yellow: '#FFF3B0',
  mint: '#D9F7E6',
}

const PIN_COLOR: Record<string, string> = {
  pink: '#FF4FA3',
  lilac: '#7C4DDB',
  blue: '#7C4DDB',
  yellow: '#7C4DDB',
  mint: '#7C4DDB',
}

const KIND_LABELS: Record<string, string> = {
  'new-hangout': '✦ NEW HANGOUT',
  'reminder': '⏰ REMINDER',
  'change': '✎ CHANGE',
  'cancelled': '✕ CANCELLED',
  'recap': '♡ RECAP',
  'news': '★ NEWS',
}

function tiltDeg(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0
  return ((Math.abs(h) % 50) / 10) - 2.5
}

interface Props {
  a: AnnouncementWithMeta
  noTilt?: boolean
  fullWidth?: boolean
  rsvpHighlight?: boolean
}

export default function AnnouncementNote({ a, noTilt, fullWidth, rsvpHighlight }: Props) {
  const bg = NOTE_BG[a.note_color] ?? NOTE_BG.pink
  const pinColor = PIN_COLOR[a.note_color] ?? '#FF4FA3'
  const tilt = noTilt ? 0 : tiltDeg(a.id)
  const isCancelled = a.kind === 'cancelled'
  const isChange = a.kind === 'change'

  const noteStyle: React.CSSProperties = {
    background: bg,
    backgroundImage: 'repeating-linear-gradient(transparent 0 23px, rgba(43,10,46,.08) 23px 24px)',
    transform: `rotate(${tilt}deg)`,
    ...(fullWidth ? { width: '100%' } : {}),
    ...(isCancelled ? { borderLeft: '3px solid #D7263D' } : {}),
    ...(isChange && !isCancelled ? { borderLeft: '3px solid #7C4DDB' } : {}),
  }

  const kindTag = KIND_LABELS[a.kind] ?? `★ ${a.kind.toUpperCase()}`

  return (
    <div className="hangout-board__note" style={noteStyle}>
      {/* Pin or Pinned tag */}
      {a.is_pinned ? (
        <div className="hangout-board__pinned-tag">PINNED</div>
      ) : (
        <div
          className="hangout-board__pin"
          style={{
            background: `radial-gradient(circle at 35% 35%, ${pinColor}cc, ${pinColor})`,
          }}
        />
      )}

      {/* Kind tag */}
      <div style={{ marginBottom: 6 }}>
        {isCancelled ? (
          <span
            className="hangout-board__cancelled-tag font-silkscreen"
            style={{ fontFamily: "'Silkscreen', monospace", fontSize: 9, letterSpacing: '0.05em' }}
          >
            {kindTag}
          </span>
        ) : (
          <span
            className="font-silkscreen"
            style={{ fontFamily: "'Silkscreen', monospace", fontSize: 9, letterSpacing: '0.05em', color: '#7C4DDB' }}
          >
            {kindTag}
          </span>
        )}
        {a.isNew && (
          <span
            className="hangout-board__new-chip font-silkscreen"
            style={{
              marginLeft: 6,
              background: '#FF4FA3',
              color: 'white',
              fontFamily: "'Silkscreen', monospace",
              fontSize: 8,
              padding: '1px 5px',
              border: '2px solid #2B0A2E',
              borderRadius: 3,
              letterSpacing: '0.05em',
            }}
          >
            NEW!
          </span>
        )}
      </div>

      {/* rsvpHighlight */}
      {rsvpHighlight && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF4FA3', display: 'inline-block', flexShrink: 0 }} />
          <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, color: '#E0007A', fontWeight: 700 }}>
            about a hangout you RSVPed to
          </span>
        </div>
      )}

      {/* Flyer image */}
      {a.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={a.image_url}
          alt=""
          aria-hidden="true"
          style={{ width: '100%', borderRadius: 4, marginBottom: 8, display: 'block', border: '1.5px solid rgba(43,10,46,.1)' }}
        />
      )}

      {/* Title */}
      <h3 style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: 17, color: '#2B0A2E', marginBottom: 6, lineHeight: 1.3 }}>
        {a.title}
      </h3>

      {/* Body */}
      {a.body.length > 180 ? (
        <details style={{ marginBottom: 8 }}>
          <summary style={{ fontFamily: 'Nunito, sans-serif', fontSize: 15, color: '#3A0030', cursor: 'pointer', listStyle: 'none', userSelect: 'none' }}>
            {a.body.slice(0, 160)}…{' '}
            <span style={{ color: '#FF4FA3', fontWeight: 700, fontSize: 12 }}>read more</span>
          </summary>
          <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 15, color: '#3A0030' }}>
            {a.body}
          </span>
        </details>
      ) : (
        <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 15, color: '#3A0030', marginBottom: 8, lineHeight: 1.5 }}>
          {a.body}
        </p>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
        <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, color: '#888' }}>{a.when}</span>
        {a.hangout && (
          <Link
            href={`/hangouts/${a.hangout.id}`}
            className="btn-y2k"
            style={{ fontSize: 11, padding: '3px 10px' }}
          >
            see the hangout →
          </Link>
        )}
      </div>

      {/* Folded corner */}
      <div className="hangout-board__folded-corner" />
    </div>
  )
}
