'use client'

import { useState } from 'react'
import { compressImage } from '@/lib/notebook'
import {
  BLOCK_TYPES, MAX_BLOCKS, SKIN_LABEL, newBlock, safeUrl,
  type BlockType, type ProfileBlock, type ProfileLink,
} from '@/lib/profileStyle'

/* Editor for the stack of blocks on a profile page, plus the link chips.
   Photos are compressed and uploaded through `upload` (returns a public url). */

const SWATCHES = ['#FF4FA3', '#C9A2FF', '#6FC3FF', '#7FE3B8', '#FFE14D', '#FF8C42', '#D7263D', '#2B0A2E']

export default function BlocksEditor({
  blocks, links, onBlocks, onLinks, upload, accent,
}: {
  blocks: ProfileBlock[]
  links: ProfileLink[]
  onBlocks: (b: ProfileBlock[]) => void
  onLinks: (l: ProfileLink[]) => void
  upload: (dataUrl: string) => Promise<string>
  accent: string
}) {
  const [open, setOpen] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [err, setErr] = useState('')

  const set = (id: string, patch: Partial<ProfileBlock>) => onBlocks(blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)))
  const move = (i: number, d: -1 | 1) => {
    const j = i + d
    if (j < 0 || j >= blocks.length) return
    const n = [...blocks]; [n[i], n[j]] = [n[j], n[i]]; onBlocks(n)
  }
  const add = (t: BlockType) => {
    const b = newBlock(t, accent)
    onBlocks([...blocks, b]); setOpen(b.id); setAdding(false)
  }
  async function addPhotos(b: ProfileBlock, files: FileList | null, max: number) {
    if (!files?.length) return
    setBusyId(b.id); setErr('')
    try {
      const urls: string[] = []
      for (const f of Array.from(files).slice(0, max - b.photos.length)) {
        if (!f.type.startsWith('image/')) continue
        urls.push(await upload(await compressImage(f, 1000, 0.85)))
      }
      set(b.id, { photos: [...b.photos, ...urls].slice(0, max) })
    } catch {
      setErr("Couldn't upload that photo. Try a smaller one.")
    }
    setBusyId(null)
  }

  return (
    <div className="space-y-4">
      {/* link chips */}
      <section>
        <div className="font-silkscreen text-[12px] text-[#D4006E] mb-1.5">MY LINKS ({links.length}/6)</div>
        <p className="font-nunito text-xs text-[#5E3A5A] mb-2">Shown as little chips under your name: Instagram, TikTok, Discord, Spotify…</p>
        {links.map((l, i) => (
          <div key={i} className="flex gap-1 mb-1">
            <input className="input-mini w-[38%]" placeholder="label" maxLength={30} value={l.label} onChange={(e) => onLinks(links.map((x, k) => (k === i ? { ...x, label: e.target.value } : x)))} aria-label={`link ${i + 1} label`} />
            <input className="input-mini flex-1" placeholder="https://…" defaultValue={l.url} onBlur={(e) => onLinks(links.map((x, k) => (k === i ? { ...x, url: safeUrl(e.target.value) } : x)))} aria-label={`link ${i + 1} url`} />
            <button className="pf-btn" onClick={() => onLinks(links.filter((_, k) => k !== i))} aria-label={`remove link ${i + 1}`}>✕</button>
          </div>
        ))}
        {links.length < 6 && (
          <form
            className="flex gap-1"
            onSubmit={(e) => {
              e.preventDefault()
              const f = e.currentTarget
              const url = safeUrl((f.elements.namedItem('u') as HTMLInputElement).value)
              if (!url) { setErr('Links must start with https://'); return }
              onLinks([...links, { label: (f.elements.namedItem('l') as HTMLInputElement).value.slice(0, 30), url }])
              f.reset(); setErr('')
            }}
          >
            <input name="l" className="input-mini w-[38%]" placeholder="label" maxLength={30} aria-label="new link label" />
            <input name="u" className="input-mini flex-1" placeholder="https://instagram.com/…" aria-label="new link url" />
            <button className="pf-btn" type="submit">+ add</button>
          </form>
        )}
      </section>

      {/* blocks */}
      <section>
        <div className="font-silkscreen text-[12px] text-[#D4006E] mb-1.5">MY BLOCKS ({blocks.length}/{MAX_BLOCKS})</div>
        <p className="font-nunito text-xs text-[#5E3A5A] mb-2">Stack text boxes, photo grids, lists and music players on your page. Use ▲▼ to reorder.</p>
        {err && <p className="font-nunito text-xs text-[#D4006E] mb-2" role="alert">{err}</p>}

        <ol className="space-y-2">
          {blocks.map((b, i) => {
            const def = BLOCK_TYPES.find((t) => t.id === b.type)!
            const isOpen = open === b.id
            return (
              <li key={b.id} className="border-2 border-[#2B0A2E] rounded-md bg-white overflow-hidden">
                <div className="flex items-center gap-1 px-2 py-1 bg-[#FFF0F7]">
                  <span className="w-3 h-3 rounded-sm border border-[#2B0A2E] flex-none" style={{ background: b.color }} />
                  <button className="flex-1 text-left font-nunito text-sm font-bold truncate" onClick={() => setOpen(isOpen ? null : b.id)} aria-expanded={isOpen}>
                    {def.label}{b.title ? `: ${b.title}` : ''}
                  </button>
                  <button className="pf-btn !px-1.5" onClick={() => move(i, -1)} disabled={i === 0} aria-label="move up">▲</button>
                  <button className="pf-btn !px-1.5" onClick={() => move(i, 1)} disabled={i === blocks.length - 1} aria-label="move down">▼</button>
                  <button className="pf-btn !px-1.5" onClick={() => onBlocks(blocks.filter((x) => x.id !== b.id))} aria-label="delete block">✕</button>
                </div>
                {isOpen && (
                  <div className="p-2 space-y-2 font-pixel text-base">
                    <div className="flex flex-wrap gap-1">
                      {def.skins.map((sk) => (
                        <button key={sk} onClick={() => set(b.id, { skin: sk })} className={`px-2 rounded border-2 border-[#2B0A2E] text-sm ${b.skin === sk ? 'bg-[#FF4FA3] text-white' : 'bg-white'}`}>{SKIN_LABEL[sk]}</button>
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-1">
                      {SWATCHES.map((c) => (
                        <button key={c} onClick={() => set(b.id, { color: c })} aria-label={`colour ${c}`} className={`w-6 h-6 rounded border-2 ${b.color === c ? 'border-[#FF4FA3] ring-2 ring-[#FF4FA3]' : 'border-[#2B0A2E]'}`} style={{ background: c }} />
                      ))}
                      <input type="color" value={b.color} onChange={(e) => set(b.id, { color: e.target.value })} className="w-7 h-6 border-2 border-[#2B0A2E] rounded p-0" aria-label="custom colour" />
                    </div>

                    {b.type !== 'quote' && (
                      <label className="block">{b.type === 'music' ? 'song title' : 'title'}
                        <input className="input-mini w-full" maxLength={60} value={b.title} onChange={(e) => set(b.id, { title: e.target.value })} />
                      </label>
                    )}
                    {b.type === 'music' && (
                      <>
                        <label className="block">artist<input className="input-mini w-full" maxLength={80} value={b.artist} onChange={(e) => set(b.id, { artist: e.target.value })} /></label>
                        <label className="block">link (Spotify, YouTube or .mp3)
                          <input className="input-mini w-full" placeholder="https://open.spotify.com/track/…" defaultValue={b.url} onBlur={(e) => set(b.id, { url: safeUrl(e.target.value) })} />
                        </label>
                      </>
                    )}
                    {(b.type === 'text' || b.type === 'quote' || b.type === 'card') && (
                      <label className="block">{b.type === 'card' ? 'a few more words' : 'text'}
                        <textarea className="w-full border-2 border-[#2B0A2E] rounded-md p-2 font-nunito text-sm bg-white" rows={b.type === 'quote' ? 2 : 4} maxLength={b.type === 'quote' ? 120 : 1500} value={b.body} onChange={(e) => set(b.id, { body: e.target.value })} />
                      </label>
                    )}
                    {(b.type === 'list' || b.type === 'card') && (
                      <div>
                        {b.type === 'card' ? 'short lines (name, age, sign…)' : 'items'}
                        {b.items.map((it, k) => (
                          <div key={k} className="flex gap-1 mb-1">
                            <input className="input-mini flex-1" maxLength={120} value={it} onChange={(e) => set(b.id, { items: b.items.map((x, n) => (n === k ? e.target.value : x)) })} aria-label={`item ${k + 1}`} />
                            <button className="pf-btn" onClick={() => set(b.id, { items: b.items.filter((_, n) => n !== k) })} aria-label={`remove item ${k + 1}`}>✕</button>
                          </div>
                        ))}
                        {b.items.length < 15 && <button className="pf-btn" onClick={() => set(b.id, { items: [...b.items, ''] })}>+ line</button>}
                      </div>
                    )}
                    {(b.type === 'photos' || b.type === 'card') && (
                      <div>
                        {b.type === 'card' ? 'photo' : `photos (${b.photos.length}/9)`}
                        <div className="flex flex-wrap gap-1 my-1">
                          {b.photos.map((p, k) => (
                            <div key={k} className="relative">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={p} alt="" className="w-12 h-12 object-cover border-2 border-[#2B0A2E] rounded" />
                              <button className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#FF4FA3] text-white text-xs border border-[#2B0A2E]" onClick={() => set(b.id, { photos: b.photos.filter((_, n) => n !== k) })} aria-label={`remove photo ${k + 1}`}>✕</button>
                            </div>
                          ))}
                        </div>
                        {b.photos.length < (b.type === 'card' ? 1 : 9) && (
                          <label className={`pf-btn inline-block cursor-pointer ${busyId === b.id ? 'opacity-50 pointer-events-none' : ''}`}>
                            {busyId === b.id ? 'uploading…' : '↑ upload'}
                            <input type="file" accept="image/*" multiple={b.type === 'photos'} className="sr-only" onChange={(e) => { const f = e.target.files; void addPhotos(b, f, b.type === 'card' ? 1 : 9); e.target.value = '' }} />
                          </label>
                        )}
                        <div className="flex gap-1 mt-1">
                          {(['square', 'rounded', 'circle'] as const).map((sh) => (
                            <button key={sh} onClick={() => set(b.id, { shape: sh })} className={`px-2 rounded border-2 border-[#2B0A2E] text-sm ${b.shape === sh ? 'bg-[#FF4FA3] text-white' : 'bg-white'}`}>{sh}</button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </li>
            )
          })}
        </ol>

        {blocks.length < MAX_BLOCKS && (adding ? (
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {BLOCK_TYPES.map((t) => (
              <button key={t.id} onClick={() => add(t.id)} className="text-left p-2 border-2 border-[#2B0A2E] rounded-md bg-white hover:bg-[#FFF3B0]">
                <div className="font-nunito text-sm font-bold">{t.label}</div>
                <div className="font-nunito text-xs text-[#5E3A5A]">{t.hint}</div>
              </button>
            ))}
            <button className="pf-btn col-span-2" onClick={() => setAdding(false)}>cancel</button>
          </div>
        ) : (
          <button className="btn-bevel text-sm !px-4 !py-1.5 mt-2" onClick={() => setAdding(true)}>+ add a block</button>
        ))}
      </section>
    </div>
  )
}
