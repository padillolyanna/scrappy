'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { sanitizeExtras } from '@/lib/profileStyle'

export function ShareProfileButton() {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      className="pf-btn"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(window.location.href)
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        } catch {}
      }}
    >
      {copied ? '✓ link copied!' : '✦ share profile'}
    </button>
  )
}

export function AddToTop8Button({ targetId, viewerId }: { targetId: string; viewerId: string | null }) {
  const [state, setState] = useState<'idle' | 'busy' | 'added' | 'full' | 'already' | 'error'>('idle')
  if (!viewerId) {
    return <Link href="/auth/login" className="pf-btn">♡ add to my top 8</Link>
  }
  async function add() {
    setState('busy')
    const supabase = createClient()
    const { data, error } = await supabase.from('profiles').select('profile_extras').eq('id', viewerId!).single()
    if (error) return setState('error')
    const extras = sanitizeExtras(data?.profile_extras)
    if (extras.top8.includes(targetId)) return setState('already')
    if (extras.top8.length >= 8) return setState('full')
    const { error: upErr } = await supabase
      .from('profiles')
      .update({ profile_extras: { ...extras, top8: [...extras.top8, targetId] } })
      .eq('id', viewerId!)
    setState(upErr ? 'error' : 'added')
  }
  const label = {
    idle: '♡ add to my top 8',
    busy: 'adding…',
    added: '✓ in your top 8!',
    already: '✓ already in your top 8',
    full: 'your top 8 is full — edit it',
    error: "couldn't add, try again",
  }[state]
  return state === 'full' ? (
    <Link href="/profile/me/edit?tab=top8" className="pf-btn">{label}</Link>
  ) : (
    <button type="button" className="pf-btn" onClick={add} disabled={state === 'busy' || state === 'added' || state === 'already'}>
      {label}
    </button>
  )
}

export function CommentForm({ profileId, viewerId }: { profileId: string; viewerId: string | null }) {
  const router = useRouter()
  const [body, setBody] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  if (!viewerId) {
    return (
      <div style={{ padding: '4px 0 8px' }}>
        <Link href="/auth/login" className="pf-btn">log in to leave a comment ♡</Link>
      </div>
    )
  }
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        const text = body.trim()
        if (!text) return
        setBusy(true)
        setErr('')
        const { error } = await createClient().from('profile_comments').insert({ profile_id: profileId, author_id: viewerId, body: text })
        setBusy(false)
        if (error) return setErr("couldn't post that — try again")
        setBody('')
        router.refresh()
      }}
      style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingBottom: 8 }}
    >
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        maxLength={500}
        rows={2}
        placeholder="leave a comment… omg ur page is sooo cute :)"
        aria-label="comment"
        style={{ width: '100%', border: '2px inset #bbb', padding: 6, fontFamily: 'Verdana, sans-serif', fontSize: 12, background: '#fff', color: '#222', resize: 'vertical' }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button type="submit" className="pf-btn" disabled={busy || !body.trim()}>{busy ? 'posting…' : 'post comment'}</button>
        <span style={{ fontSize: 12, opacity: 0.6, fontFamily: 'Verdana, sans-serif' }}>{body.length}/500</span>
        {err && <span style={{ fontSize: 12, color: '#c00' }} role="alert">{err}</span>}
      </div>
    </form>
  )
}

export function DeleteCommentButton({ commentId }: { commentId: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [confirming, setConfirming] = useState(false)

  async function doDelete() {
    setBusy(true)
    setConfirming(false)
    await createClient().from('profile_comments').delete().eq('id', commentId)
    router.refresh()
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        disabled={busy}
        style={{ fontSize: 12, fontFamily: 'Verdana, sans-serif', textDecoration: 'underline', opacity: 0.7, background: 'none', border: 0, cursor: 'pointer', color: 'inherit' }}
      >
        {busy ? 'deleting…' : 'delete'}
      </button>

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#3A0030]/60 backdrop-blur-sm" onClick={() => setConfirming(false)} />
          <div className="relative z-10 w-full max-w-xs animate-bounce-in">
            <div className="window-chrome overflow-hidden rounded-lg shadow-2xl">
              <div className="window-title-bar">
                <span>scrappy.exe — delete comment</span>
                <div className="flex gap-1">
                  <span className="window-btn">_</span>
                  <span className="window-btn">□</span>
                  <button className="window-btn" onClick={() => setConfirming(false)}>x</button>
                </div>
              </div>
              <div className="bg-white p-6 text-center">
                <div className="font-pixel text-2xl text-[#FF4FA3] mb-3">♡</div>
                <p className="font-caveat text-lg text-[#3A0030] mb-5" style={{ fontFamily: 'Caveat, cursive' }}>
                  delete this comment? this can&apos;t be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirming(false)}
                    className="btn-outline-y2k flex-1 py-2 text-sm"
                  >
                    keep it
                  </button>
                  <button
                    onClick={doDelete}
                    className="btn-y2k flex-1 py-2 text-sm"
                    style={{ background: '#D4006E' }}
                  >
                    delete ✦
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
