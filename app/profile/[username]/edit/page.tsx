'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/lib/useAuth'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

const THEMES = [
  { id: 'pink-princess', label: 'Pink Princess', gradient: 'from-pink-200 via-pink-100 to-pink-50' },
  { id: 'cyber-y2k', label: 'Cyber Y2K', gradient: 'from-purple-900 via-blue-900 to-purple-800' },
  { id: 'blue-dream', label: 'Blue Dream', gradient: 'from-blue-100 via-purple-50 to-blue-50' },
  { id: 'indie-sleaze', label: 'Indie Sleaze', gradient: 'from-zinc-900 via-zinc-800 to-purple-900' },
  { id: 'sweet-memories', label: 'Sweet Memories', gradient: 'from-orange-50 via-yellow-50 to-pink-50' },
]

export default function ProfileEditPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [profile, setProfile] = useState({
    display_name: '',
    bio: '',
    mood: '',
    favorite_color: '',
    profile_theme: 'pink-princess',
  })
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [loadingProfile, setLoadingProfile] = useState(true)

  useEffect(() => {
    if (!user) return
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('profiles')
        .select('display_name, bio, mood, favorite_color, profile_theme, avatar_url')
        .eq('id', user!.id)
        .single()
      if (data) {
        setProfile({
          display_name: data.display_name ?? '',
          bio: data.bio ?? '',
          mood: data.mood ?? '',
          favorite_color: data.favorite_color ?? '',
          profile_theme: data.profile_theme ?? 'pink-princess',
        })
        setAvatarUrl(data.avatar_url ?? null)
      }
      setLoadingProfile(false)
    }
    load()
  }, [user])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be under 2MB.')
      return
    }
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
    setError('')
  }

  async function uploadAvatar(): Promise<string | null> {
    if (!avatarFile || !user) return null
    setUploadingAvatar(true)
    const supabase = createClient()
    const ext = avatarFile.name.split('.').pop()
    const path = `${user.id}/avatar.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, avatarFile, { upsert: true })
    if (uploadError) {
      setError('Could not upload image. Make sure the avatars bucket exists in Supabase Storage.')
      setUploadingAvatar(false)
      return null
    }
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    setUploadingAvatar(false)
    return data.publicUrl
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    setError('')

    let newAvatarUrl = avatarUrl
    if (avatarFile) {
      const uploaded = await uploadAvatar()
      if (!uploaded) { setSaving(false); return }
      newAvatarUrl = uploaded
      setAvatarUrl(uploaded)
    }

    const supabase = createClient()
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        display_name: profile.display_name || null,
        bio: profile.bio || null,
        mood: profile.mood || null,
        favorite_color: profile.favorite_color || null,
        profile_theme: profile.profile_theme,
        avatar_url: newAvatarUrl,
      })
      .eq('id', user.id)
    if (updateError) {
      setError('Could not save changes. Please try again.')
    } else {
      setAvatarFile(null)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
  }

  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="font-caveat text-[#888] text-xl" style={{ fontFamily: 'Caveat, cursive' }}>
          loading...
        </div>
      </div>
    )
  }

  if (!user) {
    router.push('/auth/login')
    return null
  }

  const username = user.user_metadata?.username ?? user.email?.split('@')[0] ?? 'you'
  const displayAvatar = avatarPreview || avatarUrl
  const avatarInitial = username.charAt(0).toUpperCase()

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 py-10 px-4">
        <div className="max-w-2xl mx-auto">
          <Link
            href={`/profile/${username}`}
            className="flex items-center gap-1 text-[#888] hover:text-[#FF4FA3] transition-colors font-nunito text-sm mb-6"
          >
            <span>←</span> back to profile
          </Link>

          <div className="text-center mb-8">
            <h1
              className="font-pacifico text-3xl text-[#3A0030]"
              style={{ fontFamily: 'Pacifico, cursive' }}
            >
              edit your profile
            </h1>
            <p
              className="font-caveat text-lg text-[#888] mt-1"
              style={{ fontFamily: 'Caveat, cursive' }}
            >
              make it yours ✦
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-2 mb-4 font-nunito text-sm">
              {error}
            </div>
          )}

          {saved && (
            <div className="bg-green-50 border border-green-200 text-green-600 rounded-lg px-4 py-2 mb-4 font-nunito text-sm">
              ✓ profile saved!
            </div>
          )}

          {/* Avatar upload */}
          <div className="bg-white rounded-2xl border-2 border-[#FFB6D9]/50 p-6 mb-5 flex items-center gap-6">
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-full border-4 border-[#FFB6D9] overflow-hidden bg-[#FF4FA3] flex items-center justify-center">
                {displayAvatar ? (
                  <img src={displayAvatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-pixel text-white text-3xl">{avatarInitial}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#FF4FA3] border-2 border-white flex items-center justify-center shadow-md hover:bg-[#e0398e] transition-colors"
                title="Upload photo"
              >
                <span style={{ fontSize: '14px' }}>📷</span>
              </button>
            </div>
            <div>
              <div className="font-pixel text-xs text-[#3A0030] mb-1" style={{ fontSize: '10px' }}>
                PROFILE PHOTO
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-outline-y2k text-xs py-1 px-4"
                style={{ fontSize: '11px' }}
              >
                {displayAvatar ? 'change photo' : 'upload photo'}
              </button>
              <div className="font-nunito text-xs text-[#888] mt-1">JPG, PNG or GIF · max 2MB</div>
              {avatarFile && (
                <div className="font-nunito text-xs text-[#FF4FA3] mt-1">
                  {avatarFile.name} — will be saved with profile
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="bg-white rounded-2xl border-2 border-[#FFB6D9]/50 p-6 space-y-4">
              <div>
                <label className="font-pixel text-xs text-[#3A0030] mb-1 block" style={{ fontSize: '10px' }}>
                  DISPLAY NAME
                </label>
                <input
                  type="text"
                  value={profile.display_name}
                  onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                  placeholder="your name or nickname"
                  className="input-y2k"
                  maxLength={50}
                />
              </div>

              <div>
                <label className="font-pixel text-xs text-[#3A0030] mb-1 block" style={{ fontSize: '10px' }}>
                  BIO
                </label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="tell people a little about yourself..."
                  className="input-y2k resize-none font-caveat"
                  rows={3}
                  style={{ fontFamily: 'Caveat, cursive', fontSize: '17px' }}
                  maxLength={160}
                />
                <div className="font-nunito text-xs text-[#888] text-right mt-1">
                  {profile.bio.length}/160
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-pixel text-xs text-[#3A0030] mb-1 block" style={{ fontSize: '10px' }}>
                    CURRENT MOOD
                  </label>
                  <input
                    type="text"
                    value={profile.mood}
                    onChange={(e) => setProfile({ ...profile, mood: e.target.value })}
                    placeholder="nostalgic, happy..."
                    className="input-y2k"
                    maxLength={30}
                  />
                </div>
                <div>
                  <label className="font-pixel text-xs text-[#3A0030] mb-1 block" style={{ fontSize: '10px' }}>
                    FAVORITE COLOR
                  </label>
                  <input
                    type="text"
                    value={profile.favorite_color}
                    onChange={(e) => setProfile({ ...profile, favorite_color: e.target.value })}
                    placeholder="soft pink, midnight blue..."
                    className="input-y2k"
                    maxLength={30}
                  />
                </div>
              </div>
            </div>

            {/* Theme picker */}
            <div className="bg-white rounded-2xl border-2 border-[#FFB6D9]/50 p-6">
              <div className="font-pixel text-xs text-[#3A0030] mb-4" style={{ fontSize: '10px' }}>
                PROFILE THEME
              </div>
              <div className="grid grid-cols-5 gap-2">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setProfile({ ...profile, profile_theme: t.id })}
                    className={`rounded-xl overflow-hidden border-2 transition-all ${
                      profile.profile_theme === t.id
                        ? 'border-[#FF4FA3] shadow-md scale-105'
                        : 'border-[#FFB6D9]/50 hover:border-[#FF4FA3]'
                    }`}
                    title={t.label}
                  >
                    <div className={`h-12 bg-gradient-to-br ${t.gradient}`} />
                    <div className="text-center py-1 font-nunito text-xs text-[#888]" style={{ fontSize: '8px' }}>
                      {t.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving || uploadingAvatar}
              className="btn-y2k w-full py-3 text-base"
            >
              {uploadingAvatar ? 'uploading photo...' : saving ? 'saving...' : 'save changes ✦'}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}
