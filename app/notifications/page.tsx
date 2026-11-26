'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import { useAuth } from '@/lib/useAuth'
import Footer from '@/components/layout/Footer'

interface Notification {
  id: string
  type: string
  message: string
  link: string | null
  is_read: boolean
  created_at: string
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function typeIcon(type: string): string {
  if (type === 'follow') return '♡'
  if (type === 'follow_request') return '✦'
  if (type === 'follow_accepted') return '✓'
  return '✦'
}

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [markingAll, setMarkingAll] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setLoading(false)
      return
    }
    fetchNotifications()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading])

  async function fetchNotifications() {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('notifications')
      .select('id, type, message, link, is_read, created_at')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(50)
    if (!error && data) setNotifications(data)
    setLoading(false)
  }

  async function markRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    )
    const supabase = createClient()
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', user!.id)
  }

  async function markAllRead() {
    setMarkingAll(true)
    const supabase = createClient()
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user!.id)
      .eq('is_read', false)
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    setMarkingAll(false)
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 max-w-xl mx-auto w-full px-4 py-6">
        {/* header */}
        <div
          className="widget-box"
          style={{ marginBottom: 16, overflow: 'hidden', border: '2px solid #2B0A2E' }}
        >
          <div
            className="panel-header"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}
          >
            <span className="font-pixel text-xl">notifications</span>
            {unreadCount > 0 && (
              <span
                style={{
                  background: '#FF4FA3',
                  color: '#fff',
                  border: '2px solid #2B0A2E',
                  borderRadius: 999,
                  fontFamily: "'VT323', monospace",
                  fontSize: 16,
                  padding: '0 8px',
                  lineHeight: '20px',
                }}
              >
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <div style={{ padding: '6px 12px', borderBottom: '1px solid rgba(43,10,46,0.1)' }}>
              <button
                type="button"
                onClick={markAllRead}
                disabled={markingAll}
                className="btn-outline-y2k"
                style={{ fontSize: 12, padding: '3px 12px' }}
              >
                {markingAll ? 'marking…' : 'mark all as read'}
              </button>
            </div>
          )}
        </div>

        {/* not logged in */}
        {!authLoading && !user && (
          <div
            className="widget-box"
            style={{ padding: 24, textAlign: 'center', border: '2px solid #2B0A2E' }}
          >
            <p className="font-caveat text-lg" style={{ marginBottom: 12 }}>
              you need to be logged in to see notifications ✦
            </p>
            <Link href="/auth/login" className="btn-y2k">
              log in
            </Link>
          </div>
        )}

        {/* loading */}
        {loading && (
          <div
            style={{
              padding: 32,
              textAlign: 'center',
              fontFamily: "'VT323', monospace",
              fontSize: 22,
              color: '#FF4FA3',
            }}
          >
            loading…
          </div>
        )}

        {/* empty */}
        {!loading && user && notifications.length === 0 && (
          <div
            className="widget-box"
            style={{ padding: 32, textAlign: 'center', border: '2px solid #2B0A2E' }}
          >
            <p
              style={{
                fontFamily: "'Caveat', cursive",
                fontSize: 20,
                color: '#2B0A2E',
                opacity: 0.7,
              }}
            >
              no notifications yet ✦
            </p>
          </div>
        )}

        {/* notification list */}
        {!loading && notifications.length > 0 && (
          <div
            style={{
              background: '#fff',
              border: '2px solid #2B0A2E',
              boxShadow: '4px 4px 0 #2B0A2E',
              borderRadius: 4,
              overflow: 'hidden',
            }}
          >
            {notifications.map((n, i) => {
              const content = (
                <div
                  key={n.id}
                  onClick={() => !n.is_read && markRead(n.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    padding: '10px 14px',
                    borderBottom:
                      i < notifications.length - 1 ? '1px solid rgba(43,10,46,0.1)' : 'none',
                    background: n.is_read ? '#fff' : '#FFF0F7',
                    cursor: n.link ? 'pointer' : 'default',
                    transition: 'background 0.15s',
                  }}
                >
                  {/* icon */}
                  <div
                    style={{
                      flexShrink: 0,
                      width: 32,
                      height: 32,
                      background: 'linear-gradient(135deg, #FF9ECF, #C9A2FF)',
                      border: '2px solid #2B0A2E',
                      borderRadius: 999,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: "'VT323', monospace",
                      fontSize: 18,
                      color: '#fff',
                      marginTop: 2,
                    }}
                    aria-hidden
                  >
                    {typeIcon(n.type)}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: "'Nunito', sans-serif",
                        fontSize: 14,
                        fontWeight: n.is_read ? 400 : 700,
                        color: '#2B0A2E',
                        lineHeight: 1.4,
                      }}
                    >
                      {n.message}
                    </div>
                    <div
                      style={{
                        fontFamily: "'VT323', monospace",
                        fontSize: 15,
                        color: '#FF4FA3',
                        marginTop: 2,
                        opacity: 0.8,
                      }}
                    >
                      {relativeTime(n.created_at)}
                    </div>
                  </div>

                  {!n.is_read && (
                    <div
                      style={{
                        flexShrink: 0,
                        width: 8,
                        height: 8,
                        borderRadius: 999,
                        background: '#FF4FA3',
                        marginTop: 6,
                        border: '1px solid #2B0A2E',
                      }}
                      aria-label="unread"
                    />
                  )}
                </div>
              )

              return n.link ? (
                <Link
                  key={n.id}
                  href={n.link}
                  style={{ textDecoration: 'none', display: 'block' }}
                  onClick={() => !n.is_read && markRead(n.id)}
                >
                  {content}
                </Link>
              ) : (
                <div key={n.id}>{content}</div>
              )
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
