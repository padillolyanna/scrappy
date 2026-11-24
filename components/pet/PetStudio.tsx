'use client'

import { useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent } from 'react'
import Link from 'next/link'
import PetAvatar, { type PetMood } from './PetAvatar'
import { usePet } from '@/lib/pet/usePet'
import {
  CATEGORIES, PET_ITEMS, ITEM_BY_ID, RARITY, UNLOCK_TEXT, isOwned,
  type Category, type Equipped, type PetItem,
} from '@/lib/pet/catalog'

// Time read once on the client; the server/prerender pass sees 0 (nothing marked new).
let clientNow = 0
const getClientNow = () => (clientNow ||= Date.now())
const getServerNow = () => 0
const noopSubscribe = () => () => {}

const MESSAGES = ['hi! ♡', "let's make something!", 'you look cute today!', 'ready to scrapbook?']
const FILTERS = ['owned', 'equipped', 'locked', 'new'] as const
type Filter = (typeof FILTERS)[number]
const FILTER_LABEL: Record<Filter, string> = { owned: 'Owned', equipped: 'Equipped', locked: 'Locked', new: 'New arrivals' }
const NEW_DAYS = 14
const DAY = 86400000

type Draft = { equipped: Equipped; isPublic: boolean; companion: boolean }
const same = (a: Draft, b: Draft) => JSON.stringify(a) === JSON.stringify(b)

