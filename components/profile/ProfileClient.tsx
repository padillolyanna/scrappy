'use client'

import { useState } from 'react'
import Link from 'next/link'
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

