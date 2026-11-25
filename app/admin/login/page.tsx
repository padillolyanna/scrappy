'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error: err } = await createClient().auth.signInWithPassword({ email, password })
    setLoading(false)
    if (err) { setError(err.message); return }
    router.push('/admin')
    router.refresh()
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#f9fafb',
    }}>
      <form onSubmit={handleLogin} style={{
        background: '#fff', border: '1px solid #e5e7eb',
        borderRadius: '8px', padding: '32px', width: '320px',
        display: 'flex', flexDirection: 'column', gap: '16px',
      }}>
        <div style={{ marginBottom: '4px' }}>
          <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#9ca3af', letterSpacing: '0.1em' }}>SCRAPPY/ADMIN</div>
          <div style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginTop: '4px' }}>Sign in</div>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '4px', padding: '8px 12px', fontSize: '13px', color: '#dc2626' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12px', color: '#374151', fontWeight: 500 }}>Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              border: '1px solid #d1d5db', borderRadius: '6px',
              padding: '8px 12px', fontSize: '14px', outline: 'none',
              fontFamily: 'inherit',
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12px', color: '#374151', fontWeight: 500 }}>Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{
              border: '1px solid #d1d5db', borderRadius: '6px',
              padding: '8px 12px', fontSize: '14px', outline: 'none',
              fontFamily: 'inherit',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            background: loading ? '#9ca3af' : '#111827',
            color: '#fff', border: 'none', borderRadius: '6px',
            padding: '10px', fontSize: '14px', fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer', marginTop: '4px',
          }}
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
