'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useAuth } from '@/lib/useAuth'
import { cleanEquipped, type Equipped } from './catalog'

export interface PetRow {
  user_id: string
  equipped: Equipped
  is_public: boolean
  show_companion: boolean
  updated_at: string
}
interface Loaded {
  userId: string
  pet: PetRow | null
  owned: Set<string>
  unlockedAt: Record<string, string>
  newlyUnlocked: { accessory_id: string; name: string }[]
  error: string | null
}

const SAVED_EVENT = 'scrappy-pet-saved'
const CLAIMED_KEY = 'scrappy-pet-claimed'

function toRow(r: Record<string, unknown> | null): PetRow | null {
  if (!r) return null
  return {
    user_id: String(r.user_id),
    equipped: cleanEquipped(r.equipped),
    is_public: !!r.is_public,
    show_companion: r.show_companion !== false,
    updated_at: String(r.updated_at),
  }
}

/** The signed-in user's pet, owned items and save(). Guests get pet = null.
    Unlock checks run on the server (claim_pet_unlocks); `claim: 'session'` runs them
    at most once per browser session. */
export function usePet({ claim = 'always' }: { claim?: 'always' | 'session' } = {}) {
  const { user, loading: authLoading } = useAuth()
  const [data, setData] = useState<Loaded | null>(null)
  const [saving, setSaving] = useState(false)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (authLoading || !user) return
    let cancelled = false
    const supabase = createClient()
    ;(async () => {
      try {
        const ensured = await supabase.rpc('ensure_my_pet')
        if (ensured.error) throw ensured.error
        let newly: Loaded['newlyUnlocked'] = []
        const doClaim = claim === 'always' || sessionStorage.getItem(CLAIMED_KEY) !== user.id
        if (doClaim) {
          const c = await supabase.rpc('claim_pet_unlocks')
          if (!c.error && Array.isArray(c.data)) newly = c.data as Loaded['newlyUnlocked']
          sessionStorage.setItem(CLAIMED_KEY, user.id)
        }
        const inv = await supabase.from('user_pet_inventory').select('accessory_id, unlocked_at').eq('user_id', user.id)
        if (inv.error) throw inv.error
        if (cancelled) return
        setData({
          userId: user.id,
          pet: toRow(ensured.data as Record<string, unknown>),
          owned: new Set((inv.data ?? []).map((r) => r.accessory_id as string)),
          unlockedAt: Object.fromEntries((inv.data ?? []).map((r) => [r.accessory_id, r.unlocked_at])),
          newlyUnlocked: newly,
          error: null,
        })
      } catch (e) {
        if (!cancelled) setData({ userId: user.id, pet: null, owned: new Set(), unlockedAt: {}, newlyUnlocked: [], error: (e as Error).message || 'could not load your pet' })
      }
    })()
    return () => { cancelled = true }
  }, [user, authLoading, claim, tick])

  // keep every pet on the page in sync after a save (studio -> floating companion)
  useEffect(() => {
    const onSaved = (e: Event) => {
      const row = (e as CustomEvent<PetRow>).detail
      setData((d) => (d && d.userId === row.user_id ? { ...d, pet: row } : d))
    }
    window.addEventListener(SAVED_EVENT, onSaved)
    return () => window.removeEventListener(SAVED_EVENT, onSaved)
  }, [])

  const current = data && user && data.userId === user.id ? data : null

  const save = useCallback(async (equipped: Equipped, isPublic: boolean, showCompanion: boolean) => {
    setSaving(true)
    try {
      const { data: row, error } = await createClient().rpc('save_my_pet', {
        p_equipped: equipped, p_is_public: isPublic, p_show_companion: showCompanion,
      })
      if (error) throw error
      const pet = toRow(row as Record<string, unknown>)
      if (pet) {
        setData((d) => (d ? { ...d, pet } : d))
        window.dispatchEvent(new CustomEvent(SAVED_EVENT, { detail: pet }))
      }
      return { ok: true as const }
    } catch (e) {
      return { ok: false as const, error: (e as Error).message || 'could not save' }
    } finally {
      setSaving(false)
    }
  }, [])

  return {
    user,
    loading: authLoading || (!!user && !current),
    guest: !authLoading && !user,
    pet: current?.pet ?? null,
    owned: current?.owned ?? new Set<string>(),
    unlockedAt: current?.unlockedAt ?? {},
    newlyUnlocked: current?.newlyUnlocked ?? [],
    error: current?.error ?? null,
    saving,
    save,
    reload: () => setTick((t) => t + 1),
  }
}
