export const instant = false

import { connection } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'

export default async function AdminDashboard() {
  await connection()
  await requireAdmin()
  const supabase = await createClient()

  const [
    { count: totalUsers },
    { count: totalScrapbooks },
    { count: totalConfessions },
    { count: pendingConfessions },
    { data: recentUsers },
    { data: recentConfessions },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('scrapbooks').select('*', { count: 'exact', head: true }),
    supabase.from('confessions').select('*', { count: 'exact', head: true }),
    supabase.from('confessions').select('*', { count: 'exact', head: true }).eq('is_approved', false),
    supabase.from('profiles').select('username, created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('confessions').select('id, content, category, is_approved, created_at').order('created_at', { ascending: false }).limit(5),
  ])

  const stats = [
    { label: 'TOTAL USERS', value: totalUsers ?? 0, color: 'bg-[#FFB6D9]/30 border-[#FF4FA3]' },
    { label: 'SCRAPBOOKS', value: totalScrapbooks ?? 0, color: 'bg-[#C9B6FF]/30 border-[#C9B6FF]' },
    { label: 'CONFESSIONS', value: totalConfessions ?? 0, color: 'bg-[#A8DFFF]/30 border-[#A8DFFF]' },
    { label: 'PENDING REVIEW', value: pendingConfessions ?? 0, color: 'bg-[#FFF0A8]/50 border-[#FFD700]', urgent: (pendingConfessions ?? 0) > 0 },
  ]

  return (
    <div className="min-h-screen bg-[#FFF0F7] font-nunito">
      {/* Top bar */}
      <div className="bg-[#3A0030] text-[#FFB6D9] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-pacifico text-xl text-glitter" style={{ fontFamily: 'Pacifico, cursive' }}>
            SCRAPPY
          </Link>
          <span className="font-pixel text-xs text-[#FFB6D9]/50" style={{ fontSize: '12px' }}>/ ADMIN</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/admin/confessions" className="font-pixel text-xs text-[#FFB6D9] hover:text-white transition-colors" style={{ fontSize: '12px' }}>
            CONFESSIONS
          </Link>
          <Link href="/admin/hangouts" className="font-pixel text-xs text-[#FFB6D9] hover:text-white transition-colors" style={{ fontSize: '12px' }}>
            HANGOUTS
          </Link>
          <Link href="/" className="font-pixel text-xs text-[#FFB6D9]/60 hover:text-[#FFB6D9] transition-colors" style={{ fontSize: '12px' }}>
            VIEW SITE
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="font-pacifico text-3xl text-[#3A0030]" style={{ fontFamily: 'Pacifico, cursive' }}>
            admin dashboard
          </h1>
          <p className="font-caveat text-lg text-[#888] mt-1" style={{ fontFamily: 'Caveat, cursive' }}>
            overview of SCRAPPY activity
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`${stat.color} border-2 rounded-xl p-5 ${stat.urgent ? 'animate-pulse-glow' : ''}`}
            >
              <div className="font-pixel text-xs text-[#888] mb-2" style={{ fontSize: '12px' }}>{stat.label}</div>
              <div className="font-pacifico text-4xl text-[#3A0030]" style={{ fontFamily: 'Pacifico, cursive' }}>
                {stat.value}
              </div>
              {stat.urgent && (
                <div className="font-pixel text-xs text-[#D4006E] mt-1" style={{ fontSize: '12px' }}>needs review</div>
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent users */}
          <div className="bg-white rounded-xl border-2 border-[#FFB6D9]/50 p-5">
            <div className="font-pixel text-xs text-[#3A0030] mb-4" style={{ fontSize: '12px' }}>RECENT SIGNUPS</div>
            {recentUsers?.length ? (
              <div className="space-y-2">
                {recentUsers.map((u) => (
                  <div key={u.username} className="flex items-center justify-between py-2 border-b border-[#FFB6D9]/20 last:border-0">
                    <span className="font-nunito text-sm text-[#3A0030] font-bold">@{u.username}</span>
                    <span className="font-nunito text-xs text-[#888]">
                      {new Date(u.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="font-caveat text-[#888] text-center py-4" style={{ fontFamily: 'Caveat, cursive' }}>
                no users yet
              </div>
            )}
          </div>

          {/* Recent confessions */}
          <div className="bg-white rounded-xl border-2 border-[#FFB6D9]/50 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="font-pixel text-xs text-[#3A0030]" style={{ fontSize: '12px' }}>RECENT CONFESSIONS</div>
              <Link href="/admin/confessions" className="font-pixel text-xs text-[#FF4FA3] hover:underline" style={{ fontSize: '12px' }}>
                manage all →
              </Link>
            </div>
            {recentConfessions?.length ? (
              <div className="space-y-3">
                {recentConfessions.map((c) => (
                  <div key={c.id} className="py-2 border-b border-[#FFB6D9]/20 last:border-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-pixel text-xs text-[#888]" style={{ fontSize: '12px' }}>{c.category}</span>
                      <span className={`font-pixel text-xs px-2 py-0.5 rounded-full ${c.is_approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`} style={{ fontSize: '12px' }}>
                        {c.is_approved ? 'approved' : 'pending'}
                      </span>
                    </div>
                    <p className="font-nunito text-xs text-[#666] line-clamp-2">{c.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="font-caveat text-[#888] text-center py-4" style={{ fontFamily: 'Caveat, cursive' }}>
                no confessions yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
