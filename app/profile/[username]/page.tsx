export const instant = false

import { createClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { SCRAPBOOK_COVERS } from '@/lib/types'
import ProfileEditButton from '@/components/profile/ProfileEditButton'

export default async function ProfilePage({ params }: PageProps<'/profile/[username]'>) {
  const { username } = await params
  const supabase = await createClient()
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, bio, mood, favorite_color, profile_theme, created_at')
    .eq('username', username)
    .single()

  if (!profile) return notFound()

  const isOwner = currentUser?.id === profile.id

  const { data: scrapbooks } = await supabase
    .from('scrapbooks')
    .select('id, title, cover_id, like_count, view_count, created_at, is_public')
    .eq('user_id', profile.id)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(12)

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Profile header */}
          <div className="bg-white rounded-2xl border-2 border-[#FFB6D9]/50 overflow-hidden mb-8">
            {/* Banner */}
            <div
              className={`h-28 bg-gradient-to-br ${
                profile.profile_theme === 'cyber-y2k'
                  ? 'from-purple-900 via-blue-900 to-purple-800'
                  : profile.profile_theme === 'indie-sleaze'
                  ? 'from-zinc-900 via-zinc-800 to-purple-900'
                  : profile.profile_theme === 'blue-dream'
                  ? 'from-blue-100 via-purple-50 to-blue-50'
                  : 'from-pink-200 via-pink-100 to-pink-50'
              } relative`}
            >
              <div className="absolute top-3 right-4 font-pixel text-xs text-[#3A0030]/30" style={{ fontSize: '14px' }}>
                ✦ ★ ♡
              </div>
            </div>

            {/* Avatar + Info */}
            <div className="px-6 pb-6">
              <div className="flex items-end gap-4 -mt-10 mb-4">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.username}
                    className="w-20 h-20 rounded-full border-4 border-white shadow-md object-cover"
                  />
                ) : (
                  <div
                    className="w-20 h-20 rounded-full border-4 border-white shadow-md bg-[#FF4FA3] flex items-center justify-center font-pixel text-white text-2xl"
                  >
                    {profile.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="pb-1 flex-1">
                  <div
                    className="font-pacifico text-2xl text-[#3A0030]"
                    style={{ fontFamily: 'Pacifico, cursive' }}
                  >
                    {profile.display_name || profile.username}
                  </div>
                  <div className="font-pixel text-xs text-[#888]" style={{ fontSize: '10px' }}>
                    @{profile.username}
                  </div>
                </div>
                <div className="pb-1 flex gap-2">
                  {isOwner && <ProfileEditButton username={profile.username} />}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href)
                    }}
                    className="btn-outline-y2k text-xs py-1 px-3"
                    style={{ fontSize: '10px' }}
                  >
                    share profile
                  </button>
                </div>
              </div>

              {profile.bio && (
                <div
                  className="font-caveat text-lg text-[#3A0030] mb-3"
                  style={{ fontFamily: 'Caveat, cursive', fontSize: '17px' }}
                >
                  {profile.bio}
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                {profile.mood && (
                  <div className="bg-[#FFF0A8] rounded-full px-3 py-1 font-nunito text-xs text-[#3A0030]">
                    mood: {profile.mood}
                  </div>
                )}
                {profile.favorite_color && (
                  <div className="bg-[#FFD6EC] rounded-full px-3 py-1 font-nunito text-xs text-[#3A0030]">
                    fav color: {profile.favorite_color}
                  </div>
                )}
                <div className="bg-[#D6EDFF] rounded-full px-3 py-1 font-nunito text-xs text-[#3A0030]">
                  joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
                <div className="bg-[#E8D6FF] rounded-full px-3 py-1 font-nunito text-xs text-[#3A0030]">
                  {scrapbooks?.length ?? 0} scrapbooks
                </div>
              </div>
            </div>
          </div>

          {/* Scrapbooks */}
          <div className="font-pixel text-xs text-[#3A0030] mb-4" style={{ fontSize: '12px' }}>
            SCRAPBOOKS BY @{profile.username.toUpperCase()}
          </div>

          {scrapbooks && scrapbooks.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {scrapbooks.map((sb) => {
                const cover = SCRAPBOOK_COVERS.find((c) => c.id === sb.cover_id)
                return (
                  <Link
                    key={sb.id}
                    href={`/scrapbook/${sb.id}`}
                    className="group bg-white rounded-xl border-2 border-[#FFB6D9]/40 overflow-hidden hover:border-[#FF4FA3] hover:shadow-md transition-all"
                  >
                    <div
                      className={`h-28 bg-gradient-to-br ${cover?.bg_gradient ?? 'from-pink-200 to-pink-100'} flex items-center justify-center`}
                    >
                      <span className="font-pixel text-3xl text-[#3A0030]/25">
                        {cover?.preview_symbol ?? '✦'}
                      </span>
                    </div>
                    <div className="p-3">
                      <div
                        className="font-caveat text-base text-[#3A0030] truncate"
                        style={{ fontFamily: 'Caveat, cursive', fontSize: '15px' }}
                      >
                        {sb.title || 'untitled'}
                      </div>
                      <div className="flex gap-2 mt-1">
                        <span className="font-nunito text-xs text-[#888]">♡ {sb.like_count || 0}</span>
                        <span className="font-nunito text-xs text-[#888]">◎ {sb.view_count || 0}</span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border-2 border-[#FFB6D9]/30">
              <div className="font-pixel text-4xl text-[#FFB6D9] mb-4">✦</div>
              <div
                className="font-caveat text-xl text-[#888]"
                style={{ fontFamily: 'Caveat, cursive' }}
              >
                no public scrapbooks yet ✦
              </div>
              {isOwner && (
                <Link href="/scrapbook/create" className="btn-y2k mt-4 inline-block">
                  create your first scrapbook
                </Link>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
