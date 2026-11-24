'use client'

import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import type React from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'
import { createClient } from '@/lib/supabase-client'
import { revalidateProfile } from '@/app/actions/revalidateProfile'
import Footer from '@/components/layout/Footer'
import ProfileLayout, { type MiniProfile } from '@/components/profile/ProfileLayout'
import { STICKERS, Sticker, StickerDefs } from '@/components/notebook/Stickers'
import { FONTS, compressImage } from '@/lib/notebook'
import { uploadDataUrl } from '@/lib/notebookStore'
import {
  BG_PATTERNS, BODY_FONTS, DEFAULT_EXTRAS, DEFAULT_STYLE, NAME_EFFECTS, PRESETS,
  backgroundStyle, safeUrl, sanitizeExtras, sanitizeStyle,
  type ProfileExtras, type ProfileStyle,
} from '@/lib/profileStyle'

type Tab = 'info' | 'look' | 'boxes' | 'top8'
const TABS: { id: Tab; label: string }[] = [
  { id: 'look', label: '✦ look' },
  { id: 'boxes', label: '♪ boxes' },
  { id: 'top8', label: '♡ top 8' },
  { id: 'info', label: '✎ info' },
]
const SYMBOL_DECOR = ['txt:✦', 'txt:★', 'txt:♡', 'txt:✿', 'txt:♪', 'txt:☆']

export default function ProfileEditPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ProfileEditor />
    </Suspense>
  )
}

function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="font-pixel text-2xl text-[#888] animate-blink">loading your page…</div>
    </div>
  )
}

