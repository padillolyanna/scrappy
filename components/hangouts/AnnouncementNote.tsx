import Link from 'next/link'
import type { AnnouncementWithMeta } from '@/lib/announcements'


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
  const pinColor = PIN_COLOR[a.note_color] ?? '#FF4FA3'
  const tilt = noTilt ? 0 : tiltDeg(a.id)
  const isCancelled = a.kind === 'cancelled'
  const isChange = a.kind === 'change'
  const kindTag = KIND_LABELS[a.kind] ?? `★ ${a.kind.toUpperCase()}`

  const textContent = (
    <>
      <p className="hbn-kind">
        <span className={isCancelled ? 'hbn-kind-tag hbn-kind-tag--cancel' : 'hbn-kind-tag'}>{kindTag}</span>
        {a.isNew && <span className="hbn-new">NEW!</span>}
      </p>
      {rsvpHighlight && <p className="hbn-rsvp">♥ about a hangout you RSVPed to</p>}
      <h3 className="hbn-title">{a.title}</h3>
      {a.body.length > 180 ? (
        <details className="hbn-body">
          <summary>{a.body.slice(0, 160)}… <b>read more</b></summary>
          <p>{a.body}</p>
        </details>
      ) : (
        <p className="hbn-body">{a.body}</p>
      )}
      <footer className="hbn-foot">
        {a.when && <time>{a.when}</time>}
        {a.hangout && <Link href={`/hangouts/${a.hangout.id}`} className="hbn-link">see the hangout →</Link>}
      </footer>
    </>
  )

  return (
    <article className={`hbn hbn--${a.note_color} ${a.image_url ? 'hbn--photo' : ''} ${isCancelled ? 'hbn--cancelled' : ''} ${isChange ? 'hbn--change' : ''}`} style={{ rotate: `${tilt}deg`, ...(fullWidth ? { width: '100%', maxWidth: 'none' } : {}) }}>
      {a.is_pinned ? <span className="hbn-pinned">PINNED</span> : <span className="hbn-pin" style={{ ['--pin' as string]: pinColor }} aria-hidden="true" />}

      {a.image_url ? (
        <>
          <a href={a.image_url} target="_blank" rel="noopener noreferrer" className="hbn-photo" aria-label={`open the picture for ${a.title}`}>
            <span className="hbn-tape" aria-hidden="true" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={a.image_url} alt="" loading="lazy" />
          </a>
          <div className="hbn-content">{textContent}</div>
        </>
      ) : (
        textContent
      )}
    </article>
  )
}
