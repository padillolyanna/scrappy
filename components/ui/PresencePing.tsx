'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useAuth } from '@/lib/useAuth'

/** Marks the signed-in user as recently active ("Online Now!" on profiles). */
export default function PresencePing() {
  const { user } = useAuth()
  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    const ping = () => {
      if (document.visibilityState !== 'visible') return
      supabase.from('profiles').update({ last_seen_at: new Date().toISOString() }).eq('id', user.id).then(() => {})
    }
    ping()
    const t = setInterval(ping, 2 * 60 * 1000)
    document.addEventListener('visibilitychange', ping)
    return () => {
      clearInterval(t)
      document.removeEventListener('visibilitychange', ping)
    }
  }, [user])
  return null
}