function ProfileEditor() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useSearchParams()
  const [tab, setTab] = useState<Tab>((params.get('tab') as Tab) || 'look')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const bgInputRef = useRef<HTMLInputElement>(null)

  const [username, setUsername] = useState('')
  const [createdAt, setCreatedAt] = useState(new Date(0).toISOString())
  const [info, setInfo] = useState({ display_name: '', bio: '', mood: '', favorite_color: '' })
  const [style, setStyle] = useState<ProfileStyle>(DEFAULT_STYLE)
  const [extras, setExtras] = useState<ProfileExtras>(DEFAULT_EXTRAS)
  const [friends, setFriends] = useState<MiniProfile[]>([])
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [busy, setBusy] = useState<'' | 'saving' | 'uploading'>('')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    async function load() {
      const supabase = createClient()
      const { data } = await supabase.from('profiles').select('*').eq('id', user!.id).single()
      if (cancelled) return
      if (data) {
        setUsername(data.username)
        setCreatedAt(data.created_at)
        setInfo({ display_name: data.display_name ?? '', bio: data.bio ?? '', mood: data.mood ?? '', favorite_color: data.favorite_color ?? '' })
        setAvatarUrl(data.avatar_url ?? null)
        const hasStyle = data.profile_style && Object.keys(data.profile_style).length > 0
        setStyle(hasStyle ? sanitizeStyle(data.profile_style) : DEFAULT_STYLE)
        const ex = sanitizeExtras(data.profile_extras)
        if (!data.profile_extras || Object.keys(data.profile_extras).length === 0) ex.aboutMe = data.bio ?? ''
        setExtras(ex)
        if (ex.top8.length) {
          const { data: fr } = await supabase.from('profiles').select('id, username, display_name, avatar_url').in('id', ex.top8)
          if (!cancelled) setFriends(ex.top8.map((id) => fr?.find((f) => f.id === id)).filter((f): f is MiniProfile => !!f))
        }
      }
      setLoadingProfile(false)
    }
    load()
    return () => { cancelled = true }
  }, [user])

  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const patchStyle = (p: Partial<ProfileStyle>) => { setStyle((s) => ({ ...s, ...p })); setDirty(true) }
  const patchExtras = (p: Partial<ProfileExtras>) => { setExtras((x) => ({ ...x, ...p })); setDirty(true) }
  const patchInfo = (p: Partial<typeof info>) => { setInfo((i) => ({ ...i, ...p })); setDirty(true) }

  function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) return setError('Image must be under 2MB.')
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
    setError('')
    setDirty(true)
  }

  async function handleBgUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !user) return
    setBusy('uploading')
    setError('')
    try {
      const data = await compressImage(file, 1600, 0.85)
      const url = await uploadDataUrl(createClient(), user.id, data)
      patchStyle({ bgImage: url })
    } catch {
      setError("Couldn't upload that background. Try a smaller image (and make sure the scrapbook-media bucket exists).")
    }
    setBusy('')
  }

  async function save() {
    if (!user) return
    setBusy('saving')
    setError('')
    const supabase = createClient()
    let newAvatar = avatarUrl
    if (avatarFile) {
      const ext = avatarFile.name.split('.').pop()
      const path = `${user.id}/avatar.${ext}`
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, avatarFile, { upsert: true })
      if (upErr) {
        setBusy('')
        return setError('Could not upload your photo. Make sure the avatars bucket exists in Supabase Storage.')
      }
      newAvatar = `${supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl}?v=${Date.now()}`
    }
    const { error: updErr } = await supabase
      .from('profiles')
      .update({
        display_name: info.display_name || null,
        bio: info.bio || null,
        mood: info.mood || null,
        favorite_color: info.favorite_color || null,
        avatar_url: newAvatar,
        profile_style: sanitizeStyle(style),
        profile_extras: sanitizeExtras({ ...extras, top8: friends.map((f) => f.id) }),
      })
      .eq('id', user.id)
    setBusy('')
    if (updErr) return setError(`Save failed: ${updErr.message} (code: ${updErr.code})`)
    setAvatarUrl(newAvatar)
    setAvatarFile(null)
    setDirty(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
    // Bust the Router Cache so the profile page shows fresh data on next visit
    await revalidateProfile(username)
  }

  const previewProfile = useMemo(
    () => ({
      id: user?.id ?? 'me',
      username: username || 'you',
      display_name: info.display_name || null,
      avatar_url: avatarPreview || avatarUrl,
      mood: info.mood || null,
      bio: info.bio || null,
      created_at: createdAt,
      last_seen_at: null,
    }),
    [user, username, info, avatarPreview, avatarUrl, createdAt],
  )

  if (loading || (user && loadingProfile)) return <Loading />
  if (!user) {
    router.push('/auth/login')
    return null
  }

  const saveBar = (
    <div className="flex items-center gap-2 flex-wrap">
      <button onClick={save} disabled={!!busy} className="btn-bevel text-sm !px-4 !py-1.5">
        {busy === 'saving' ? 'saving…' : busy === 'uploading' ? 'uploading…' : 'save my page ✦'}
      </button>
      {username && <Link href={`/profile/${username}`} className="btn-outline-y2k text-xs !px-3 !py-1">view page</Link>}
      {saved && <span className="font-pixel text-lg text-[#1FA81F]" role="status">✓ saved!</span>}
      {dirty && !saved && <span className="font-pixel text-lg text-[#D4006E]">● unsaved</span>}
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 py-6 px-3">
        <StickerDefs />
        <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
          <div>
            <h1 className="font-chango text-2xl text-[#FF4FA3]" style={{ WebkitTextStroke: '1px #2B0A2E', textShadow: '2px 2px 0 #fff' }}>customize my page</h1>
            <p className="font-pixel text-lg text-[#7C4DDB]">pick a layout, then make it yours — the preview updates as you go ✦</p>
          </div>
          {saveBar}
        </div>

        {error && <div className="bg-[#FFE4F0] border-2 border-[#D4006E] rounded-lg px-4 py-2 mb-3 font-nunito text-sm text-[#D4006E]" role="alert">{error}</div>}

        <div className="grid gap-4 lg:grid-cols-[330px_minmax(0,1fr)] items-start">
          {/* ── controls ── */}
          <div className="widget-box-full">
            <div className="flex flex-wrap border-b-2 border-[#2B0A2E] bg-[#2B0A2E] gap-px">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex-1 px-1 py-2 font-pixel text-lg leading-none whitespace-nowrap ${tab === t.id ? 'bg-[#FF4FA3] text-white' : 'bg-[#3d1640] text-[#FFB6D9] hover:bg-[#55205a]'}`}
                  aria-pressed={tab === t.id}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="p-3 space-y-4 lg:max-h-[78vh] lg:overflow-y-auto">
              {tab === 'look' && (
                <>
                  <Section title="LAYOUTS">
                    <div className="grid grid-cols-2 gap-2">
                      {PRESETS.map((p) => {
                        const ps = { ...DEFAULT_STYLE, ...p.style, preset: p.id }
                        return (
                          <button
                            key={p.id}
                            onClick={() => patchStyle({ ...ps, bgImage: style.bgImage && !p.style.bgImage ? '' : ps.bgImage })}
                            className={`rounded-md border-2 overflow-hidden text-left ${style.preset === p.id ? 'border-[#FF4FA3] ring-2 ring-[#FF4FA3]' : 'border-[#2B0A2E]'}`}
                          >
                            <div style={{ ...backgroundStyle(ps), height: 54, padding: 6, position: 'relative' }}>
                              <div style={{ background: ps.headerBg, height: 8, width: '60%', border: `1px solid ${ps.borderColor}` }} />
                              <div style={{ background: ps.panelBg, height: 22, width: '60%', border: `1px solid ${ps.borderColor}`, borderTop: 0 }} />
                              <div style={{ position: 'absolute', right: 6, top: 6, width: 22, height: 22 }}><Sticker content={ps.decor[0] ?? 'svg:star'} /></div>
                            </div>
                            <div className="font-pixel text-base px-1.5 py-0.5 bg-white">{p.label}</div>
                          </button>
                        )
                      })}
                    </div>
                  </Section>

                  <Section title="BACKGROUND">
                    <ColorRow label="colour" value={style.bgColor} onChange={(v) => patchStyle({ bgColor: v })} />
                    <div className="grid grid-cols-4 gap-1.5 my-2">
                      {BG_PATTERNS.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => patchStyle({ bgPattern: p.id })}
                          title={p.label}
                          className={`h-11 rounded border-2 flex items-end ${style.bgPattern === p.id ? 'border-[#FF4FA3] ring-2 ring-[#FF4FA3]' : 'border-[#2B0A2E]'}`}
                          style={backgroundStyle({ ...style, bgPattern: p.id, bgImage: '' })}
                        >
                          <span className="font-pixel text-sm leading-none bg-white/85 px-1 w-full">{p.label}</span>
                        </button>
                      ))}
                    </div>
                    {style.bgPattern !== 'none' && <ColorRow label="pattern colour" value={style.patternColor} onChange={(v) => patchStyle({ patternColor: v })} />}
                    <div className="mt-2 space-y-1.5">
                      <div className="flex gap-2 items-center">
                        <button className="pf-btn" onClick={() => bgInputRef.current?.click()} disabled={busy === 'uploading'}>
                          {busy === 'uploading' ? 'uploading…' : '↑ upload background image'}
                        </button>
                        {style.bgImage && <button className="pf-btn" onClick={() => patchStyle({ bgImage: '' })}>remove</button>}
                      </div>
                      <input
                        className="input-mini w-full"
                        placeholder="…or paste an https:// image link"
                        defaultValue={style.bgImage}
                        key={style.bgImage}
                        onBlur={(e) => patchStyle({ bgImage: safeUrl(e.target.value) })}
                        aria-label="background image link"
                      />
                      {style.bgImage && (
                        <Seg value={style.bgImageMode} options={[['tile', 'tile it'], ['cover', 'stretch to fill']]} onChange={(v) => patchStyle({ bgImageMode: v as ProfileStyle['bgImageMode'] })} />
                      )}
                      <input ref={bgInputRef} type="file" accept="image/*" hidden onChange={handleBgUpload} />
                    </div>
                  </Section>

                  <Section title="YOUR NAME">
                    <select value={style.nameFont} onChange={(e) => patchStyle({ nameFont: e.target.value })} className="input-mini w-full" aria-label="name font">
                      {FONTS.map((f) => <option key={f.id} value={f.id} style={{ fontFamily: f.css }}>{f.label}</option>)}
                    </select>
                    <div className="flex flex-wrap gap-1 my-2">
                      {NAME_EFFECTS.map((e) => (
                        <button key={e.id} onClick={() => patchStyle({ nameEffect: e.id })} className={`font-pixel text-base px-2 rounded border-2 border-[#2B0A2E] ${style.nameEffect === e.id ? 'bg-[#FF4FA3] text-white' : 'bg-white'}`}>{e.label}</button>
                      ))}
                    </div>
                    <ColorRow label="name colour" value={style.nameColor} onChange={(v) => patchStyle({ nameColor: v })} />
                    <TextRow label="tagline (top right)" value={style.tagline} max={60} onChange={(v) => patchStyle({ tagline: v })} />
                    <TextRow label="quote (bottom)" value={style.footerQuote} max={60} onChange={(v) => patchStyle({ footerQuote: v })} />
                  </Section>

                  <Section title="BOXES">
                    <ColorRow label="box colour" value={style.panelBg} onChange={(v) => patchStyle({ panelBg: v })} />
                    <ColorRow label="text" value={style.panelText} onChange={(v) => patchStyle({ panelText: v })} />
                    <ColorRow label="header bar" value={style.headerBg} onChange={(v) => patchStyle({ headerBg: v })} />
                    <ColorRow label="header text" value={style.headerText} onChange={(v) => patchStyle({ headerText: v })} />
                    <ColorRow label="links" value={style.linkColor} onChange={(v) => patchStyle({ linkColor: v })} />
                    <ColorRow label="borders" value={style.borderColor} onChange={(v) => patchStyle({ borderColor: v })} />
                    <div className="mt-2"><Seg value={style.boxStyle} options={[['square', 'square'], ['rounded', 'rounded'], ['bevel', 'bevel']]} onChange={(v) => patchStyle({ boxStyle: v as ProfileStyle['boxStyle'] })} /></div>
                    <label className="flex items-center gap-2 mt-2 font-pixel text-base">
                      see-through
                      <input type="range" min={0.6} max={1} step={0.05} value={style.panelOpacity} onChange={(e) => patchStyle({ panelOpacity: Number(e.target.value) })} className="flex-1 accent-[#FF4FA3]" />
                    </label>
                    <select value={style.bodyFont} onChange={(e) => patchStyle({ bodyFont: e.target.value as ProfileStyle['bodyFont'] })} className="input-mini w-full mt-2" aria-label="text font">
                      {BODY_FONTS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
                    </select>
                    <div className="mt-2"><Seg value={style.sidebar} options={[['left', 'about me on left'], ['right', 'about me on right']]} onChange={(v) => patchStyle({ sidebar: v as ProfileStyle['sidebar'] })} /></div>
                  </Section>

                  <Section title={`STICKERS (${style.decor.length}/8)`}>
                    <div className="grid grid-cols-6 gap-1">
                      {[...STICKERS.map((s) => `svg:${s.id}`), ...SYMBOL_DECOR].map((d) => {
                        const on = style.decor.includes(d)
                        return (
                          <button
                            key={d}
                            onClick={() => patchStyle({ decor: on ? style.decor.filter((x) => x !== d) : style.decor.length < 8 ? [...style.decor, d] : style.decor })}
                            className={`aspect-square rounded p-1 border-2 ${on ? 'border-[#FF4FA3] bg-[#FFE4F0]' : 'border-transparent hover:bg-[#FFF0F7]'}`}
                            aria-pressed={on}
                            title={d.slice(4)}
                          >
                            <Sticker content={d} />
                          </button>
                        )
                      })}
                    </div>
                  </Section>
                </>
              )}

              {tab === 'boxes' && (
                <>
                  <Section title="NEXT TO YOUR PHOTO">
                    <TextRow label="headline quote" value={extras.headline} max={120} onChange={(v) => patchExtras({ headline: v })} />
                    <TextRow label="mood" value={info.mood} max={30} onChange={(v) => patchInfo({ mood: v })} />
                    <TextRow label="location (optional)" value={extras.location} max={60} onChange={(v) => patchExtras({ location: v })} placeholder="e.g. the internet ✦" />
                  </Section>
                  <Section title="ABOUT ME">
                    <Area value={extras.aboutMe} max={1500} rows={5} onChange={(v) => patchExtras({ aboutMe: v })} placeholder="hey everyone!! i love my friends, music, summer…" />
                  </Section>
                  <Section title="WHO I'D LIKE TO MEET" toggle={extras.show.meet} onToggle={(v) => patchExtras({ show: { ...extras.show, meet: v } })}>
                    <Area value={extras.whoToMeet} max={600} rows={3} onChange={(v) => patchExtras({ whoToMeet: v })} placeholder="cool people, nice people, new friends :)" />
                  </Section>
                  <Section title="MY MUSIC" toggle={extras.show.music} onToggle={(v) => patchExtras({ show: { ...extras.show, music: v } })}>
                    <TextRow label="song" value={extras.song.title} max={80} onChange={(v) => patchExtras({ song: { ...extras.song, title: v } })} />
                    <TextRow label="artist" value={extras.song.artist} max={80} onChange={(v) => patchExtras({ song: { ...extras.song, artist: v } })} />
                    <label className="block font-pixel text-base mt-1">
                      YouTube or Spotify link (optional)
                      <input
                        className="input-mini w-full"
                        defaultValue={extras.song.url}
                        key={extras.song.url}
                        placeholder="https://www.youtube.com/watch?v=…"
                        onBlur={(e) => patchExtras({ song: { ...extras.song, url: safeUrl(e.target.value) } })}
                      />
                    </label>
                    <p className="font-pixel text-base text-[#888] leading-tight mt-1">visitors can press play — it never autoplays ♪</p>
                  </Section>
                  <Section title="INTERESTS" toggle={extras.show.interests} onToggle={(v) => patchExtras({ show: { ...extras.show, interests: v } })}>
                    {(['general', 'music', 'movies', 'tv', 'books'] as const).map((k) => (
                      <TextRow key={k} label={k === 'tv' ? 'television' : k} value={extras.interests[k]} max={300} onChange={(v) => patchExtras({ interests: { ...extras.interests, [k]: v } })} />
                    ))}
                  </Section>
                  <Section title="SHOW ON MY PAGE">
                    {([['scrapbooks', 'my scrapbooks'], ['top8', 'top 8']] as const).map(([k, label]) => (
                      <label key={k} className="flex items-center gap-2 font-pixel text-lg">
                        <input type="checkbox" checked={extras.show[k]} onChange={(e) => patchExtras({ show: { ...extras.show, [k]: e.target.checked } })} className="accent-[#FF4FA3] w-4 h-4" />
                        {label}
                      </label>
                    ))}
                  </Section>
                </>
              )}

              {tab === 'top8' && <Top8Editor friends={friends} selfId={user.id} onChange={(f) => { setFriends(f); setDirty(true) }} />}

              {tab === 'info' && (
                <>
                  <Section title="PROFILE PHOTO">
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-20 border-2 border-[#2B0A2E] overflow-hidden bg-[#FF9ECF] flex items-center justify-center shrink-0">
                        {avatarPreview || avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={avatarPreview || avatarUrl!} alt="your photo" className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-chango text-white text-2xl">{(username || 'y').charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <button type="button" className="pf-btn" onClick={() => fileInputRef.current?.click()}>{avatarPreview || avatarUrl ? 'change photo' : 'upload photo'}</button>
                        <div className="font-pixel text-base text-[#888] mt-1">JPG, PNG or GIF · max 2MB</div>
                      </div>
                      <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleAvatar} />
                    </div>
                  </Section>
                  <Section title="BASICS">
                    <TextRow label="display name" value={info.display_name} max={50} onChange={(v) => patchInfo({ display_name: v })} />
                    <label className="block font-pixel text-base">
                      short bio (shows in search & cards)
                      <Area value={info.bio} max={160} rows={2} onChange={(v) => patchInfo({ bio: v })} />
                    </label>
                    <TextRow label="favourite colour" value={info.favorite_color} max={30} onChange={(v) => patchInfo({ favorite_color: v })} />
                  </Section>
                </>
              )}
            </div>
          </div>

          {/* ── live preview ── */}
          <div className="lg:sticky lg:top-3">
            <div className="window-chrome overflow-hidden" style={{ border: '2px solid #2B0A2E', borderRadius: 8 }}>
              <div className="window-title-bar flex items-center gap-2 px-2 py-1" style={{ background: 'linear-gradient(#FF9ECF,#FF4FA3)', color: '#fff' }}>
                <span className="font-silkscreen text-[12px]">LIVE PREVIEW — scrappy.fun/profile/{username}</span>
              </div>
              <div className="overflow-hidden bg-white" style={{ maxHeight: '78vh', overflowY: 'auto' }}>
                <div style={{ zoom: 0.62 } as React.CSSProperties}>
                  <div style={{ width: 920 }}>
                    <ProfileLayout
                      preview
                      profile={previewProfile}
                      style={style}
                      extras={extras}
                      scrapbooks={[]}
                      top8={friends}
                      online
                      contactSlot={<><span className="pf-btn">♡ add to my top 8</span><span className="pf-btn">✦ share profile</span></>}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-3 lg:hidden">{saveBar}</div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

// ─── pieces ───────────────────────────────────────────────────────────────

function Section({ title, children, toggle, onToggle }: { title: string; children: React.ReactNode; toggle?: boolean; onToggle?: (v: boolean) => void }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-1.5">
        <div className="font-silkscreen text-[12px] text-[#D4006E]">{title}</div>
        {onToggle && (
          <label className="flex items-center gap-1 font-pixel text-base">
            <input type="checkbox" checked={!!toggle} onChange={(e) => onToggle(e.target.checked)} className="accent-[#FF4FA3]" />
            show
          </label>
        )}
      </div>
      <div className={toggle === false ? 'opacity-50' : ''}>{children}</div>
    </section>
  )
}

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [text, setText] = useState(value)
  const [prev, setPrev] = useState(value)
  if (value !== prev) {
    setPrev(value)
    setText(value)
  }
  return (
    <label className="flex items-center gap-2 font-pixel text-base py-0.5">
      <input type="color" value={value.length === 7 ? value : '#FF4FA3'} onChange={(e) => onChange(e.target.value)} className="w-8 h-7 border-2 border-[#2B0A2E] rounded cursor-pointer p-0" aria-label={label} />
      <span className="flex-1">{label}</span>
      <input
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          if (/^#[0-9a-f]{6}$/i.test(e.target.value)) onChange(e.target.value)
        }}
        className="input-mini w-[84px] !h-7 font-mono text-xs"
        aria-label={`${label} hex`}
      />
    </label>
  )
}

