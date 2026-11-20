export const instant = false

import { connection } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import ConfessionActions from './ConfessionActions'

export default async function AdminConfessionsPage({
  searchParams,
}: PageProps<'/admin/confessions'>) {
  await connection()
  await requireAdmin()
  const supabase = await createClient()

  const params = await searchParams
  const filter = (params?.filter as string) ?? 'all'

  let query = supabase
    .from('confessions')
    .select('id, content, category, is_approved, is_anonymous, reaction_count, created_at')
    .order('created_at', { ascending: false })

  if (filter === 'pending') query = query.eq('is_approved', false)
  if (filter === 'approved') query = query.eq('is_approved', true)

  const { data: confessions } = await query.limit(50)

  const { count: pendingCount } = await supabase
    .from('confessions')
    .select('*', { count: 'exact', head: true })
    .eq('is_approved', false)

  const FILTERS = [
    { id: 'all', label: 'ALL' },
    { id: 'pending', label: `PENDING (${pendingCount ?? 0})` },
    { id: 'approved', label: 'APPROVED' },
  ]

  return (
    <div className="min-h-screen bg-[#FFF0F7] font-nunito">
      {/* Top bar */}
      <div className="bg-[#3A0030] text-[#FFB6D9] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="font-pixel text-xs text-[#FFB6D9]/60 hover:text-[#FFB6D9] transition-colors" style={{ fontSize: '12px' }}>
            ← dashboard
          </Link>
          <span className="font-pixel text-xs text-[#FFB6D9]/30" style={{ fontSize: '12px' }}>/</span>
          <span className="font-pixel text-xs text-[#FFB6D9]" style={{ fontSize: '12px' }}>CONFESSIONS</span>
        </div>
        <Link href="/" className="font-pixel text-xs text-[#FFB6D9]/60 hover:text-[#FFB6D9] transition-colors" style={{ fontSize: '12px' }}>
          view site
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="font-pacifico text-3xl text-[#3A0030]" style={{ fontFamily: 'Pacifico, cursive' }}>
              confession wall
            </h1>
            <p className="font-caveat text-lg text-[#888] mt-1" style={{ fontFamily: 'Caveat, cursive' }}>
              review and moderate community submissions
            </p>
          </div>
          {(pendingCount ?? 0) > 0 && (
            <div className="bg-yellow-100 border-2 border-yellow-300 rounded-xl px-4 py-2">
              <div className="font-pixel text-xs text-yellow-700" style={{ fontSize: '12px' }}>
                {pendingCount} confession{(pendingCount ?? 0) > 1 ? 's' : ''} need review
              </div>
            </div>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {FILTERS.map((f) => (
            <Link
              key={f.id}
              href={`/admin/confessions?filter=${f.id}`}
              className={`font-pixel text-xs px-4 py-2 rounded-full border-2 transition-all ${
                filter === f.id
                  ? 'bg-[#3A0030] border-[#3A0030] text-white'
                  : 'bg-white border-[#FFB6D9] text-[#3A0030] hover:border-[#3A0030]'
              }`}
              style={{ fontSize: '12px' }}
            >
              {f.label}
            </Link>
          ))}
        </div>

        {/* Confessions list */}
        {confessions?.length ? (
          <div className="space-y-3">
            {confessions.map((c) => (
              <div
                key={c.id}
                className={`bg-white rounded-xl border-2 p-5 ${
                  !c.is_approved ? 'border-yellow-300 bg-yellow-50/30' : 'border-[#FFB6D9]/50'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="font-pixel text-xs text-[#888] bg-[#FFB6D9]/20 px-2 py-0.5 rounded-full" style={{ fontSize: '12px' }}>
                        {c.category}
                      </span>
                      <span className={`font-pixel text-xs px-2 py-0.5 rounded-full border ${
                        c.is_approved
                          ? 'bg-green-50 border-green-200 text-green-700'
                          : 'bg-yellow-50 border-yellow-200 text-yellow-700'
                      }`} style={{ fontSize: '12px' }}>
                        {c.is_approved ? 'approved' : 'pending'}
                      </span>
                      <span className="font-pixel text-xs text-[#888]" style={{ fontSize: '12px' }}>
                        {c.is_anonymous ? 'anonymous' : 'public'}
                      </span>
                      <span className="font-nunito text-xs text-[#888]">
                        {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <p className="font-caveat text-lg text-[#3A0030] leading-snug" style={{ fontFamily: 'Caveat, cursive', fontSize: '17px' }}>
                      "{c.content}"
                    </p>
                    <div className="mt-2 font-nunito text-xs text-[#888]">
                      ♡ {c.reaction_count} reactions
                    </div>
                  </div>

                  {/* Actions */}
                  <ConfessionActions
                    id={c.id}
                    isApproved={c.is_approved}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="font-pixel text-2xl text-[#FFB6D9] mb-3">✦</div>
            <div className="font-caveat text-xl text-[#888]" style={{ fontFamily: 'Caveat, cursive' }}>
              no confessions {filter !== 'all' ? `with status "${filter}"` : ''} yet
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
