// MySpace-style profile layout. Pure render (no hooks) so it works both on the
// server-rendered profile page and inside the live preview of the editor.

import type React from 'react'
import Link from 'next/link'
import { SCRAPBOOK_COVERS } from '@/lib/types'
import { fontCss } from '@/lib/notebook'
import {
  BODY_FONTS, backgroundStyle, nameStyle, spotifyEmbed, youtubeId,
  type ProfileExtras, type ProfileStyle,
} from '@/lib/profileStyle'
import { Sticker, StickerDefs } from '@/components/notebook/Stickers'

export interface ProfileData {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  mood: string | null
  bio: string | null
  created_at: string
  last_seen_at: string | null
}
export interface MiniProfile { id: string; username: string; display_name: string | null; avatar_url: string | null }
export interface CommentData { id: string; body: string; created_at: string; author_id: string; author: MiniProfile | null }
export interface ScrapbookMini { id: string; title: string | null; cover_id: string; like_count: number | null }

interface Props {
  profile: ProfileData
  style: ProfileStyle
  extras: ProfileExtras
  scrapbooks: ScrapbookMini[]
  top8: MiniProfile[]
  comments: CommentData[]
  commentCount: number
  online: boolean
  /** buttons in the contact box (share, add to top 8, edit…) */
  contactSlot?: React.ReactNode
  /** the owner's pet (only passed when it may be shown) */
  petSlot?: React.ReactNode
  /** comment form */
  commentFormSlot?: React.ReactNode
  /** per-comment controls (delete) */
  commentControls?: (c: CommentData) => React.ReactNode
  preview?: boolean
}

