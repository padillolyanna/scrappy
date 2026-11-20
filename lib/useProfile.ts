'use client'

import { useState, useEffect } from 'react'
import { createClient } from './supabase-client'
import { useAuth } from './useAuth'

export interface UserProfile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
}

export function useProfile() {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }

    let cancelled = false

    async function fetchOrCreate() {
      const supabase = createClient()

      const { data } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, bio')
        .eq('id', user!.id)
        .single()

      if (cancelled) return

      if (data) {
        setProfile(data as UserProfile)
        setLoading(false)
        return
      }

      // Profile is missing — create one as a safety net.
      // The DB trigger should have created it at signup; this handles edge-cases
      // (trigger failure, pre-trigger accounts, Google OAuth without username).
      const raw = (
        user!.user_metadata?.username ||
        user!.email?.split('@')[0] ||
        'user'
      )
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '')
        .slice(0, 20) || 'user'

      let username = raw.length >= 2 ? raw : 'user'
      let counter = 0
      let created: UserProfile | null = null

      while (counter < 20) {
        const { data: newProfile, error } = await supabase
          .from('profiles')
          .insert({
            id: user!.id,
            username,
            display_name:
              user!.user_metadata?.display_name ||
              user!.user_metadata?.full_name ||
              username,
          })
          .select('id, username, display_name, avatar_url, bio')
          .single()

        if (cancelled) return

        if (!error) {
          created = newProfile as UserProfile
          break
        }
        // 23505 = unique_violation; try next username with suffix
        if (error.code === '23505') {
          counter++
          username = raw.slice(0, 17) + counter
        } else {
          break
        }
      }

      if (!cancelled) {
        setProfile(created)
        setLoading(false)
      }
    }

    fetchOrCreate()
    return () => {
      cancelled = true
    }
  }, [user?.id, authLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  return { profile, loading: authLoading || loading }
}
