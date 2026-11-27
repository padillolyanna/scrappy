// The blocks people stack on their page (text boxes, photo grids, lists, music
// players…). Pure render, no hooks, so it works on the server-rendered profile
// and in the editor's live preview.

import type React from 'react'
import { linkKind, spotifyEmbed, youtubeId, type ProfileBlock, type ProfileLink } from '@/lib/profileStyle'

const isAudio = (url: string) => /\.(mp3|m4a|ogg|wav)(\?|$)/i.test(url)

function Embed({ url, preview, title }: { url: string; preview?: boolean; title: string }) {
  if (!url) return null
  const yt = youtubeId(url)
  const sp = spotifyEmbed(url)
  if (preview && (yt || sp)) return <div className="pb-embed-ph">♪ player shows on your live page</div>
  if (yt) return <iframe className="pb-embed pb-embed--yt" title={`${title} player`} src={`https://www.youtube-nocookie.com/embed/${yt}`} allow="encrypted-media; picture-in-picture" loading="lazy" />
  if (sp) return <iframe className="pb-embed" title={`${title} player`} src={sp} allow="encrypted-media" loading="lazy" />
  if (isAudio(url)) return <audio className="pb-audio" controls preload="none" src={url} />
  return <a className="pb-link" href={url} target="_blank" rel="noopener noreferrer nofollow">listen ↗</a>
}

function Photo({ src, shape, alt = '' }: { src: string; shape: ProfileBlock['shape']; alt?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} loading="lazy" className={`pb-photo pb-photo--${shape}`} />
}

function Frame({ b, children, label }: { b: ProfileBlock; children: React.ReactNode; label?: string }) {
  const style = { ['--bc' as string]: b.color } as React.CSSProperties
  const title = label ?? b.title
  if (b.skin === 'window') {
    return (
      <section className="pb pb--window" style={style}>
        <header className="pb-bar"><span>{title || ' '}</span><i aria-hidden="true">_ □ ×</i></header>
        <div className="pb-in">{children}</div>
      </section>
    )
  }
  return (
    <section className={`pb pb--${b.skin}`} style={style}>
      {b.skin === 'paper' && <span className="pb-tape" aria-hidden="true" />}
      {title && <h3 className="pb-title">{title}</h3>}
      {children}
    </section>
  )
}

function Music({ b, preview }: { b: ProfileBlock; preview?: boolean }) {
  const style = { ['--bc' as string]: b.color } as React.CSSProperties
  const name = b.title || 'my song'
  if (b.skin === 'cassette') {
    return (
      <section className="pb pb--cassette" style={style}>
        <div className="pb-cas-label">
          <b>『{name}』</b>
          {b.artist && <span>{b.artist}</span>}
        </div>
        <div className="pb-cas-window" aria-hidden="true"><i /><span /><i /></div>
        <div className="pb-cas-foot"><span>side a · stereo</span></div>
        <Embed url={b.url} preview={preview} title={name} />
      </section>
    )
  }
  if (b.skin === 'window') {
    return (
      <Frame b={b} label="now_playing.exe">
        <p className="pb-song"><b>♪ {name}</b>{b.artist && <span>{b.artist}</span>}</p>
        <Embed url={b.url} preview={preview} title={name} />
      </Frame>
    )
  }
  return (
    <section className="pb pb--player" style={style}>
      <div className="pb-player-row">
        <div className="pb-disc" aria-hidden="true" />
        <div className="pb-player-txt"><b>{name}</b>{b.artist && <span>{b.artist}</span>}</div>
        <span className="pb-player-btns" aria-hidden="true">◀◀ ▶ ▶▶</span>
      </div>
      <Embed url={b.url} preview={preview} title={name} />
    </section>
  )
}

export function ProfileBlockView({ b, preview }: { b: ProfileBlock; preview?: boolean }) {
  const items = b.items.filter((i) => i.trim())
  switch (b.type) {
    case 'music':
      return <Music b={b} preview={preview} />
    case 'quote':
      return <Frame b={b} label=""><p className="pb-quote">{b.body}</p></Frame>
    case 'photos':
      return (
        <Frame b={b}>
          {b.photos.length ? (
            <div className={`pb-grid pb-grid--${Math.min(b.photos.length, 3)}`}>
              {b.photos.map((p, i) => <Photo key={i} src={p} shape={b.shape} />)}
            </div>
          ) : <p className="pb-empty">add some photos ✦</p>}
        </Frame>
      )
    case 'list':
      return (
        <Frame b={b}>
          {items.length ? <ul className="pb-list">{items.map((t, i) => <li key={i}>{t}</li>)}</ul> : <p className="pb-empty">add a few things ✦</p>}
        </Frame>
      )
    case 'card':
      return (
        <Frame b={b}>
          <div className="pb-card">
            {b.photos[0] && <Photo src={b.photos[0]} shape={b.shape} />}
            <div className="pb-card-txt">
              {items.map((t, i) => <p key={i} className="pb-card-line">{t}</p>)}
              {b.body && <p className="pb-card-body">{b.body}</p>}
            </div>
          </div>
        </Frame>
      )
    default:
      return <Frame b={b}><p className="pb-body">{b.body || <span className="pb-empty">write something ✦</span>}</p></Frame>
  }
}

export function ProfileBlocks({ blocks, preview }: { blocks: ProfileBlock[]; preview?: boolean }) {
  if (!blocks.length) return null
  return <div className="pb-stack">{blocks.map((b) => <ProfileBlockView key={b.id} b={b} preview={preview} />)}</div>
}

export function LinkChips({ links }: { links: ProfileLink[] }) {
  if (!links.length) return null
  return (
    <div className="pb-chips">
      {links.map((l, i) => (
        <a key={i} href={l.url} target="_blank" rel="noopener noreferrer nofollow" className="pb-chip">
          <b aria-hidden="true">{linkKind(l.url)}</b>{l.label || l.url.replace(/^https:\/\/(www\.)?/, '').slice(0, 26)}
        </a>
      ))}
    </div>
  )
}
