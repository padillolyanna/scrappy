export const instant = false

import { connection } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin — Scrappy',
  robots: { index: false, follow: false },
}

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
    { label: 'Users', value: totalUsers ?? 0 },
    { label: 'Scrapbooks', value: totalScrapbooks ?? 0 },
    { label: 'Confessions', value: totalConfessions ?? 0 },
    { label: 'Pending review', value: pendingConfessions ?? 0, urgent: (pendingConfessions ?? 0) > 0 },
  ]

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="text-lg font-semibold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`bg-white rounded border p-4 ${stat.urgent ? 'border-amber-300' : 'border-gray-200'}`}
          >
            <div className="text-xs text-gray-500 mb-1">{stat.label}</div>
            <div className={`text-3xl font-bold ${stat.urgent ? 'text-amber-600' : 'text-gray-900'}`}>
              {stat.value}
            </div>
            {stat.urgent && (
              <div className="text-xs text-amber-600 mt-1">needs review</div>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-3 mb-6">
        <Link href="/admin/confessions" className="text-xs bg-white border border-gray-200 rounded px-3 py-1.5 text-gray-700 hover:border-gray-400 transition-colors">Confession moderation →</Link>
        <Link href="/admin/hangouts" className="text-xs bg-white border border-gray-200 rounded px-3 py-1.5 text-gray-700 hover:border-gray-400 transition-colors">Hangouts →</Link>
        <Link href="/admin/monetization" className="text-xs bg-green-50 border border-green-200 rounded px-3 py-1.5 text-green-700 hover:border-green-400 transition-colors font-medium">AdSense Readiness →</Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded border border-gray-200 p-5">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4">Recent signups</div>
          {recentUsers?.length ? (
            <div className="divide-y divide-gray-100">
              {recentUsers.map((u) => (
                <div key={u.username} className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-900">@{u.username}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(u.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No users yet.</p>
          )}
        </div>

        <div className="bg-white rounded border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Recent confessions</div>
            <Link href="/admin/confessions" className="text-xs text-blue-600 hover:underline">
              manage all →
            </Link>
          </div>
          {recentConfessions?.length ? (
            <div className="divide-y divide-gray-100">
              {recentConfessions.map((c) => (
                <div key={c.id} className="py-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-500">{c.category}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${c.is_approved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {c.is_approved ? 'approved' : 'pending'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">{c.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No confessions yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
