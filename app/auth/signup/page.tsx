'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [checkingUsername, setCheckingUsername] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (username.length < 3) {
      setUsernameAvailable(null)
      return
    }
    setCheckingUsername(true)
    const timer = setTimeout(async () => {
      const supabase = createClient()
      const { data } = await supabase.from('profiles').select('id').eq('username', username).maybeSingle()
      setUsernameAvailable(!data)
      setCheckingUsername(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [username])

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError("passwords don't match")
      return
    }
    if (usernameAvailable === false) {
      setError('that username is taken')
      return
    }
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, display_name: username },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  async function handleGoogleSignup() {
    setGoogleLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    })
    if (error) {
      setError(error.message)
      setGoogleLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl font-pixel text-[#FF4FA3] mb-4">✦</div>
          <h2 className="font-pacifico text-3xl text-[#3A0030] mb-2" style={{ fontFamily: 'Pacifico, cursive' }}>
            check your email!
          </h2>
          <p className="font-caveat text-xl text-[#888]" style={{ fontFamily: 'Caveat, cursive' }}>
            we sent a confirmation link to <strong className="text-[#FF4FA3]">{email}</strong>. click it to activate your account! ✦
          </p>
          <Link href="/auth/login" className="btn-y2k mt-6 inline-block">
            back to login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-float" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float2" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 text-[#888] hover:text-[#FF4FA3] transition-colors mb-4 font-nunito text-sm">
          <span>←</span> back to home
        </Link>
        <div className="window-chrome overflow-hidden rounded-lg">
          <div className="window-title-bar">
            <span>scrappy.exe — create account</span>
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
                claim your corner of the internet ✦
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-2 mb-4 font-nunito text-sm">
                {error}
              </div>
            )}

            {/* Google OAuth */}
            <button
              onClick={handleGoogleSignup}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border-2 border-[#FFB6D9] rounded-xl font-nunito text-sm text-[#3A0030] hover:border-[#FF4FA3] hover:bg-[#FFB6D9]/10 transition-all mb-4 disabled:opacity-50"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              {googleLoading ? 'redirecting...' : 'continue with Google'}
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-[#FFB6D9]/50" />
              <span className="font-pixel text-xs text-[#ccc]" style={{ fontSize: '9px' }}>or</span>
              <div className="flex-1 h-px bg-[#FFB6D9]/50" />
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="font-pixel text-xs text-[#3A0030] mb-1 block" style={{ fontSize: '10px' }}>USERNAME</label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="stargirl404"
                    className="input-y2k pr-16"
                    required minLength={3} maxLength={20}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 font-pixel text-xs" style={{ fontSize: '9px' }}>
                    {checkingUsername && <span className="text-[#888]">...</span>}
                    {!checkingUsername && usernameAvailable === true && <span className="text-green-500">✓ free</span>}
                    {!checkingUsername && usernameAvailable === false && <span className="text-red-400">✗ taken</span>}
                  </span>
                </div>
                <div className="font-nunito text-xs text-[#888] mt-1">letters, numbers, underscores only</div>
              </div>
              <div>
                <label className="font-pixel text-xs text-[#3A0030] mb-1 block" style={{ fontSize: '10px' }}>EMAIL ADDRESS</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input-y2k" required />
              </div>
              <div>
                <label className="font-pixel text-xs text-[#3A0030] mb-1 block" style={{ fontSize: '10px' }}>PASSWORD</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-y2k pr-16"
                    required minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 font-pixel text-xs text-[#888] hover:text-[#FF4FA3] transition-colors"
                    style={{ fontSize: '9px' }}
                  >
                    {showPassword ? 'hide' : 'show'}
                  </button>
                </div>
                {password.length > 0 && password.length < 6 && (
                  <div className="font-nunito text-xs text-red-400 mt-1">at least 6 characters</div>
                )}
              </div>
              <div>
                <label className="font-pixel text-xs text-[#3A0030] mb-1 block" style={{ fontSize: '10px' }}>CONFIRM PASSWORD</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-y2k pr-16"
                    required
                  />
                  {confirmPassword.length > 0 && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-pixel text-xs" style={{ fontSize: '9px' }}>
                      {password === confirmPassword
                        ? <span className="text-green-500">✓</span>
                        : <span className="text-red-400">✗</span>}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || usernameAvailable === false}
                className="btn-y2k w-full py-3 text-base disabled:opacity-50"
              >
                {loading ? 'creating your account...' : 'CREATE MY ACCOUNT ✦'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <p className="font-nunito text-sm text-[#888]">
                already have an account?{' '}
                <Link href="/auth/login" className="text-[#FF4FA3] font-bold hover:underline">log in here ✦</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
