export const instant = false

import { connection } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

export default async function MySpacePage() {
  await connection()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [
    { data: profile },
    { data: scrapbooks, count: scrapbookCount },
    { data: confessions, count: confessionCount },
  ] = await Promise.all([
    supabase.from('profiles').select('username, display_name, is_admin').eq('id', user.id).single(),
    supabase.from('scrapbooks').select('id, title, cover_id, is_public, created_at, like_count').eq('user_id', user.id).order('created_at', { ascending: false }).limit(6),
    supabase.from('confessions').select('id, content, category, is_approved, created_at', { count: 'exact' }).eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
  ])

  const displayName = profile?.username ?? user.email?.split('@')[0] ?? 'you'

  return (
    <div className="flex flex-col min-h-screen bg-[#FFF0F7]">
      <Navbar />
      <main className="flex-1 py-10 px-4">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-1">
              <span className="font-pixel text-2xl text-[#FF4FA3]">✦</span>
              <h1 className="font-pacifico text-4xl text-[#3A0030]" style={{ fontFamily: 'Pacifico, cursive' }}>
                my space
              </h1>
            </div>
            <p className="font-caveat text-xl text-[#888] ml-10" style={{ fontFamily: 'Caveat, cursive' }}>
              welcome back, @{displayName} ✦
            </p>
            {profile?.is_admin && (
              <div className="ml-10 mt-2">
                <Link
                  href="/admin"
                  className="font-pixel text-xs bg-[#3A0030] text-[#FFB6D9] px-3 py-1 rounded-full hover:bg-[#5A0048] transition-colors"
                  style={{ fontSize: '9px' }}
                >
                  ADMIN DASHBOARD →
                </Link>
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
            {[
              { href: '/scrapbook/create', label: 'NEW SCRAPBOOK', symbol: '✦', color: 'bg-[#FFB6D9]/30 border-[#FF4FA3]' },
              { href: '/prompts', label: 'DAILY PROMPT', symbol: '★', color: 'bg-[#C9B6FF]/30 border-[#C9B6FF]' },
              { href: '/confessions', label: 'CONFESSIONS', symbol: '♡', color: 'bg-[#A8DFFF]/30 border-[#A8DFFF]' },
              { href: '/explore', label: 'EXPLORE', symbol: '◎', color: 'bg-[#FFF0A8]/50 border-[#FFD700]' },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={`${action.color} border-2 rounded-xl p-4 text-center transition-all hover:scale-105 hover:shadow-md`}
              >
                <div className="font-pixel text-2xl text-[#FF4FA3] mb-1">{action.symbol}</div>
                <div className="font-pixel text-xs text-[#3A0030]" style={{ fontSize: '9px' }}>{action.label}</div>
              </Link>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* My Scrapbooks */}
            <div className="bg-white rounded-xl border-2 border-[#FFB6D9]/50 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="font-pixel text-xs text-[#3A0030]" style={{ fontSize: '10px' }}>
                  MY SCRAPBOOKS ({scrapbookCount ?? 0})
                </div>
                <Link href="/scrapbook/create" className="font-pixel text-xs text-[#FF4FA3] hover:underline" style={{ fontSize: '9px' }}>
                  + new
                </Link>
              </div>
              {scrapbooks?.length ? (
                <div className="space-y-3">
                  {scrapbooks.map((sb) => (
                    <div key={sb.id} className="flex items-center justify-between py-2 border-b border-[#FFB6D9]/20 last:border-0">
                      <div>
                        <div className="font-caveat text-base text-[#3A0030]" style={{ fontFamily: 'Caveat, cursive' }}>
                          {sb.title || 'untitled'}
                        </div>
                        <div className="font-pixel text-xs text-[#888]" style={{ fontSize: '8px' }}>
                          {sb.is_public ? 'public' : 'private'} · {new Date(sb.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                      <Link
                        href={`/scrapbook/${sb.id}`}
                        className="font-pixel text-xs text-[#FF4FA3] hover:underline"
                        style={{ fontSize: '8px' }}
                      >
                        view →
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="font-caveat text-[#888] text-lg" style={{ fontFamily: 'Caveat, cursive' }}>
                    no scrapbooks yet
                  </div>
                  <Link href="/scrapbook/create" className="btn-y2k mt-3 inline-block text-xs py-1.5 px-4">
                    create your first one ✦
                  </Link>
                </div>
              )}
            </div>

            {/* My Confessions */}
            <div className="bg-white rounded-xl border-2 border-[#FFB6D9]/50 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="font-pixel text-xs text-[#3A0030]" style={{ fontSize: '10px' }}>
                  MY CONFESSIONS ({confessionCount ?? 0})
                </div>
                <Link href="/confessions" className="font-pixel text-xs text-[#FF4FA3] hover:underline" style={{ fontSize: '9px' }}>
                  + new
                </Link>
              </div>
              {confessions?.length ? (
                <div className="space-y-3">
                  {confessions.map((c) => (
                    <div key={c.id} className="py-2 border-b border-[#FFB6D9]/20 last:border-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-pixel text-xs text-[#888]" style={{ fontSize: '8px' }}>{c.category}</span>
                        <span
                          className={`font-pixel text-xs px-2 py-0.5 rounded-full ${c.is_approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
                          style={{ fontSize: '8px' }}
                        >
                          {c.is_approved ? 'approved' : 'pending'}
                        </span>
                      </div>
                      <p className="font-nunito text-xs text-[#666] line-clamp-2">{c.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="font-caveat text-[#888] text-lg" style={{ fontFamily: 'Caveat, cursive' }}>
                    you haven&apos;t confessed yet
                  </div>
                  <Link href="/confessions" className="btn-outline-y2k mt-3 inline-block text-xs py-1.5 px-4">
                    post a confession ✦
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