function TextRow({ label, value, onChange, max, placeholder }: { label: string; value: string; onChange: (v: string) => void; max: number; placeholder?: string }) {
  return (
    <label className="block font-pixel text-base mb-1">
      {label}
      <input className="input-mini w-full" value={value} maxLength={max} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </label>
  )
}

function Area({ value, onChange, max, rows, placeholder }: { value: string; onChange: (v: string) => void; max: number; rows: number; placeholder?: string }) {
  return (
    <div>
      <textarea
        className="w-full border-2 border-[#2B0A2E] rounded-md p-2 font-nunito text-sm text-[#2B0A2E] bg-white outline-none focus:border-[#FF4FA3] resize-y"
        value={value}
        maxLength={max}
        rows={rows}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="text-right font-pixel text-sm text-[#888]">{value.length}/{max}</div>
    </div>
  )
}

function Seg({ value, options, onChange }: { value: string; options: [string, string][]; onChange: (v: string) => void }) {
  return (
    <div className="flex rounded-md border-2 border-[#2B0A2E] overflow-hidden">
      {options.map(([v, label]) => (
        <button key={v} type="button" onClick={() => onChange(v)} className={`flex-1 font-pixel text-base px-1 py-0.5 ${value === v ? 'bg-[#FF4FA3] text-white' : 'bg-white hover:bg-[#FFF0F7]'}`}>
          {label}
        </button>
      ))}
    </div>
  )
}