export default function PetStudio() {
  const { user, guest, loading, pet, owned, unlockedAt, newlyUnlocked, error: loadError, saving, save } = usePet()
  const base: Draft = { equipped: pet?.equipped ?? {}, isPublic: pet?.is_public ?? false, companion: pet?.show_companion ?? true }
  const baseKey = pet ? `${pet.user_id}:${pet.updated_at}` : 'none'
  const [edit, setEdit] = useState<{ key: string; v: Draft } | null>(null)
  const draft = edit && edit.key === baseKey ? edit.v : base
  const dirty = !same(draft, base)
  const update = (fn: (d: Draft) => Draft) => setEdit({ key: baseKey, v: fn(draft) })

  const [cat, setCat] = useState<Category>('head')
  const [selected, setSelected] = useState<string>('bow-pink')
  const [filter, setFilter] = useState<Filter>('owned')
  const [status, setStatus] = useState<{ kind: 'ok' | 'err' | 'info'; text: string } | null>(null)
  const [mood, setMood] = useState<PetMood>('idle')
  const [bubble, setBubble] = useState<string | null>(null)
  const [dismissedNew, setDismissedNew] = useState(false)
  const nowMs = useSyncExternalStore(noopSubscribe, getClientNow, getServerNow)
  const timers = useRef<number[]>([])

  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)) }
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  // sleepy after a while without any interaction
  useEffect(() => {
    let t = window.setTimeout(() => setMood('sleepy'), 45000)
    const wake = () => {
      clearTimeout(t)
      setMood((m) => (m === 'sleepy' ? 'idle' : m))
      t = window.setTimeout(() => setMood('sleepy'), 45000)
    }
    const evs = ['pointerdown', 'keydown', 'scroll'] as const
    evs.forEach((e) => window.addEventListener(e, wake, { passive: true }))
    return () => { clearTimeout(t); evs.forEach((e) => window.removeEventListener(e, wake)) }
  }, [])

  const showNew = newlyUnlocked.length > 0 && !dismissedNew
  const effectiveMood: PetMood = showNew && mood === 'idle' ? 'excited' : mood
  const say = (text: string, m: PetMood = 'happy', ms = 2200) => {
    setBubble(text); setMood(m)
    later(() => { setBubble(null); setMood('idle') }, ms)
  }

  const item = ITEM_BY_ID[selected]
  const ownedItem = (i: PetItem) => !guest && isOwned(i, owned)
  const equippedIds = new Set(Object.values(draft.equipped))

  function toggle(i: PetItem) {
    setSelected(i.id)
    if (guest) { setStatus({ kind: 'info', text: 'Log in to dress up your own pet ♡' }); return }
    if (loading) return
    if (!ownedItem(i)) { setStatus({ kind: 'info', text: `${i.name} is locked: ${UNLOCK_TEXT[i.unlock]}.` }); return }
    setStatus(null)
    update((d) => {
      const eq = { ...d.equipped }
      if (eq[i.slot] === i.id) delete eq[i.slot]
      else eq[i.slot] = i.id
      return { ...d, equipped: eq }
    })
  }

  async function onSave() {
    setStatus({ kind: 'info', text: 'saving…' })
    const r = await save(draft.equipped, draft.isPublic, draft.companion)
    if (r.ok) { setEdit(null); setStatus({ kind: 'ok', text: 'saved! ✦' }); say('yay! ✦', 'excited', 2400) }
    else setStatus({ kind: 'err', text: `Couldn't save: ${r.error}` })
  }

  const catItems = PET_ITEMS.filter((i) => i.category === cat)
  const isNew = (i: PetItem) => nowMs - new Date(i.addedAt).getTime() < NEW_DAYS * DAY
    || (unlockedAt[i.id] && nowMs - new Date(unlockedAt[i.id]).getTime() < 7 * DAY)
  const collection = PET_ITEMS.filter((i) =>
    filter === 'owned' ? ownedItem(i)
    : filter === 'equipped' ? equippedIds.has(i.id)
    : filter === 'locked' ? !ownedItem(i)
    : isNew(i))

  function onTabKey(e: KeyboardEvent<HTMLDivElement>) {
    const idx = CATEGORIES.findIndex((c) => c.id === cat)
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (!d) return
    e.preventDefault()
    const next = CATEGORIES[(idx + d + CATEGORIES.length) % CATEGORIES.length]
    setCat(next.id)
    document.getElementById(`pet-tab-${next.id}`)?.focus()
  }

  const statusOf = (i: PetItem) => (equippedIds.has(i.id) ? 'Equipped' : ownedItem(i) ? 'Owned' : 'Locked')

  return (
    <div className="pet-studio">
      <header className="pet-studio-head">
        <p className="y2kh-kicker">✦ YOUR VIRTUAL PET ✦</p>
        <h1>MY LITTLE PET ♡</h1>
        <p className="pet-sub">Dress up your own Scrappy pet. Everyone starts with the same little guy; collect accessories to make yours unique.</p>
      </header>

      {guest && (
        <div className="pet-banner" role="status">
          <span>This is the default Scrappy pet. <b>Log in</b> to get your own and dress it up.</span>
          <Link href="/auth/login?next=/pet" className="y2kh-btn y2kh-btn--pink">log in</Link>
          <Link href="/auth/signup" className="y2kh-btn y2kh-btn--chrome">join free</Link>
        </div>
      )}
      {showNew && (
        <div className="pet-banner pet-banner--new" role="status">
          <span><b>new accessories unlocked! ✦</b> {newlyUnlocked.map((n) => n.name).join(', ')}</span>
          <button type="button" className="y2kh-btn y2kh-btn--chrome" onClick={() => setDismissedNew(true)}>yay!</button>
        </div>
      )}
      {loadError && <p className="pet-status pet-status--err" role="alert">Couldn&apos;t load your pet: {loadError}</p>}

      <div className="pet-studio-grid">
        {/* ── live preview ── */}
        <section className="y2kh-panel" aria-labelledby="pet-preview-h">
          <h2 id="pet-preview-h" className="y2kh-ttl y2kh-ttl--pink">
            <span className="y2kh-ttl-text">{user ? 'pet.exe' : 'pet.exe (preview)'}</span>
            <span className="y2kh-winbtns" aria-hidden="true"><i>_</i><i>□</i><i>×</i></span>
          </h2>
          <div className="pet-device">
            <div className="pet-device-screen">
              {bubble && <span className="pet-bubble" aria-live="polite">{bubble}</span>}
              <button type="button" className="pet-poke" aria-label="Pet your pet"
                onClick={() => say(MESSAGES[Math.floor(Math.random() * MESSAGES.length)])}>
                <PetAvatar equipped={draft.equipped} size={190} mood={effectiveMood} title="Your pet, live preview" />
              </button>
            </div>
            <div className="pet-device-btns" aria-hidden="true"><i /><i /><i /></div>
          </div>

          <div className="y2kh-pad pet-actions">
            {loading && !guest ? <p className="pet-status">loading your pet…</p> : null}
            <div className="y2kh-ctas">
              <button type="button" className="y2kh-btn y2kh-btn--pink" onClick={onSave} disabled={guest || loading || !dirty || saving}>
                {saving ? 'saving…' : 'save'}
              </button>
              <button type="button" className="y2kh-btn y2kh-btn--chrome" onClick={() => { setEdit(null); setStatus(null) }} disabled={!dirty || saving}>cancel</button>
              <button type="button" className="y2kh-btn y2kh-btn--purple" onClick={() => update((d) => ({ ...d, equipped: {} }))}
                disabled={guest || Object.keys(draft.equipped).length === 0}>reset to default</button>
            </div>
            {dirty && <p className="pet-status">unsaved changes</p>}
            {status && <p className={`pet-status pet-status--${status.kind}`} role={status.kind === 'err' ? 'alert' : 'status'}>{status.text}</p>}
            <fieldset className="pet-toggles" disabled={guest || loading}>
              <legend className="sr-only">Pet visibility</legend>
              <label><input type="checkbox" checked={draft.isPublic} onChange={(e) => update((d) => ({ ...d, isPublic: e.target.checked }))} /> show my pet on my public profile</label>
              <label><input type="checkbox" checked={draft.companion} onChange={(e) => update((d) => ({ ...d, companion: e.target.checked }))} /> floating pet companion on the site</label>
            </fieldset>
          </div>
        </section>

        {/* ── wardrobe ── */}
        <section className="y2kh-panel" aria-labelledby="pet-wardrobe-h">
          <h2 id="pet-wardrobe-h" className="y2kh-ttl y2kh-ttl--lilac"><span className="y2kh-ttl-text">dress up</span></h2>
          <div className="pet-tabs" role="tablist" aria-label="Accessory categories" onKeyDown={onTabKey}>
            {CATEGORIES.map((c) => (
              <button key={c.id} id={`pet-tab-${c.id}`} type="button" role="tab" aria-selected={cat === c.id} aria-controls="pet-items"
                tabIndex={cat === c.id ? 0 : -1} onClick={() => setCat(c.id)}>{c.label}</button>
            ))}
          </div>
          <div id="pet-items" role="tabpanel" aria-labelledby={`pet-tab-${cat}`} className="pet-items">
            {catItems.map((i) => {
              const on = equippedIds.has(i.id)
              const locked = !guest && !isOwned(i, owned)
              return (
                <button key={i.id} type="button" aria-pressed={on} onClick={() => toggle(i)} onFocus={() => setSelected(i.id)}
                  className={`pet-tile ${on ? 'is-on' : ''} ${locked ? 'is-locked' : ''} ${selected === i.id ? 'is-sel' : ''}`}
                  aria-label={`${i.name}${on ? ', equipped' : ''}${locked ? `, locked: ${UNLOCK_TEXT[i.unlock]}` : ''}`}>
                  <PetAvatar equipped={{ [i.slot]: i.id }} size={74} animated={false} crop={i.category === 'face' || i.category === 'head' ? 'head' : 'full'} title="" />
                  <span>{i.name}</span>
                  {locked && (
                    <b className="pet-lock" aria-hidden="true">
                      <svg width="14" height="16" viewBox="0 0 14 16"><path d="M3.5 7V5a3.5 3.5 0 0 1 7 0v2" fill="none" stroke="#2B0A2E" strokeWidth="2" /><rect x="1" y="7" width="12" height="8" rx="2" fill="#FFD84A" stroke="#2B0A2E" strokeWidth="1.6" /></svg>
                    </b>
                  )}
                  {on && <b className="pet-check" aria-hidden="true">✓</b>}
                  {i.rarity !== 'common' && <em style={{ background: RARITY[i.rarity].color }}>{RARITY[i.rarity].label}</em>}
                </button>
              )
            })}
          </div>
          {item && (
            <div className="pet-info" aria-live="polite">
              <div className="pet-info-art"><PetAvatar equipped={{ [item.slot]: item.id }} size={96} animated={false} crop={item.category === 'face' || item.category === 'head' ? 'head' : 'full'} title="" /></div>
              <div>
                <p className="pet-info-name">{item.name} <em style={{ background: RARITY[item.rarity].color }}>{RARITY[item.rarity].label}</em></p>
                <p>{item.description}</p>
                <dl>
                  <div><dt>Category</dt><dd>{CATEGORIES.find((c) => c.id === item.category)?.label} · {item.slot}</dd></div>
                  <div><dt>Unlock</dt><dd>{UNLOCK_TEXT[item.unlock]}</dd></div>
                  <div><dt>Status</dt><dd>{guest ? 'Log in to collect' : statusOf(item)}{unlockedAt[item.id] ? ` · unlocked ${new Date(unlockedAt[item.id]).toLocaleDateString()}` : ''}</dd></div>
                </dl>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* ── collection ── */}
      <section className="y2kh-panel pet-collection" aria-labelledby="pet-coll-h">
        <h2 id="pet-coll-h" className="y2kh-ttl y2kh-ttl--orange">
          <span className="y2kh-ttl-text">MY PET&apos;S COLLECTION</span>
          {!guest && <span className="pet-count">{PET_ITEMS.filter(ownedItem).length}/{PET_ITEMS.length} collected</span>}
        </h2>
        <div className="pet-filters" role="group" aria-label="Filter collection">
          {FILTERS.map((f) => (
            <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}>{FILTER_LABEL[f]}</button>
          ))}
        </div>
        {collection.length === 0 ? (
          <p className="y2kh-pad pet-status">{guest ? 'Log in to start your collection ♡' : filter === 'equipped' ? 'Nothing equipped yet. Pick something above ✦' : 'Nothing here yet ✦'}</p>
        ) : (
          <ul className="pet-coll-list">
            {collection.map((i) => (
              <li key={i.id}>
                <button type="button" onClick={() => { setCat(i.category); setSelected(i.id) }}>
                  <PetAvatar equipped={{ [i.slot]: i.id }} size={52} animated={false} crop={i.category === 'face' || i.category === 'head' ? 'head' : 'full'} title="" />
                  <span>
                    <b>{i.name}</b>
                    <small><i style={{ color: RARITY[i.rarity].color }}>{RARITY[i.rarity].label}</i> · {guest ? UNLOCK_TEXT[i.unlock] : statusOf(i) === 'Locked' ? UNLOCK_TEXT[i.unlock] : statusOf(i)}</small>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