function rgba(hex: string, a: number) {
  let h = hex.replace('#', '')
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  const n = parseInt(h.slice(0, 6), 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}

function Avatar({ p, size }: { p: { username: string; avatar_url: string | null }; size: number | 'fill' }) {
  const dim = size === 'fill' ? '100%' : size
  return p.avatar_url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={p.avatar_url} alt={`@${p.username}`} style={{ width: dim, height: dim, objectFit: 'cover', display: 'block' }} />
  ) : (
    <div style={{ width: dim, height: dim, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#FF9ECF,#C9A2FF)', color: '#fff', fontFamily: "'Chango', 'Arial Black', sans-serif", fontSize: size === 'fill' ? 28 : size * 0.4 }}>
      {p.username.charAt(0).toUpperCase()}
    </div>
  )
}

const DECOR_SPOTS: React.CSSProperties[] = [
  { left: -18, top: 70, width: 46, height: 46, rotate: '-12deg' },
  { right: -16, top: 40, width: 40, height: 40, rotate: '14deg' },
  { left: -14, top: '42%', width: 36, height: 36, rotate: '8deg' },
  { right: -20, top: '55%', width: 48, height: 48, rotate: '-8deg' },
  { left: -16, bottom: 120, width: 42, height: 42, rotate: '10deg' },
  { right: -14, bottom: 60, width: 38, height: 38, rotate: '-14deg' },
  { left: '40%', top: -18, width: 34, height: 34, rotate: '6deg' },
  { left: '30%', bottom: -16, width: 40, height: 40, rotate: '-6deg' },
]

interface PanelCtx { s: ProfileStyle; radius: number; headerGloss: string; body: string; fs: number }

function Panel({
  title, right, children, id, ctx: { s, radius, headerGloss, body, fs },
}: {
  title: string; right?: React.ReactNode; children: React.ReactNode; id?: string; ctx: PanelCtx
}) {
  return (
    <section
      id={id}
      style={{
        border: `2px solid ${s.borderColor}`,
        borderRadius: radius,
        background: rgba(s.panelBg, s.panelOpacity),
        color: s.panelText,
        overflow: 'hidden',
        boxShadow: s.boxStyle === 'bevel' ? 'inset 0 1px 0 rgba(255,255,255,.7), 3px 3px 0 rgba(0,0,0,.35)' : '0 2px 10px rgba(0,0,0,.25)',
      }}
    >
      <header
        style={{
          background: headerGloss, color: s.headerText, padding: '4px 10px', display: 'flex', alignItems: 'baseline',
          justifyContent: 'space-between', gap: 8, fontFamily: 'Verdana, Tahoma, sans-serif', fontWeight: 700, fontSize: 14,
          borderBottom: `2px solid ${s.borderColor}`,
        }}
      >
        <span>{title}</span>
        {right && <span style={{ fontSize: 12, fontWeight: 400 }}>{right}</span>}
      </header>
      <div style={{ padding: 10, fontFamily: body, fontSize: fs, lineHeight: 1.4 }}>{children}</div>
    </section>
  )
}

export default function ProfileLayout({
  profile, style: s, extras: x, scrapbooks, top8, comments, commentCount, online, petSlot,
  contactSlot, commentFormSlot, commentControls, preview,
}: Props) {
  const name = profile.display_name || profile.username
  const body = BODY_FONTS.find((f) => f.id === s.bodyFont)?.css ?? BODY_FONTS[0].css
  const radius = s.boxStyle === 'rounded' ? 12 : s.boxStyle === 'bevel' ? 6 : 0
  const headerGloss = `linear-gradient(180deg, rgba(255,255,255,.45) 0%, rgba(255,255,255,.1) 50%, rgba(0,0,0,.06) 100%), ${s.headerBg}`
  const handwriting = s.bodyFont === 'caveat' || s.bodyFont === 'gochi'
  const fs = handwriting ? 18 : 13

  const ctx: PanelCtx = { s, radius, headerGloss, body, fs }

  const linkStyle: React.CSSProperties = { color: s.linkColor, fontWeight: 700 }
  const lastLogin = profile.last_seen_at ? new Date(profile.last_seen_at) : null
  const ytId = x.song.url ? youtubeId(x.song.url) : null
  const spot = x.song.url ? spotifyEmbed(x.song.url) : null
  const interests = ([
    ['General', x.interests.general], ['Music', x.interests.music], ['Movies', x.interests.movies], ['Television', x.interests.tv], ['Books', x.interests.books],
  ] as const).filter(([, v]) => v.trim())

  const sidebar = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* photo + details */}
      <div style={{ display: 'flex', gap: 12, color: s.panelText }}>
        <div style={{ flexShrink: 0, width: 162 }}>
          <div style={{ border: `3px solid ${s.borderColor}`, background: '#fff', padding: 3, boxShadow: '0 3px 12px rgba(0,0,0,.35)', width: 162, boxSizing: 'border-box' }}>
            <Avatar p={profile} size={150} />
          </div>
          <div style={{ fontFamily: 'Verdana, sans-serif', fontSize: 12, textAlign: 'center', marginTop: 4, color: s.panelText, background: rgba(s.panelBg, s.panelOpacity), border: `1px solid ${s.borderColor}`, padding: '1px 4px' }}>
            View My: <a href="#scrapbooks" style={linkStyle}>Scrapbooks</a> | <a href="#comments" style={linkStyle}>Comments</a>
          </div>
        </div>
        <div
          style={{
            fontFamily: 'Verdana, Tahoma, sans-serif', fontSize: 12, lineHeight: 1.45, flex: 1, minWidth: 0,
            background: rgba(s.panelBg, Math.min(1, s.panelOpacity)), border: `2px solid ${s.borderColor}`, borderRadius: radius, padding: 8,
          }}
        >
          {x.headline && <div style={{ fontStyle: 'italic', marginBottom: 8 }}>&ldquo;{x.headline}&rdquo;</div>}
          {profile.mood && <div><b>Mood:</b> {profile.mood}</div>}
          {x.location && <div>{x.location}</div>}
          <div style={{ marginTop: 8 }}>
            {online ? (
              <span style={{ color: '#1FA81F', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <svg width="12" height="16" viewBox="0 0 12 16" aria-hidden><circle cx="6" cy="4" r="3.2" fill="#FF8A00" /><path d="M1 15c0-4 2-7 5-7s5 3 5 7z" fill="#FF8A00" /></svg>
                Online Now!
              </span>
            ) : lastLogin ? (
              <span>Last Login:<br />{lastLogin.toLocaleDateString('en-US')}</span>
            ) : null}
          </div>
          <div style={{ marginTop: 6, opacity: 0.75, fontSize: 12 }}>
            member since {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </div>
        </div>
      </div>

      {petSlot && <Panel ctx={ctx} title={`${name}'s Little Pet ♡`}>{petSlot}</Panel>}

      {contactSlot && <Panel ctx={ctx} title={`Contacting ${name}`}><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{contactSlot}</div></Panel>}

      <Panel ctx={ctx} title="About Me">
        <div style={{ whiteSpace: 'pre-wrap' }}>{x.aboutMe || profile.bio || <i style={{ opacity: 0.6 }}>nothing here yet ✦</i>}</div>
      </Panel>

      {x.show.meet && x.whoToMeet.trim() && (
        <Panel ctx={ctx} title="Who I'd Like to Meet"><div style={{ whiteSpace: 'pre-wrap' }}>{x.whoToMeet}</div></Panel>
      )}

      {x.show.music && (x.song.title || x.song.url) && (
        <Panel ctx={ctx} title="My Music">
          <div style={{ background: 'linear-gradient(#f4f4f6,#dcdde3)', border: '1px solid #9aa', borderRadius: 4, padding: 8, color: '#222', fontFamily: 'Verdana, sans-serif' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 28, border: '1px solid #777', borderRadius: 3, background: 'linear-gradient(#fff,#cfd2d9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-hidden>
                <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 1l9 5-9 5z" fill="#333" /></svg>
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{x.song.title || 'my song'}</div>
                {x.song.artist && <div style={{ fontSize: 12, color: '#555' }}>{x.song.artist}</div>}
              </div>
            </div>
            {(ytId || spot) && !preview ? (
              <iframe
                title={`${x.song.title || 'song'} player`}
                src={ytId ? `https://www.youtube-nocookie.com/embed/${ytId}` : spot!}
                style={{ width: '100%', height: ytId ? 150 : 80, border: 0, marginTop: 8, borderRadius: 6, display: 'block' }}
                allow="encrypted-media; picture-in-picture"
                loading="lazy"
              />
            ) : (
              <div style={{ marginTop: 8, height: 6, borderRadius: 3, background: 'linear-gradient(90deg,#888 0 4%, #ccc 4%)' }} />
            )}
          </div>
        </Panel>
      )}

      {x.show.interests && interests.length > 0 && (
        <Panel ctx={ctx} title={`${name}'s Interests`}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 4px' }}>
            <tbody>
              {interests.map(([k, v]) => (
                <tr key={k}>
                  <td style={{ verticalAlign: 'top', width: 84, fontWeight: 700, background: rgba(s.headerBg, 0.25), padding: '3px 6px', fontFamily: 'Verdana, sans-serif', fontSize: 12 }}>{k}</td>
                  <td style={{ padding: '3px 6px', whiteSpace: 'pre-wrap' }}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}
    </div>
  )

  const main = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ border: `2px solid ${s.borderColor}`, borderRadius: radius, background: rgba(s.panelBg, s.panelOpacity), color: s.panelText, padding: '12px 14px', fontFamily: 'Verdana, sans-serif', fontSize: 15, fontWeight: 700, textAlign: 'center' }}>
        {name} is in your extended network ✦
      </div>

      {x.show.top8 && top8.length > 0 && (
        <Panel ctx={ctx} title={`${name}'s Top ${top8.length}`} right={<span>({top8.length} besties)</span>}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 8 }}>
            {top8.map((f) => (
              <Link key={f.id} href={`/profile/${f.username}`} style={{ textAlign: 'center', textDecoration: 'none' }}>
                <div style={{ border: `2px solid ${s.borderColor}`, background: '#fff', aspectRatio: '1', overflow: 'hidden' }}>
                  <Avatar p={f} size="fill" />
                </div>
                <div style={{ ...linkStyle, fontFamily: 'Verdana, sans-serif', fontSize: 12, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {f.display_name || f.username}
                </div>
              </Link>
            ))}
          </div>
        </Panel>
      )}

      {x.show.scrapbooks && (
        <Panel ctx={ctx} id="scrapbooks" title={`${name}'s Scrapbooks`} right={<span>{scrapbooks.length} public</span>}>
          {scrapbooks.length ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 8 }}>
              {scrapbooks.map((sb) => {
                const cover = SCRAPBOOK_COVERS.find((c) => c.id === sb.cover_id)
                return (
                  <Link key={sb.id} href={`/scrapbook/${sb.id}`} style={{ textDecoration: 'none', color: s.panelText }}>
                    <div className={`bg-gradient-to-br ${cover?.bg_gradient ?? 'from-pink-200 to-pink-100'}`} style={{ height: 72, border: `2px solid ${s.borderColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: 'rgba(58,0,48,.3)' }}>
                      {cover?.preview_symbol ?? '✦'}
                    </div>
                    <div style={{ fontSize: 12, fontFamily: 'Verdana, sans-serif', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: s.linkColor, fontWeight: 700 }}>{sb.title || 'untitled'}</div>
                    <div style={{ fontSize: 12, opacity: 0.7, fontFamily: 'Verdana, sans-serif' }}>♡ {sb.like_count ?? 0}</div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <i style={{ opacity: 0.6 }}>no public scrapbooks yet ✦</i>
          )}
        </Panel>
      )}

      {x.show.comments && (
        <Panel ctx={ctx} id="comments" title={`${name}'s Friends Comments`} right={<span>displaying {comments.length} of {commentCount} comments</span>}>
          {commentFormSlot}
          {comments.length === 0 && <i style={{ opacity: 0.6, display: 'block', padding: '6px 0' }}>no comments yet — be the first ♡</i>}
          <div>
            {comments.map((c) => (
              <div key={c.id} style={{ display: 'flex', gap: 10, padding: '8px 0', borderTop: `1px solid ${rgba(s.borderColor, 0.4)}` }}>
                <Link href={c.author ? `/profile/${c.author.username}` : '#'} style={{ flexShrink: 0, textAlign: 'center', width: 64, textDecoration: 'none' }}>
                  <div style={{ border: `2px solid ${s.borderColor}` }}>{c.author ? <Avatar p={c.author} size={60} /> : <div style={{ width: 60, height: 60, background: '#ccc' }} />}</div>
                </Link>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
                    <Link href={c.author ? `/profile/${c.author.username}` : '#'} style={{ ...linkStyle, fontFamily: 'Verdana, sans-serif', fontSize: 13 }}>
                      {c.author?.display_name || c.author?.username || 'someone'}
                    </Link>
                    <span style={{ fontSize: 12, opacity: 0.65, fontFamily: 'Verdana, sans-serif' }}>
                      {new Date(c.created_at).toLocaleString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </span>
                    <span style={{ marginLeft: 'auto' }}>{commentControls?.(c)}</span>
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', marginTop: 2 }}>{c.body}</div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  )

  return (
    <div className="pf-wrap" style={{ ...backgroundStyle(s), position: 'relative', padding: preview ? '18px 22px 30px' : '22px 26px 40px', minHeight: preview ? 0 : 600 }}>
      <StickerDefs />
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 14, position: 'relative', zIndex: 1 }}>
        <h1 style={{ ...nameStyle(s, fontCss(s.nameFont)), fontSize: 38, margin: 0 }}>{name}</h1>
        {s.tagline && (
          <div style={{ fontFamily: "'Pacifico', cursive", fontSize: 18, color: s.nameColor, textShadow: '0 0 6px rgba(0,0,0,.5), 0 0 1px #fff' }}>{s.tagline}</div>
        )}
      </div>

      <div className="pf-grid" style={{ position: 'relative', zIndex: 1 }} data-side={s.sidebar}>
        <div className="pf-side">{sidebar}</div>
        <div className="pf-main">{main}</div>
      </div>

      {s.footerQuote && (
        <div style={{ position: 'relative', zIndex: 1, marginTop: 18, fontFamily: "'Pacifico', cursive", fontSize: 22, color: s.nameColor, textShadow: '0 0 8px rgba(0,0,0,.45), 0 0 1px #fff' }}>
          {s.footerQuote}
        </div>
      )}

      {/* decor stickers around the edges */}
      {s.decor.map((d, i) => {
        const spot = DECOR_SPOTS[i % DECOR_SPOTS.length]
        return (
          <div key={`${d}-${i}`} aria-hidden style={{ position: 'absolute', ...spot, pointerEvents: 'none', zIndex: 2, animationDelay: `${i * 0.35}s` }} className="animate-twinkle">
            <Sticker content={d} />
          </div>
        )
      })}
    </div>
  )
}