function Top8Editor({ friends, selfId, onChange }: { friends: MiniProfile[]; selfId: string; onChange: (f: MiniProfile[]) => void }) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState<MiniProfile[]>([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    const term = q.trim().replace(/[%_,()]/g, '')
    if (term.length < 2) return
    const t = setTimeout(async () => {
      setSearching(true)
      const { data } = await createClient()
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .or(`username.ilike.%${term}%,display_name.ilike.%${term}%`)
        .neq('id', selfId)
        .limit(8)
      setResults(data ?? [])
      setSearching(false)
    }, 300)
    return () => clearTimeout(t)
  }, [q, selfId])

  const move = (i: number, d: number) => {
    const j = i + d
    if (j < 0 || j >= friends.length) return
    const next = [...friends]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }

  return (
    <>
      <Section title={`MY TOP 8 (${friends.length}/8)`}>
        {friends.length === 0 && <p className="font-pixel text-base text-[#888]">nobody yet — search below to add your besties ♡</p>}
        <ol className="space-y-1">
          {friends.map((f, i) => (
            <li key={f.id} className="flex items-center gap-2 border-2 border-[#2B0A2E] rounded-md bg-white p-1">
              <span className="font-chango text-xs w-5 text-center text-[#FF4FA3]">{i + 1}</span>
              <span className="flex-1 min-w-0 truncate font-nunito font-bold text-sm">@{f.username}</span>
              <button className="pf-btn !px-1.5 !py-0.5" onClick={() => move(i, -1)} disabled={i === 0} aria-label="move up">▲</button>
              <button className="pf-btn !px-1.5 !py-0.5" onClick={() => move(i, 1)} disabled={i === friends.length - 1} aria-label="move down">▼</button>
              <button className="pf-btn !px-1.5 !py-0.5" onClick={() => onChange(friends.filter((x) => x.id !== f.id))} aria-label={`remove ${f.username}`}>✕</button>
            </li>
          ))}
        </ol>
      </Section>
      <Section title="ADD SOMEONE">
        <input className="input-mini w-full" value={q} onChange={(e) => setQ(e.target.value)} placeholder="search by username…" aria-label="search users" />
        {searching && <div className="font-pixel text-base text-[#888] mt-1">searching…</div>}
        <ul className="mt-1 space-y-1">
          {q.trim().length >= 2 && results.map((r) => {
            const added = friends.some((f) => f.id === r.id)
            return (
              <li key={r.id} className="flex items-center gap-2">
                <span className="flex-1 truncate font-nunito text-sm">@{r.username}{r.display_name && r.display_name !== r.username ? ` · ${r.display_name}` : ''}</span>
                <button className="pf-btn" disabled={added || friends.length >= 8} onClick={() => onChange([...friends, r])}>
                  {added ? '✓ added' : friends.length >= 8 ? 'full' : '+ add'}
                </button>
              </li>
            )
          })}
        </ul>
      </Section>
    </>
  )
}
