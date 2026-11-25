import Link from 'next/link'
import type { AnnouncementWithMeta } from '@/lib/announcements'
import AnnouncementNote from './AnnouncementNote'

interface Props {
  announcements: AnnouncementWithMeta[]
  variant: 'full' | 'compact'
  rsvpHangoutIds?: string[]
}

const EMPTY_NOTE: AnnouncementWithMeta = {
  id: 'empty-placeholder',
  title: 'no announcements yet ✦',
  body: 'the next journal hangout will be pinned here first.',
  kind: 'news',
  note_color: 'yellow',
  is_pinned: false,
  publish_at: new Date().toISOString(),
  hangout: null,
  isNew: false,
  when: '',
}

export default function AnnouncementBoard({ announcements, variant, rsvpHangoutIds }: Props) {
  const isEmpty = announcements.length === 0

  return (
    <section aria-labelledby="hb-heading" id="board" className="mb-8">
      <h2 id="hb-heading" className="sr-only">Hangout announcements</h2>
      <div className="hb-frame">
        <div className="hb-frame-head">
          <span className="hb-frame-title">✦ the hangout board</span>
          <span className="hb-frame-sub">announcements, reminders &amp; photos ♡</span>
        </div>
        <div className="hangout-board__cork">
          {variant === 'full' ? (
            isEmpty ? (
              <div className="hangout-board__notes-full">
                <AnnouncementNote a={EMPTY_NOTE} noTilt={false} />
              </div>
            ) : (
              <div className="hangout-board__notes-full">
                {announcements.slice(0, 12).map((a) => (
                  <AnnouncementNote
                    key={a.id}
                    a={a}
                    rsvpHighlight={rsvpHangoutIds ? (a.hangout?.id ? rsvpHangoutIds.includes(a.hangout.id) : false) : false}
                  />
                ))}
              </div>
            )
          ) : (
            /* compact — only render when not empty */
            !isEmpty && (
              <div className="hangout-board__notes-compact">
                {announcements.slice(0, 3).map((a) => (
                  <AnnouncementNote
                    key={a.id}
                    a={a}
                    rsvpHighlight={rsvpHangoutIds ? (a.hangout?.id ? rsvpHangoutIds.includes(a.hangout.id) : false) : false}
                  />
                ))}
              </div>
            )
          )}
        </div>
      </div>
      {variant === 'compact' && !isEmpty && (
        <Link href="/hangouts#board" className="hangout-board__see-all">
          see all announcements →
        </Link>
      )}
    </section>
  )
}
