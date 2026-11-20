'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (user) router.replace('/my-space')
    })
  }, [router])

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
      router.push('/my-space')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-float" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float2" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 text-[#888] hover:text-[#FF4FA3] transition-colors mb-4 font-nunito text-sm">
          <span>←</span> back to home
        </Link>
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
              <div className="font-pacifico text-4xl text-glitter mb-1" style={{ fontFamily: 'Pacifico, cursive', fontSize: '36px', paddingBottom: '6px' }}>
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
                <label className="font-pixel text-xs text-[#3A0030] mb-1 block" style={{ fontSize: '12px' }}>EMAIL ADDRESS</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-y2k"
                  required
                />
              </div>
              <div>
                <label className="font-pixel text-xs text-[#3A0030] mb-1 block" style={{ fontSize: '12px' }}>PASSWORD</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-y2k pr-16"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 font-pixel text-xs text-[#888] hover:text-[#FF4FA3] transition-colors"
                    style={{ fontSize: '12px' }}
                  >
                    {showPassword ? 'hide' : 'show'}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-y2k w-full py-3 text-base">
                {loading ? 'logging in...' : 'LOG IN ✦'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <p className="font-nunito text-sm text-[#888]">
                don&apos;t have an account?{' '}
                <Link href="/auth/signup" className="text-[#FF4FA3] font-bold hover:underline">sign up here ✦</Link>
              </p>
            </div>

            <div className="mt-4 text-center font-pixel text-xs text-[#ccc]" style={{ fontSize: '12px' }}>
              ✦ ★ ♡ ✿ ♪ ◆ ✦
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
