'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/scrapbook/create')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-float" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float2" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="window-chrome overflow-hidden rounded-lg">
          <div className="window-title-bar">
            <span>scrappy.exe — login</span>
            <div className="flex gap-1">
              <span className="window-btn">_</span>
              <span className="window-btn">□</span>
              <span className="window-btn">x</span>
            </div>
          </div>

          <div className="bg-white p-8">
            <div className="text-center mb-6">
              <div className="font-pacifico text-4xl text-glitter mb-1" style={{ fontFamily: 'Pacifico, cursive', fontSize: '36px' }}>
                SCRAPPY
              </div>
              <div className="font-caveat text-[#888] text-lg" style={{ fontFamily: 'Caveat, cursive' }}>
                welcome back! ✦
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-2 mb-4 font-nunito text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="font-pixel text-xs text-[#3A0030] mb-1 block" style={{ fontSize: '10px' }}>EMAIL ADDRESS</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input-y2k" required />
              </div>
              <div>
                <label className="font-pixel text-xs text-[#3A0030] mb-1 block" style={{ fontSize: '10px' }}>PASSWORD</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="input-y2k" required />
              </div>
              <button type="submit" disabled={loading} className="btn-y2k w-full py-3 text-base">
                {loading ? 'logging in...' : 'LOG IN ✦'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <p className="font-nunito text-sm text-[#888]">
                don't have an account?{' '}
                <Link href="/auth/signup" className="text-[#FF4FA3] font-bold hover:underline">sign up here ✦</Link>
              </p>
            </div>

            <div className="mt-4 text-center font-pixel text-xs text-[#ccc]" style={{ fontSize: '9px' }}>
              ✦ ★ ♡ ✿ ♪ ◆ ✦
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
