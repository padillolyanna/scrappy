'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import { useAuth } from '@/lib/useAuth'

export default function NotificationBell() {
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchCount = useCallback(async () => {
    if (!user) return
    const supabase = createClient()
    const { count } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false)
    setUnreadCount(count ?? 0)
  }, [user])

  useEffect(() => {
    if (!user) {
      setUnreadCount(0)
      return
    }
    fetchCount()

    // realtime subscription for new notifications
    const supabase = createClient()
    const channel = supabase
      .channel('notif-bell')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          setUnreadCount((c) => c + 1)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, fetchCount])

  if (!user) return null

  return (
    <Link
      href="/notifications"
      aria-label={`notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        textDecoration: 'none',
        color: '#fff',
        fontFamily: "'VT323', monospace",
        fontSize: 20,
        lineHeight: 1,
        padding: '2px 6px',
      }}
    >
      ♡
      {unreadCount > 0 && (
        <span
          style={{
            position: 'absolute',
            top: -4,
            right: -6,
            background: '#FF4FA3',
            color: '#fff',
            border: '1.5px solid #2B0A2E',
            borderRadius: 999,
            fontFamily: "'VT323', monospace",
            fontSize: 13,
            lineHeight: 1,
            padding: '1px 4px',
            minWidth: 16,
            textAlign: 'center',
          }}
          aria-hidden
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  )
}
